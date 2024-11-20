"use client"

import React, { useState } from 'react'
import { SquarePlus, Users } from 'lucide-react'
import { Button } from '~/components/ui/button'
import PostCreationDialog from './PostForm'
import { api } from '~/trpc/react'
import { StartConversationDialog } from './StartConversation'
import { ViewFriendsDialog } from './ViewFriends'

export default function ViewFriendsButton() {
    const [searchQuery, setSearchQuery] = useState('')
  const { data: friends, isLoading: isLoadingFriends } = api.profile.getFriends.useQuery()
  
  const filteredFriends = friends?.filter(friend => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  return (
    <ViewFriendsDialog>
      <Button
        variant="ghost"
        className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
      >
        <Users className="mr-2 h-5 w-5" />
        Friends
      </Button>
    </ViewFriendsDialog>
  )
}