// app/page.tsx
import { Suspense } from 'react'
import Header from '../_components/Header'
import Sidebar from '../_components/HomeSideBar'
import Feed from '../_components/Feed'
import Widgets from '../_components/Widget'

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Header />
      <main className="container mx-auto flex gap-6 px-4 py-6">
        <div className="sticky top-20 h-[calc(100vh-5rem)]">
          <Sidebar />
        </div>
        <Suspense fallback={<div className="flex-grow"><div className="animate-pulse bg-slate-800 h-96 rounded-lg"></div></div>}>
          <Feed />
        </Suspense>
        <div className="sticky top-20 h-[calc(100vh-5rem)]">
          <Widgets />
        </div>
      </main>
    </div>
  )
}