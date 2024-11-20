import { Home, Users, Calendar, BookOpen, Award, Settings, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '~/components/ui/button'
import CreatePostButton from './CreatePostButton'
import { useRouter } from 'next/navigation'
import ViewFriendsButton from './ViewFriendsButton'

export default function Sidebar() {
  const router = useRouter()


  return (
    <aside className="w-64 hidden md:block p-4 bg-black rounded-lg shadow-lg border border-slate-800">
      <nav className="space-y-2">

          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200" onClick={()=>router.refresh()}>
          <Home  className="mr-2 h-5 w-5" />
           Home
        </Button>
        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200" onClick={()=>router.push("swipe")}>
          <Heart className="mr-2 h-5 w-5" />
          Swipe
        </Button>
        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200" onClick={()=>router.push("market")}>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Market
        </Button>
        <ViewFriendsButton />
        <CreatePostButton />
      </nav>
    </aside>
  )
}