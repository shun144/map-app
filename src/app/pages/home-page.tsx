import { Link } from '@tanstack/react-router'

export function HomePage() {
  return (
    <main className="grid h-dvh place-items-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-slate-800">地図ビューア</h1>
        <Link
          to="/map"
          className="rounded-md bg-slate-800 px-6 py-3 text-white hover:bg-slate-700"
        >
          地図を開く
        </Link>
      </div>
    </main>
  )
}
