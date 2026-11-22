import { useEffect, useRef } from 'react'
import { useMapContext } from './map-provider'
import type { Viewport } from './types'

type Props = {
  /** 生成後の変更を地図へ反映しないのは、保存のたびに地図を動かす更新ループを避けるため（ADR 0001） */
  initialViewport: Viewport
  className?: string
}

export function MapCanvas({ initialViewport, className }: Props) {
  const { createMap, setMapController } = useMapContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const initialViewportRef = useRef(initialViewport)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const mapController = createMap(container, {
      initialViewport: initialViewportRef.current,
    })
    setMapController(mapController)
    return () => {
      setMapController(null)
      mapController.destroy()
    }
  }, [createMap, setMapController])

  return (
    <div className={className}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
