"use client"
import { Bell, MessageCircleMore, Search, User, Menu } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {signOut} from 'next-auth/react'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'



export default function Header() {
  const {data:session} = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  
  const handleSignOut = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const result = await signOut( { callbackUrl: '/' })
   
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <header className="sticky top-0 z-50 bg-black border-b border-slate-800 shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-red-600">Sonder</h1>
          <nav className="hidden md:flex ml-10 space-x-1">
            {['Home', 'Discover', 'Events'].map((item) => (
              <Button key={item} variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200">
                {item}
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Input
              type="search"
              placeholder="Search Sonder"
              className="pl-10 pr-4 py-2 rounded-lg bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-600 transition-all duration-200 w-40 focus:w-60"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors duration-200" size={20} />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" onClick={()=> router.push("chat")} size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200">
              <MessageCircleMore size={20} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user.image ?? ""} alt="@user" />
                    <AvatarFallback>{session?.user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{session?.user.name}</p>
                    <p className="text-xs leading-none text-slate-400">{session?.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem onClick={()=> router.push("profile")} className="text-slate-400 focus:text-white focus:bg-slate-800">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-400 focus:text-white focus:bg-slate-800">
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-400 focus:text-white focus:bg-slate-800">
                  Team
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-400 focus:text-white focus:bg-slate-800">
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem onClick={handleSignOut} className="text-slate-400 focus:text-white focus:bg-slate-800">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={20} />
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden bg-black py-2 px-4 border-t border-slate-800">
          {['Home', 'Discover', 'Events'].map((item) => (
            <Button key={item} variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200">
              {item}
            </Button>
          ))}
        </nav>
      )}
    </header>
  )
}