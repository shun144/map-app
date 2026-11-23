import {
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { AddLayerObject, GeoJSONSource, MapMouseEvent } from 'maplibre-gl'
import { LngLat } from '../lng-lat'
import type { MapFactory, MapController } from '../map-controller'
import type {
  BaseLayerDefinition,
  MapFeature,
  MapPoint,
  OverlayerAppearance,
  OverlayerDefinition,
  Viewport,
} from '../types'

// MapLibre 専用のコードはこのフォルダの外へ出さない（ADR 0002, ESLint で強制）

/*
 * MapLibre v6 は Worker を「自分のファイルの隣（import.meta.url 基準）」に探す。
 * Vite の依存事前バンドル（dev）や本番バンドルで本体が移動すると Worker が 404 になるため、
 * Vite にアセットとして配信させた URL を明示的に渡す。
 */
setWorkerUrl(maplibreWorkerUrl)

type PaintProperty = Parameters<MapLibreMap['setPaintProperty']>[1]
type GeoJsonData = Parameters<GeoJSONSource['setData']>[0]

function convertPointsToGeoJson(points: ReadonlyArray<MapPoint>): GeoJsonData {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lngLat.lng, point.lngLat.lat],
      },
      properties: point.properties,
    })),
  }
}

const BASE_LAYER_SOURCE_ID = 'baseLayer'
const BASE_LAYER_STYLE_LAYER_ID = 'baseLayer'

const getSourceIdOfOverlayer = (overlayerId: string) =>
  `overlayer:${overlayerId}`

/** 面を塗りと輪郭の2枚に分けるのは、MapLibre の fill スタイルレイヤーでは輪郭線の太さを指定できないため */
function getStyleLayerIdsOfOverlayer(
  overlayerDefinition: OverlayerDefinition,
): Array<string> {
  const styleLayerIdPrefix = `overlayer:${overlayerDefinition.id}`
  return overlayerDefinition.geometryKind === 'polygon'
    ? [`${styleLayerIdPrefix}:fill`, `${styleLayerIdPrefix}:outline`]
    : [styleLayerIdPrefix]
}

function createStyleLayersForOverlayer(
  overlayerDefinition: OverlayerDefinition,
  overlayerAppearance: OverlayerAppearance,
): Array<AddLayerObject> {
  const overlayerSourceId = getSourceIdOfOverlayer(overlayerDefinition.id)
  const visibility = overlayerAppearance.visible ? 'visible' : 'none'
  const [mainStyleLayerId, outlineStyleLayerId] =
    getStyleLayerIdsOfOverlayer(overlayerDefinition)

  switch (overlayerDefinition.geometryKind) {
    case 'point':
      return [
        {
          id: mainStyleLayerId,
          type: 'circle',
          source: overlayerSourceId,
          layout: { visibility },
          paint: {
            'circle-radius': 7,
            'circle-color': overlayerDefinition.color,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-opacity': overlayerAppearance.opacity,
            'circle-stroke-opacity': overlayerAppearance.opacity,
          },
        },
      ]
    case 'line':
      return [
        {
          id: mainStyleLayerId,
          type: 'line',
          source: overlayerSourceId,
          layout: { visibility, 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': overlayerDefinition.color,
            'line-width': 4,
            'line-opacity': overlayerAppearance.opacity,
          },
        },
      ]
    case 'polygon':
      return [
        {
          id: mainStyleLayerId,
          type: 'fill',
          source: overlayerSourceId,
          layout: { visibility },
          paint: {
            'fill-color': overlayerDefinition.color,
            'fill-opacity': overlayerAppearance.opacity * 0.4,
          },
        },
        {
          id: outlineStyleLayerId,
          type: 'line',
          source: overlayerSourceId,
          layout: { visibility },
          paint: {
            'line-color': overlayerDefinition.color,
            'line-width': 2,
            'line-opacity': overlayerAppearance.opacity,
          },
        },
      ]
  }
}

