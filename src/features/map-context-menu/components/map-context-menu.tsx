import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMapController } from '#/lib/map/map-provider'
import type { MapRightClick } from '#/lib/map/types'

/** 地図の右クリックで、右クリックした位置に開くメニュー。地図と同じ位置・大きさの要素の中に置く */
export function MapContextMenu() {
  const mapController = useMapController()
  /** null のときはメニューを閉じている */
  const [openedRightClick, setOpenedRightClick] =
    useState<MapRightClick | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapController) return
    const unsubscribeRightClick =
      mapController.subscribeToRightClick(setOpenedRightClick)
    const unsubscribeMoveStart = mapController.subscribeToMoveStart(() =>
      setOpenedRightClick(null),
    )
    return () => {
      unsubscribeRightClick()
      unsubscribeMoveStart()
    }
  }, [mapController])

  useEffect(() => {
    if (!openedRightClick) return
    const closeMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenedRightClick(null)
    }
    // 右クリックで別の位置に開き直すときも、いったんここで閉じてから右クリックの購読で開き直す
    const closeMenuOnPointerDownOutside = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return
      setOpenedRightClick(null)
    }
    document.addEventListener('keydown', closeMenuOnEscape)
    document.addEventListener('pointerdown', closeMenuOnPointerDownOutside)
    return () => {
      document.removeEventListener('keydown', closeMenuOnEscape)
      document.removeEventListener('pointerdown', closeMenuOnPointerDownOutside)
    }
  }, [openedRightClick])

  if (!openedRightClick) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      className="absolute z-10 min-w-40 rounded-md bg-white py-1 text-sm text-slate-800 shadow-lg ring-1 ring-slate-200"
      style={{
        left: openedRightClick.pointInMap.x,
        top: openedRightClick.pointInMap.y,
      }}
    >
      <Link
        to="/estate/new"
        search={{
          lng: openedRightClick.lngLat.lng,
          lat: openedRightClick.lngLat.lat,
        }}
        role="menuitem"
        className="block px-4 py-2 hover:bg-slate-100"
      >
        ここに物件を作成
      </Link>
    </div>
  )
}
