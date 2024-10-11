"use client"

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { useToast } from '~/hooks/use-toast'
import { Loader2, UserPlus, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from "~/lib/utils"
import { Input } from "~/components/ui/input"

export function StartConversationDialog() {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: friends, isLoading: isLoadingFriends } = api.profile.getFriends.useQuery()
  const createConversation = api.chat.createConversation.useMutation()
  const { toast } = useToast()
  const router = useRouter()

  const filteredFriends = friends?.filter(friend => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartConversation = async () => {
    if (selectedFriend) {
      try {
        const result = await createConversation.mutateAsync({ participantId: selectedFriend })
        toast({
          title: "Conversation started",
          description: "You can now chat with your friend!",
        })
        router.push(`/chat/${result.id}`)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-slate-900 text-white hover:bg-slate-800 hover:text-red-500">
          <UserPlus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black border border-slate-800">
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 text-white" />
    <span className="sr-only">Close</span>
    </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">Start a new conversation</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search friends"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-slate-900 border-slate-800 text-white placeholder-slate-400"
            />
          </div>
          {isLoadingFriends ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredFriends?.map((friend) => (
                <div
                  key={friend.id}
                  className={cn(
                    "flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-150",
                    selectedFriend === friend.id ? "bg-red-600" : "hover:bg-slate-800"
                  )}
                  onClick={() => setSelectedFriend(friend.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={friend.image ?? undefined} />
                    <AvatarFallback className="bg-slate-700 text-white">{friend.name?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-white">{friend.name}</span>
                </div>
              ))}
              {filteredFriends?.length === 0 && (
                <p className="text-center text-sm text-slate-400">No friends found</p>
              )}
            </div>
          )}
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleStartConversation}
            disabled={!selectedFriend}
          >
            Start Conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}