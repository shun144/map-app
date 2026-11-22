import {
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { AddLayerObject, MapMouseEvent } from 'maplibre-gl'
import type { MapFactory, MapController } from '../map-controller'
import type {
  BasemapDefinition,
  MapFeature,
  OverlayAppearance,
  OverlayDefinition,
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

const BASEMAP_SOURCE_ID = 'basemap'
const BASEMAP_LAYER_ID = 'basemap'

const overlaySourceId = (overlayId: string) => `overlay:${overlayId}`

/** 面を塗りと輪郭の2枚に分けるのは、MapLibre の fill レイヤーでは輪郭線の太さを指定できないため */
function overlayLayerIds(definition: OverlayDefinition): Array<string> {
  const base = `overlay:${definition.id}`
  return definition.geometryKind === 'polygon'
    ? [`${base}:fill`, `${base}:outline`]
    : [base]
}

function buildOverlayLayers(
  definition: OverlayDefinition,
  appearance: OverlayAppearance,
): Array<AddLayerObject> {
  const source = overlaySourceId(definition.id)
  const visibility = appearance.visible ? 'visible' : 'none'
  const [first, second] = overlayLayerIds(definition)

  switch (definition.geometryKind) {
    case 'point':
      return [
        {
          id: first,
          type: 'circle',
          source,
          layout: { visibility },
          paint: {
            'circle-radius': 7,
            'circle-color': definition.color,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-opacity': appearance.opacity,
            'circle-stroke-opacity': appearance.opacity,
          },
        },
      ]
    case 'line':
      return [
        {
          id: first,
          type: 'line',
          source,
          layout: { visibility, 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': definition.color,
            'line-width': 4,
            'line-opacity': appearance.opacity,
          },
        },
      ]
    case 'polygon':
      return [
        {
          id: first,
          type: 'fill',
          source,
          layout: { visibility },
          paint: {
            'fill-color': definition.color,
            'fill-opacity': appearance.opacity * 0.4,
          },
        },
        {
          id: second,
          type: 'line',
          source,
          layout: { visibility },
          paint: {
            'line-color': definition.color,
            'line-width': 2,
            'line-opacity': appearance.opacity,
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
  let loaded = false
  const pending: Array<() => void> = []
  const whenReady = (operation: () => void) => {
    if (loaded) operation()
    else pending.push(operation)
  }
  map.once('load', () => {
    loaded = true
    pending.splice(0).forEach((operation) => operation())
  })

  /** MapLibre のレイヤーからは定義（ラベルなど）を逆引きできないので、自前で持つ。順序は下→上 */
  const overlays = new Map<string, OverlayDefinition>()
  let overlayOrder: Array<string> = []

  const firstOverlayLayerId = (): string | undefined => {
    const first = overlayOrder.at(0)
    const definition = first ? overlays.get(first) : undefined
    return definition ? overlayLayerIds(definition)[0] : undefined
  }

  const readViewport = (): Viewport => {
    const center = map.getCenter()
    return { center: { lng: center.lng, lat: center.lat }, zoom: map.getZoom() }
  }

  const clickableLayerIds = () =>
    [...overlays.values()]
      .flatMap(overlayLayerIds)
      .filter((layerId) => map.getLayer(layerId))

  const findFeature = (event: MapMouseEvent): MapFeature | null => {
    const layers = clickableLayerIds()
    if (layers.length === 0) return null
    const hit = map.queryRenderedFeatures(event.point, { layers }).at(0)
    if (!hit) return null
    const overlayId = hit.source.replace(/^overlay:/, '')
    const definition = overlays.get(overlayId)
    if (!definition) return null
    return {
      overlayId,
      overlayLabel: definition.label,
      properties: { ...hit.properties },
    }
  }

  // クリックできる場所だと分かるように、地物の上ではカーソルを変える
  map.on('mousemove', (event) => {
    map.getCanvas().style.cursor = findFeature(event) ? 'pointer' : ''
  })

  const mapController: MapController = {
    getViewport: readViewport,

    setViewport: (viewport) => {
      map.easeTo({
        center: [viewport.center.lng, viewport.center.lat],
        zoom: viewport.zoom,
      })
    },

    setBasemap: (basemap: BasemapDefinition) =>
      whenReady(() => {
        if (map.getLayer(BASEMAP_LAYER_ID)) map.removeLayer(BASEMAP_LAYER_ID)
        if (map.getSource(BASEMAP_SOURCE_ID))
          map.removeSource(BASEMAP_SOURCE_ID)
        map.addSource(BASEMAP_SOURCE_ID, {
          type: 'raster',
          tiles: [basemap.tileUrl],
          tileSize: 256,
          maxzoom: basemap.maxZoom,
          attribution: basemap.attribution,
        })
        // 後から差し替えたベースマップがオーバーレイを覆い隠さないよう、最初のオーバーレイの下に差し込む
        map.addLayer(
          { id: BASEMAP_LAYER_ID, type: 'raster', source: BASEMAP_SOURCE_ID },
          firstOverlayLayerId(),
        )
      }),

    addOverlay: (definition, appearance) =>
      whenReady(() => {
        if (overlays.has(definition.id)) return
        map.addSource(overlaySourceId(definition.id), {
          type: 'geojson',
          data: definition.dataUrl,
        })
        buildOverlayLayers(definition, appearance).forEach((layer) =>
          map.addLayer(layer),
        )
        overlays.set(definition.id, definition)
        overlayOrder = [...overlayOrder, definition.id]
      }),

    removeOverlay: (overlayId) =>
      whenReady(() => {
        const definition = overlays.get(overlayId)
        if (!definition) return
        overlayLayerIds(definition).forEach((layerId) => {
          if (map.getLayer(layerId)) map.removeLayer(layerId)
        })
        map.removeSource(overlaySourceId(overlayId))
        overlays.delete(overlayId)
        overlayOrder = overlayOrder.filter((id) => id !== overlayId)
      }),

    updateOverlay: (overlayId, appearance) =>
      whenReady(() => {
        const definition = overlays.get(overlayId)
        if (!definition) return
        // レイヤーを作り直すと GeoJSON の再取得でちらつくため、変わりうるプロパティだけを書き換える
        buildOverlayLayers(definition, appearance).forEach((layer) => {
          if (!('layout' in layer) || !('paint' in layer)) return
          map.setLayoutProperty(
            layer.id,
            'visibility',
            appearance.visible ? 'visible' : 'none',
          )
          Object.entries(layer.paint ?? {})
            .filter(([property]) => property.endsWith('opacity'))
            .forEach(([property, value]) =>
              map.setPaintProperty(layer.id, property as PaintProperty, value),
            )
        })
      }),

    setOverlayOrder: (overlayIds) =>
      whenReady(() => {
        // 下から順に最上位へ移動していくと、最終的に指定どおりの順になる
        overlayIds.forEach((overlayId) => {
          const definition = overlays.get(overlayId)
          if (!definition) return
          overlayLayerIds(definition).forEach((layerId) =>
            map.moveLayer(layerId),
          )
        })
        overlayOrder = overlayIds.filter((id) => overlays.has(id))
      }),

    onFeatureClick: (listener) => {
      const handler = (event: MapMouseEvent) => listener(findFeature(event))
      map.on('click', handler)
      return () => map.off('click', handler)
    },

    destroy: () => map.remove(),
  }

  return mapController
}
