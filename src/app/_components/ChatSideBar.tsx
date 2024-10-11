"use client"

import React from 'react'
import { api } from '~/trpc/react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Loader2, MessageSquare } from 'lucide-react'
import { useParams } from 'next/navigation'
import { ScrollArea } from "~/components/ui/scroll-area"

export function ChatSidebar() {
  const { data: conversations, isLoading, error } = api.chat.getConversations.useQuery()
  const params = useParams()
  const currentConversationId = params?.conversationId

  if (isLoading) {
    return (
      <div className="w-64 border-r border-slate-800 p-4 bg-black">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-red-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-64 border-r border-slate-800 p-4 bg-black">
        <p className="text-red-500">Error loading conversations</p>
      </div>
    )
  }

  return (
    <div className="w-64 border-r border-slate-800 bg-black flex flex-col h-full">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold mb-2 text-white flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-red-600" />
          Conversations
        </h2>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <Link
                key={conv.conversation.id}
                href={`/chat/${conv.conversation.id}`}
                className={`flex items-center p-2 hover:bg-slate-800 rounded-lg mb-2 transition-colors duration-200 ${
                  currentConversationId === conv.conversation.id.toString() ? 'bg-slate-800' : ''
                }`}
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
              </Link>
            ))
          ) : (
            <p className="text-slate-400 text-center">No conversations yet</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}