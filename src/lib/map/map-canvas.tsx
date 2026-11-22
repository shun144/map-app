import { useEffect, useRef } from 'react'
import { useMapContext } from './map-provider'
import type { Viewport } from './types'

type MapCanvasProps = {
  /** 地図生成時にだけ使う。以降の変更は無視する（ADR 0001） */
  initialViewport: Viewport
  className?: string
}

/** 地図を描く DOM を用意し、マウント時に MapPort を生成して MapProvider に登録する */
export function MapCanvas({ initialViewport, className }: MapCanvasProps) {
  const { createMap, registerPort } = useMapContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const initialViewportRef = useRef(initialViewport)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const port = createMap(container, {
      initialViewport: initialViewportRef.current,
    })
    registerPort(port)
    return () => {
      registerPort(null)
      port.destroy()
    }
  }, [createMap, registerPort])

  /*
   * 地図ライブラリは自分のクラス（例: .maplibregl-map { position: relative }）をコンテナに付ける。
   * それは @layer の外の CSS なので、Tailwind（@layer utilities）の absolute などより常に優先され、
   * 同じ要素にレイアウト用クラスを付けると打ち消されて高さ 0 になる。
   * そこで、レイアウトは外側の div に任せ、地図には内側の div を渡してインラインで 100% にする。
   */
  return (
    <div className={className}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
