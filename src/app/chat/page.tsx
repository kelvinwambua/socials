"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { StartConversationDialog } from '../_components/StartConversation'
import { Button } from '~/components/ui/button'
import { ScrollArea } from "~/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Loader2, MessageSquare, Menu, X } from 'lucide-react'
import { cn } from "~/lib/utils"

export default function ChatPage() {
  const router = useRouter()
  const { data: conversations, isLoading } = api.chat.getConversations.useQuery()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-black text-white">
 
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-black transform transition-transform duration-200 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0"
      )}>
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-red-600" />
            Conversations
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-red-600" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.conversation.id}
                  onClick={() => {
                    router.push(`/chat/${conv.conversation.id}`)
                    setIsSidebarOpen(false)
                  }}
                  className="flex items-center w-full p-2 hover:bg-slate-800 rounded-lg mb-2 transition-colors duration-200"
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={conv.otherUser.image ?? undefined} />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {conv.otherUser.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {conv.otherUser.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.content ?? 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-slate-400 text-center">No conversations yet</p>
            )}
          </div>
        </ScrollArea>
      </div>


      <div className="flex-1 flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Chat</h1>
          </div>
          <StartConversationDialog />
        </div>
        <div className="flex-1 flex items-center justify-center bg-black p-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Chat</h2>
            <p className="text-slate-400 mb-8">Select a conversation or start a new one</p>
            <StartConversationDialog />
          </div>
        </div>
      </div>
    </div>
  )
}