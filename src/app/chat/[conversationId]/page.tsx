"use client"

import React, { useEffect, useRef, useState } from 'react'
import { api } from '~/trpc/react'
import { useSession } from 'next-auth/react'
import { Loader2, Send } from 'lucide-react'
import { pusherClient } from '~/lib/pusher'
import type { MessageWithSenderImage, Message } from '~/server/db/schema'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"
import { useToast } from '~/hooks/use-toast'
import { ChatSidebar } from '../../_components/ChatSideBar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { StartConversationDialog } from '../../_components/StartConversation'

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  )
}

function MessageBubble({ message, isOwnMessage }: { message: MessageWithSenderImage, isOwnMessage: boolean }) {
  return (
    <div className={cn(
      "flex items-end gap-2 mb-4",
      isOwnMessage ? "justify-end" : "justify-start"
    )}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.senderImage?? "/placeholder.svg?height=32&width=32"} />
          <AvatarFallback className="bg-slate-700 text-white">
            {message.senderId?.charAt(0) ?? 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "max-w-[70%] rounded-lg p-3",
        isOwnMessage
          ? "bg-red-600 text-white rounded-br-none"
          : "bg-slate-800 text-white rounded-bl-none"
      )}>
        <p className="break-words">{message.content}</p>
        <span className={cn(
          "text-xs mt-1 block text-right",
          isOwnMessage ? "text-red-200" : "text-slate-400"
        )}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

    </div>
  )
}

export default function ChatPage({ params }: { params: { conversationId: string } }) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationId = parseInt(params.conversationId)
  const { data: conversationData } = api.chat.getConversation.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  );

  const { data: messages, isLoading, isError, error, refetch } = api.chat.getMessages.useQuery({
    conversationId,
    limit: 50,
  }, {
    retry: 3,
    refetchInterval: false,
    refetchOnWindowFocus: false
  })

  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('')
      void refetch()
    },
    onError: (error) => {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages?.length])

  useEffect(() => {
    const channel = pusherClient.subscribe(`chat-${conversationId}`);

    channel.bind('new-message', (newMessage: Message) => {
      if (newMessage.senderId !== session?.user?.id) {
        void refetch()
      }
    });

    return () => {
      pusherClient.unsubscribe(`chat-${conversationId}`);
    };
  }, [conversationId, refetch, session?.user?.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-black">
        <ChatSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-screen bg-black">
        <ChatSidebar />
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage message={error.message} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
          {conversationId ? (
            <>
              {conversationData ? (
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={conversationData.user.image ?? "/placeholder.svg?height=32&width=32"} />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {conversationData.user.name?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-lg font-semibold text-white">{conversationData.user.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-slate-400" />
                  <span className="text-lg font-semibold text-slate-400">Loading...</span>
                </div>
              )}
            </>
          ) : (
            <h1 className="text-lg font-semibold text-white">Chats</h1>
          )}
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={session?.user?.image ?? "/placeholder.svg?height=32&width=32"} />
              <AvatarFallback className="bg-slate-700 text-white">
                {session?.user?.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <StartConversationDialog />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
          {messages && messages.length > 0 ? (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.senderId === session?.user?.id}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-slate-400">No messages yet. Start a conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (message.trim()) {
              sendMessage.mutate({
                conversationId,
                content: message.trim(),
              })
            }
          }}
          className="border-t border-slate-800 p-4 bg-slate-900"
        >
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              placeholder="Type a message..."
              disabled={sendMessage.isPending}
            />
            <Button
              type="submit"
              disabled={sendMessage.isPending || !message.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}