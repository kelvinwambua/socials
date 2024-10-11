"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { pusherClient } from '~/lib/pusher'
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Loader2, MessageSquare, Send, UserPlus, Menu, X } from 'lucide-react'
import { useToast } from '../../../hooks/use-toast'
import { cn } from "../../../lib/utils"

export default function ResponsiveChatPage() {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const conversationId = params?.conversationId ? parseInt(params.conversationId as string) : undefined

  const { data: conversations, isLoading: isLoadingConversations } = api.chat.getConversations.useQuery()
  const { data: currentConversation } = api.chat.getConversation.useQuery(
    { conversationId: conversationId ?? 0 },
    { enabled: !!conversationId }
  )
  const { data: messages, isLoading: isLoadingMessages, refetch: refetchMessages } = api.chat.getMessages.useQuery({
    conversationId: conversationId ?? 0,
    limit: 50,
  }, {
    enabled: !!conversationId,
    retry: 3,
    refetchInterval: false,
    refetchOnWindowFocus: false
  })

  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('')
      void refetchMessages()
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

  const createConversation = api.chat.createConversation.useMutation({
    onSuccess: (result) => {
      toast({
        title: "Conversation started",
        description: "You can now chat with your friend!",
      })
      router.push(`/chat/${result.id}`)
      setIsSidebarOpen(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      })
    },
  })

  useEffect(() => {
    if (conversationId) {
      const channel = pusherClient.subscribe(`chat-${conversationId}`)
      channel.bind('new-message', () => {
        void refetchMessages()
      })
      return () => {
        pusherClient.unsubscribe(`chat-${conversationId}`)
      }
    }
  }, [conversationId, refetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && conversationId) {
      sendMessage.mutate({
        conversationId,
        content: message.trim(),
      })
    }
  }

  return (
    <div className="flex h-screen bg-black text-white">
 
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0"
      )}>
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold flex items-center">
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
          {isLoadingConversations ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            </div>
          ) : (
            <div className="p-2">
              {conversations?.map((conv) => (
                <button
                  key={conv.conversation.id}
                  onClick={() => {
                    router.push(`/chat/${conv.conversation.id}`)
                    setIsSidebarOpen(false)
                  }}
                  className={cn(
                    "flex items-center w-full p-2 rounded-lg mb-1 transition-colors",
                    conversationId === conv.conversation.id ? "bg-slate-800" : "hover:bg-slate-800"
                  )}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={conv.otherUser.image ?? undefined} />
                    <AvatarFallback>{conv.otherUser.name?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium">{conv.otherUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.content ?? 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
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
            {currentConversation ? (
              <>
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={currentConversation.user.image ?? undefined} />
                  <AvatarFallback>{currentConversation.user.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{currentConversation.user.name}</span>
              </>
            ) : (
              <span className="font-semibold">Select a conversation</span>
            )}
          </div>
          <StartConversationDialog onStartConversation={(participantId) => createConversation.mutate({ participantId })} />
        </div>


        <ScrollArea className="flex-1 p-4">
          {isLoadingMessages ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex mb-4",
                  msg.senderId === session?.user?.id ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[70%] rounded-lg p-3",
                  msg.senderId === session?.user?.id
                    ? "bg-red-600 text-white"
                    : "bg-slate-800 text-white"
                )}>
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400">No messages yet</p>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>


        {conversationId && (
          <form onSubmit={handleSendMessage} className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 border-slate-700"
              />
              <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function StartConversationDialog({ onStartConversation }: { onStartConversation: (participantId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: friends } = api.profile.getFriends.useQuery()

  const filteredFriends = friends?.filter(friend => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartConversation = () => {
    if (selectedFriend) {
      onStartConversation(selectedFriend)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-slate-800 text-white hover:bg-slate-700">
          <UserPlus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Start a new conversation</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Input
            placeholder="Search friends"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
          />
          <ScrollArea className="h-[200px]">
            {filteredFriends?.map((friend) => (
              <button
                key={friend.id}
                className={cn(
                  "flex items-center w-full p-2 rounded-lg mb-1 transition-colors",
                  selectedFriend === friend.id ? "bg-red-600" : "hover:bg-slate-800"
                )}
                onClick={() => setSelectedFriend(friend.id)}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={friend.image ?? undefined} />
                  <AvatarFallback>{friend.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <span>{friend.name}</span>
              </button>
            ))}
          </ScrollArea>
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