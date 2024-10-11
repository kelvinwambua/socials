'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { StartConversationDialog } from '../_components/StartConversation'
import { Button } from '../../components/ui/button'
import { ScrollArea } from "../../components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Loader2, MessageSquare, Menu, X, MessageCircle } from 'lucide-react'
import { cn } from "../../lib/utils"

export default function ChatPage() {
  const router = useRouter()
  const { data: conversations, isLoading } = api.chat.getConversations.useQuery()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] bg-black text-white overflow-hidden">
     
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}


      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-full max-w-[280px] bg-slate-900",
        "transform transition-transform duration-200 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0"
      )}>
        <div className="flex justify-between items-center p-3 md:p-4 border-b border-slate-800">
          <h2 className="text-base md:text-lg font-semibold text-white flex items-center">
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
        <ScrollArea className="h-[calc(100dvh-4rem)]">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="p-2">
              {conversations.map((conv) => (
                <button
                  key={conv.conversation.id}
                  onClick={() => {
                    router.push(`/chat/${conv.conversation.id}`)
                    setIsSidebarOpen(false)
                  }}
                  className="flex items-center w-full p-2 rounded-lg mb-1 transition-colors hover:bg-slate-800 active:bg-slate-700"
                >
                  <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                    <AvatarImage src={conv.otherUser.image ?? undefined} />
                    <AvatarFallback>{conv.otherUser.name?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-left min-w-0">
                    <p className="font-medium truncate">{conv.otherUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.content ?? 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-slate-400 mb-4">No conversations yet</p>
              <StartConversationDialog />
            </div>
          )}
        </ScrollArea>
      </div>


      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-slate-900 border-b border-slate-800 p-3 md:p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-base md:text-lg font-semibold truncate">Welcome to Chat</h1>
          </div>
          <StartConversationDialog />
        </div>

        <ScrollArea className="flex-1 p-3 md:p-4">
          <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
            <div className="bg-slate-800/50 p-4 md:p-8 rounded-lg border border-slate-700 shadow-lg w-full">
              <div className="bg-red-600/10 rounded-full p-4 mb-4 md:mb-6 inline-block">
                <MessageCircle className="h-8 w-8 md:h-12 md:w-12 text-red-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Start a Conversation</h2>
              <p className="text-sm md:text-base text-slate-400 mb-4 md:mb-6">
                Connect with your friends through instant messaging. Start a new conversation
              </p>
              <div className="space-y-4">
                <StartConversationDialog />
                {conversations && conversations.length > 0 && (
                  <p className="text-xs md:text-sm text-slate-400">
                    or select a conversation from the sidebar to continue chatting
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}