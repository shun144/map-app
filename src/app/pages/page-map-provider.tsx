import { MapProvider } from '#/lib/map/map-provider'
import { createMapLibreMap } from '#/lib/map/maplibre/maplibre-adapter'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

/**
 * 地図を使う画面ごとに、その画面の中身を囲んで置く。
 * アプリ全体で1つにすると、画面を切り替えた直後の描画で、新しい画面のフックが
 * 前の画面の地図（このあと破棄される地図）を受け取り、破棄された地図に描こうとして例外になるため。
 */
export function PageMapProvider({ children }: Props) {
  return <MapProvider createMap={createMapLibreMap}>{children}</MapProvider>
}
