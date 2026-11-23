import { ESTATE_OVERLAYER_ID } from '#/shared/map/catalog/overlayer-catalog'
import type { Layers } from '#/shared/map/types'

/**
 * 地図画面のレイヤー構成から、物件の位置の地図で描くレイヤー構成を作る（元のレイヤー構成は書き換えない）。
 * 物件レイヤーだけは、地図画面の設定に関係なく、表示・不透明度 100%・いちばん手前にする。
 * 物件の位置の地図は、その物件の位置を確かめるための地図なので、物件ポイントが隠れたり消えたりしないようにするため。
 */
export function updateLayersToShowEstateOnTop(layers: Layers): Layers {
  const overlayersOtherThanEstate = layers.overlayers.filter(
    (overlayer) => overlayer.id !== ESTATE_OVERLAYER_ID,
  )
  return {
    ...layers,
    overlayers: [
      ...overlayersOtherThanEstate,
      { id: ESTATE_OVERLAYER_ID, appearance: { visible: true, opacity: 1 } },
    ],
  }
}
