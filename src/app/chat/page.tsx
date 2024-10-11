import React from 'react'
import { ChatSidebar } from '../_components/ChatSideBar'
import { StartConversationDialog } from '../_components/StartConversation'

export default function DefaultChatPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar />
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <h1 className="text-2xl font-semibold mb-4">Welcome to Chat</h1>
        <p className="text-gray-600 mb-4">Select a conversation or start a new one</p>
        <StartConversationDialog />
      </div>
    </div>
  )
}