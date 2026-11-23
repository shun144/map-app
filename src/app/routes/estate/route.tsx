import { Outlet, createFileRoute } from '@tanstack/react-router'

/** 物件新規作成画面と物件詳細画面の見た目をそろえるため、/estate 配下の画面を同じカードの中に描く */
export const Route = createFileRoute('/estate')({
  component: EstateLayout,
})

function EstateLayout() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-10">
      <section className="mx-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Outlet />
      </section>
    </main>
  )
}