export const createMapLibreMap: MapFactory = (
  container,
  { initialViewport },
) => {
  const map = new MapLibreMap({
    container,
    style: { version: 8, sources: {}, layers: [] },
    center: [initialViewport.center.lng, initialViewport.center.lat],
    zoom: initialViewport.zoom,
  })
  map.addControl(new NavigationControl(), 'bottom-right')
  map.addControl(new ScaleControl(), 'bottom-left')

  /*
   * スタイル読み込み完了前に addSource 等を呼ぶと例外になるため、
   * 完了までの操作はキューに積んで後から順に実行する。
   */
  let styleLoaded = false
  const operationsWaitingForStyleLoad: Array<() => void> = []
  const runAfterStyleLoaded = (operationOnMap: () => void) => {
    if (styleLoaded) {
      operationOnMap()
      return
    }
    operationsWaitingForStyleLoad.push(operationOnMap)
  }
  map.once('load', () => {
    styleLoaded = true
    operationsWaitingForStyleLoad
      .splice(0)
      .forEach((operationOnMap) => operationOnMap())
  })

  /** MapLibre のスタイルレイヤーからは定義（ラベルなど）を逆引きできないので、自前で持つ。順序は下→上 */
  const overlayerDefinitionsById = new Map<string, OverlayerDefinition>()
  let overlayerOrder: Array<string> = []
  /** addOverlayer より先に setOverlayerPoints が呼ばれても点を失わないよう、渡された点を覚えておく */
  const pointsByOverlayerId = new Map<string, ReadonlyArray<MapPoint>>()

  const findLowestOverlayerStyleLayerId = (): string | undefined => {
    const lowestOverlayerId = overlayerOrder.at(0)
    if (!lowestOverlayerId) return undefined
    const overlayerDefinition = overlayerDefinitionsById.get(lowestOverlayerId)
    if (!overlayerDefinition) return undefined
    return getStyleLayerIdsOfOverlayer(overlayerDefinition)[0]
  }

  const readViewportFromMap = (): Viewport => {
    // 地図を東西に何周も動かすと経度が -180〜180 の外に出るので、wrap で範囲内に戻してから LngLat にする
    const center = map.getCenter().wrap()
    return {
      center: LngLat.parse({ lng: center.lng, lat: center.lat }),
      zoom: map.getZoom(),
    }
  }

  const listClickableStyleLayerIds = () =>
    [...overlayerDefinitionsById.values()]
      .flatMap(getStyleLayerIdsOfOverlayer)
      .filter((styleLayerId) => map.getLayer(styleLayerId))

  const findFeatureUnderPointer = (event: MapMouseEvent): MapFeature | null => {
    const styleLayerIds = listClickableStyleLayerIds()
    if (styleLayerIds.length === 0) return null
    const featureUnderPointer = map
      .queryRenderedFeatures(event.point, { layers: styleLayerIds })
      .at(0)
    if (!featureUnderPointer) return null
    const overlayerId = featureUnderPointer.source.replace(/^overlayer:/, '')
    const overlayerDefinition = overlayerDefinitionsById.get(overlayerId)
    if (!overlayerDefinition) return null
    return {
      overlayerId,
      overlayerLabel: overlayerDefinition.label,
      properties: { ...featureUnderPointer.properties },
    }
  }

  // クリックできる場所だと分かるように、地物の上ではカーソルを変える
  map.on('mousemove', (event) => {
    map.getCanvas().style.cursor = findFeatureUnderPointer(event)
      ? 'pointer'
      : ''
  })

  const mapController: MapController = {
    getViewport: readViewportFromMap,

    setViewport: (viewport) => {
      map.easeTo({
        center: [viewport.center.lng, viewport.center.lat],
        zoom: viewport.zoom,
      })
    },

    setBaseLayer: (baseLayer: BaseLayerDefinition) =>
      runAfterStyleLoaded(() => {
        if (map.getLayer(BASE_LAYER_STYLE_LAYER_ID))
          map.removeLayer(BASE_LAYER_STYLE_LAYER_ID)
        if (map.getSource(BASE_LAYER_SOURCE_ID))
          map.removeSource(BASE_LAYER_SOURCE_ID)
        map.addSource(BASE_LAYER_SOURCE_ID, {
          type: 'raster',
          tiles: [baseLayer.tileUrl],
          tileSize: 256,
          maxzoom: baseLayer.maxZoom,
          attribution: baseLayer.attribution,
        })
        // 後から差し替えたベースレイヤーがオーバーレイヤーを覆い隠さないよう、最初のオーバーレイヤーの下に差し込む
        map.addLayer(
          {
            id: BASE_LAYER_STYLE_LAYER_ID,
            type: 'raster',
            source: BASE_LAYER_SOURCE_ID,
          },
          findLowestOverlayerStyleLayerId(),
        )
      }),

    addOverlayer: (overlayerDefinition, overlayerAppearance) =>
      runAfterStyleLoaded(() => {
        if (overlayerDefinitionsById.has(overlayerDefinition.id)) return
        map.addSource(getSourceIdOfOverlayer(overlayerDefinition.id), {
          type: 'geojson',
          data:
            overlayerDefinition.dataUrl ??
            convertPointsToGeoJson(
              pointsByOverlayerId.get(overlayerDefinition.id) ?? [],
            ),
        })
        createStyleLayersForOverlayer(
          overlayerDefinition,
          overlayerAppearance,
        ).forEach((styleLayer) => map.addLayer(styleLayer))
        overlayerDefinitionsById.set(
          overlayerDefinition.id,
          overlayerDefinition,
        )
        overlayerOrder = [...overlayerOrder, overlayerDefinition.id]
      }),

    removeOverlayer: (overlayerId) =>
      runAfterStyleLoaded(() => {
        const overlayerDefinition = overlayerDefinitionsById.get(overlayerId)
        if (!overlayerDefinition) return
        getStyleLayerIdsOfOverlayer(overlayerDefinition).forEach(
          (styleLayerId) => {
            if (map.getLayer(styleLayerId)) map.removeLayer(styleLayerId)
          },
        )
        map.removeSource(getSourceIdOfOverlayer(overlayerId))
        overlayerDefinitionsById.delete(overlayerId)
        overlayerOrder = overlayerOrder.filter((id) => id !== overlayerId)
      }),

    updateOverlayerAppearance: (overlayerId, overlayerAppearance) =>
      runAfterStyleLoaded(() => {
        const overlayerDefinition = overlayerDefinitionsById.get(overlayerId)
        if (!overlayerDefinition) return
        // スタイルレイヤーを作り直すと GeoJSON の再取得でちらつくため、変わりうるプロパティだけを書き換える
        createStyleLayersForOverlayer(
          overlayerDefinition,
          overlayerAppearance,
        ).forEach((styleLayer) => {
          const hasLayoutAndPaint =
            'layout' in styleLayer && 'paint' in styleLayer
          if (!hasLayoutAndPaint) return
          map.setLayoutProperty(
            styleLayer.id,
            'visibility',
            overlayerAppearance.visible ? 'visible' : 'none',
          )
          Object.entries(styleLayer.paint ?? {})
            .filter(([paintPropertyName]) =>
              paintPropertyName.endsWith('opacity'),
            )
            .forEach(([paintPropertyName, paintPropertyValue]) =>
              map.setPaintProperty(
                styleLayer.id,
                paintPropertyName as PaintProperty,
                paintPropertyValue,
              ),
            )
        })
      }),

    setOverlayerOrder: (overlayerIds) =>
      runAfterStyleLoaded(() => {
        // 下から順に最上位へ移動していくと、最終的に指定どおりの順になる
        overlayerIds.forEach((overlayerId) => {
          const overlayerDefinition = overlayerDefinitionsById.get(overlayerId)
          if (!overlayerDefinition) return
          getStyleLayerIdsOfOverlayer(overlayerDefinition).forEach(
            (styleLayerId) => map.moveLayer(styleLayerId),
          )
        })
        overlayerOrder = overlayerIds.filter((id) =>
          overlayerDefinitionsById.has(id),
        )
      }),

    setOverlayerPoints: (overlayerId, points) => {
      pointsByOverlayerId.set(overlayerId, points)
      runAfterStyleLoaded(() => {
        // ソースがまだないときは、addOverlayer が pointsByOverlayerId から点を読んで作る
        map
          .getSource<GeoJSONSource>(getSourceIdOfOverlayer(overlayerId))
          ?.setData(convertPointsToGeoJson(points))
      })
    },

    subscribeToFeatureClick: (listener) => {
      const notifyFeatureClick = (event: MapMouseEvent) =>
        listener(findFeatureUnderPointer(event))
      map.on('click', notifyFeatureClick)
      return () => map.off('click', notifyFeatureClick)
    },

    subscribeToRightClick: (listener) => {
      const notifyRightClick = (event: MapMouseEvent) => {
        event.originalEvent.preventDefault()
        const wrappedLngLat = event.lngLat.wrap()
        listener({
          lngLat: LngLat.parse({
            lng: wrappedLngLat.lng,
            lat: wrappedLngLat.lat,
          }),
          pointInMap: { x: event.point.x, y: event.point.y },
        })
      }
      map.on('contextmenu', notifyRightClick)
      return () => map.off('contextmenu', notifyRightClick)
    },

    subscribeToMoveStart: (listener) => {
      map.on('movestart', listener)
      return () => map.off('movestart', listener)
    },

    /**
     * レイヤーやソースを1つずつ消さないのは、map.remove() がレイヤー・ソースを破棄し、
     * map.on で登録したイベントもすべて外すため
     */
    destroy: () => map.remove(),
  }

  return mapController
}
