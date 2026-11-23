import { useState } from 'react'
import { ESTATE_NAME_MAX_LENGTH } from '#/config/estate'
import { useCreateEstate } from '../api/create-estate'
import type { FormEvent } from 'react'
import type { LngLat } from '#/lib/map/types'
import type { Estate } from '#/shared/map/storage/estate-repository'

type Props = {
  lngLat: LngLat
  onCreated: (createdEstate: Estate) => void
  onCancel: () => void
}

export function NewEstateForm({ lngLat, onCreated, onCancel }: Props) {
  const [estateName, setEstateName] = useState('')
  const { mutate, isPending, isError } = useCreateEstate()
  const trimmedEstateName = estateName.trim()
  const isSavable = trimmedEstateName !== '' && !isPending

  const createEstate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isSavable) return
    mutate({ name: trimmedEstateName, lngLat }, { onSuccess: onCreated })
  }

  return (
    <form onSubmit={createEstate} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">物件名</span>
        <input
          type="text"
          value={estateName}
          onChange={(event) => setEstateName(event.target.value)}
          maxLength={ESTATE_NAME_MAX_LENGTH}
          required
          autoFocus
          className="block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>
      {isError && (
        <p role="alert" className="text-sm text-red-600">
          保存に失敗しました
        </p>
      )}
      <div className="flex gap-3">
        {/* 保存中に押せないようにするのは、同じ物件が2つ作られるのを防ぐため */}
        <button
          type="submit"
          disabled={!isSavable}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? '保存中…' : '保存'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
