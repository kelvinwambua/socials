'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '~/trpc/react'
import { useSession } from 'next-auth/react'
import { Loader2, Send } from 'lucide-react'
import { pusherClient } from '~/lib/pusher'
import type { Message } from '../../../server/db/schema'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"
import { useToast } from '~/hooks/use-toast'

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (hasError) {
      console.error('Error in ChatPage:', error);
    }
  }, [hasError, error]);

  if (hasError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-500">
            {error?.message ?? 'Please try again later'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div onError={(error) => {
      setHasError(true);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }}>
      {children}
    </div>
  );
}

export default function ChatPage({ params }: { params: { conversationId: string } }) {
  const { toast } = useToast()
  const { data: session, status: sessionStatus } = useSession()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationId = parseInt(params.conversationId)

  console.log('Rendering ChatPage. Conversation ID:', conversationId);

  const { data: messages, isLoading, isError, error, refetch } = api.chat.getMessages.useQuery({
    conversationId,
    limit: 50,
  }, {
    retry: 3,
  })

  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: (newMessage: Message) => {
      console.log('Message sent successfully:', newMessage);
      setMessage('')
      void refetch()
    },
    onError: (error) => console.error('Error sending message:', error),
  })

  const setTypingStatus = api.chat.setTypingStatus.useMutation({
    onError: (error) => console.error('Error setting typing status:', error),
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    console.log('Component mounted. Session status:', sessionStatus);
    console.log('Messages:', messages);
  }, [sessionStatus, messages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const channel = pusherClient.subscribe(`chat-${conversationId}`);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to Pusher channel');
    });

    channel.bind('pusher:subscription_error', (error: string) => {
      console.error('Pusher subscription error:', error);
    });

    channel.bind('new-message', (newMessage: Message) => {
      console.log('New message received:', newMessage);
      void refetch()
    });

    return () => {
      console.log('Unsubscribing from Pusher channel');
      pusherClient.unsubscribe(`chat-${conversationId}`);
    };
  }, [conversationId, refetch]);

  // useEffect(() => {
  //   const typingChannel = pusherClient.subscribe(`chat-${conversationId}-typing`);

  //   typingChannel.bind('typing-status', (data: { userId: string, isTyping: boolean }) => {
  //     if (data.userId !== session?.user?.id) {
  //       setIsTyping(data.isTyping);
  //     }
  //   });

  //   return () => {
  //     pusherClient.unsubscribe(`chat-${conversationId}-typing`);
  //   };
  // }, [conversationId, session?.user?.id]);

  // useEffect(() => {
  //   let typingTimeout: NodeJS.Timeout

  //   if (message) {
  //     setTypingStatus.mutate({ conversationId, isTyping: true });

  //     typingTimeout = setTimeout(() => {
  //       setTypingStatus.mutate({ conversationId, isTyping: false });
  //     }, 2000);
  //   }

  //   return () => {
  //     if (typingTimeout) {
  //       clearTimeout(typingTimeout);
  //     }
  //     setTypingStatus.mutate({ conversationId, isTyping: false });
  //   };
  // }, [message, conversationId, setTypingStatus]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date)
  }

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Please sign in to view this chat.</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Error: {error.message}</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2 max-w-[80%]",
                  msg.senderId === session?.user?.id ? "ml-auto" : "mr-auto"
                )}
              >
                {msg.senderId !== session?.user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.senderId ?? "./avatar.png"} />
                    <AvatarFallback>
                      {msg.senderId?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex flex-col rounded-lg p-3",
                    msg.senderId === session?.user?.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  )}
                >
                  <p className="break-words">{msg.content}</p>
                  <span
                    className={cn(
                      "text-xs mt-1",
                      msg.senderId === session?.user?.id
                        ? "text-blue-100"
                        : "text-gray-500"
                    )}
                  >
                    {formatTime(new Date(msg.createdAt))}
                  </span>
                </div>

                {msg.senderId === session?.user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}

          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]" />
              </div>
              <span className="text-sm">Someone is typing...</span>
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
          className="border-t border-gray-200 p-4"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type a message..."
              disabled={sendMessage.isPending}
            />
            <button
              type="submit"
              disabled={sendMessage.isPending || !message.trim()}
              className="rounded-lg bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  )
}