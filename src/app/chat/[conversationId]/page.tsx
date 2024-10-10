'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '~/trpc/react'
import { useSession } from 'next-auth/react'
import { Loader2, Send } from 'lucide-react'
import { useSocket } from '~/hooks/useSocket'

export default function ChatPage({ params }: { params: { conversationId: string } }) {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationId = parseInt(params.conversationId)
  const socket = useSocket(params.conversationId)

  const { data: messages, isLoading, refetch } = api.chat.getMessages.useQuery({
    conversationId,
    limit: 50,
  })

  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: (newMessage) => {
      setMessage('')
      if (socket) {
        socket.emit('send-message', newMessage, params.conversationId)
      }
      void refetch()
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', () => {
        void refetch()
      })
    }

    return () => {
      if (socket) {
        socket.off('receive-message')
      }
    }
  }, [socket, refetch])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-black">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === session?.user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.senderId === session?.user.id
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                <p>{msg.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t border-slate-800 p-4">
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
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-lg bg-slate-800 px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            className="rounded-lg bg-red-600 p-2 text-white disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}