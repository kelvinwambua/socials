'use client'

import { useState } from 'react'
import SwipeCard from './SwipeCard'
import { api } from '~/trpc/react'
import { useToast } from "../../hooks/use-toast"
import { Button } from "../../components/ui/button"

interface User {
  id: string;
  profile?: {
    displayName: string;
    bio: string | null;
    university: string;
    major: string;
    graduationYear: number;
    interests: string[] | null;
    imageUrl: string;
  };
}

function SwipeInterface() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const { data: nextUserData, refetch: refetchNextUser } = api.profile.getNextUser.useQuery()

  const handleNextUser = () => {
    if (nextUserData?.status === 'SUCCESS' && nextUserData.user) {
      setCurrentUser(nextUserData.user as User)
    } else if (nextUserData?.status === 'NO_MORE_USERS') {
      toast({
        title: "No more users",
        description: "You've swiped through all available users.",
        variant: "default",
      })
    }
  }

  const swipeMutation = api.profile.swipe.useMutation({
    onSuccess: (data) => {
      if (data.status === 'MATCH') {
        toast({
          title: "It's a match!",
          description: "You've matched with this user.",
          variant: "default",
        })
      }
      void refetchNextUser()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process swipe. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentUser) {
      swipeMutation.mutate({
        swipedId: currentUser.id,
        direction: direction,
      })
    }
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Button 
          onClick={handleNextUser} 
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Start Swiping
        </Button>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <SwipeCard
        user={{
          id: currentUser.id,
          displayName: currentUser.profile?.displayName ?? '',
          bio: currentUser.profile?.bio ?? '',
          university: currentUser.profile?.university ?? '',
          major: currentUser.profile?.major ?? '',
          graduationYear: currentUser.profile?.graduationYear ?? 0,
          interests: currentUser.profile?.interests ?? [],
          imageUrl: currentUser.profile?.imageUrl ?? '/default-profile.jpg',
        }}
        onSwipe={handleSwipe}
      />
    </div>
  )
}

export default SwipeInterface