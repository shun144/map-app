import { useSelectedFeatureStore } from '../stores/selected-feature-store'

const formatValue = (value: unknown) =>
  typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value)

export function FeatureInfoPanel() {
  const selectedFeature = useSelectedFeatureStore(
    (store) => store.selectedFeature,
  )
  const setSelectedFeature = useSelectedFeatureStore(
    (store) => store.setSelectedFeature,
  )
  if (!selectedFeature) return null

  const propertyEntries = Object.entries(selectedFeature.properties)

  return (
    <section className="w-72 rounded-lg bg-white/95 text-sm text-slate-800 shadow-lg backdrop-blur">
      <header className="flex items-start justify-between gap-2 px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">
            {selectedFeature.overlayerLabel}
          </p>
          <h2 className="font-semibold">
            {formatValue(selectedFeature.properties.name ?? '（名称なし）')}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setSelectedFeature(null)}
          aria-label="地物情報を閉じる"
          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
        >
          ✕
        </button>
      </header>
      <table className="w-full border-t border-slate-200">
        <tbody>
          {propertyEntries.map(([propertyName, propertyValue]) => (
            <tr
              key={propertyName}
              className="border-b border-slate-100 last:border-0"
            >
              <th className="w-24 px-4 py-2 text-left align-top text-xs font-medium text-slate-500">
                {propertyName}
              </th>
              <td className="px-4 py-2 break-all">
                {formatValue(propertyValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
