import { Home, Users, Calendar, BookOpen, Award, Settings, ShoppingCart } from 'lucide-react'
import { Button } from '~/components/ui/button'
import CreatePostButton from './CreatePostButton'

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Home' },
    { icon: Users, label: 'Friends' },
    { icon: Calendar, label: 'Events' },
    { icon: ShoppingCart, label: 'MarketPlace' },
    { icon: Award, label: 'Achievements' },
    { icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="w-64 hidden md:block p-4 bg-black rounded-lg shadow-lg border border-slate-800">
      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <item.icon className="mr-2 h-5 w-5" />
            {item.label}
          </Button>
        ))}
        <CreatePostButton />
      </nav>
    </aside>
  )
}