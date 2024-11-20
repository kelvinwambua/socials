'use client'

import { useState, useEffect, useCallback } from 'react'
import SwipeCard from './SwipeCard'
import { api } from '~/trpc/react'
import { useToast } from "../../hooks/use-toast"
import { Button } from "../../components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
interface User {
  id: string;
  name: string;
  image: string;
  profile: {
    displayName: string;
    bio?: string;
    university: string;
    major: string;
    graduationYear: number;
    interests: string[];
  };
}

function SwipeInterface() {
  const { toast } = useToast()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { refetch: refetchNextUser } = api.profile.getNextUser.useQuery(undefined, {
    enabled: false,
  })

  const fetchNextUser = useCallback(async () => {
    setIsLoading(true)
    const result = await refetchNextUser()
    setIsLoading(false)
    if (result.data?.status === 'SUCCESS' && result.data.user) {
      const user: User = {
        id: result.data.user.id,
        name: result.data.user.name ?? "",
        image: result.data.user.image ?? "./collegeImage.webp",
        profile: {
          displayName: result.data.user.profile?.displayName ?? '',
          bio: result.data.user.profile?.bio ?? "",
          university: result.data.user.profile?.university ?? '',
          major: result.data.user.profile?.major ?? '',
          graduationYear: result.data.user.profile?.graduationYear ?? 0,
          interests: result.data.user.profile?.interests ?? [],
        },
      }
      setCurrentUser(user)
    } else if (result.data?.status === 'NO_MORE_USERS') {
      setCurrentUser(null)
      toast({
        title: "No more users",
        description: "You've swiped through all available users.",
        variant: "default",
      })
    }
  }, [refetchNextUser, toast])

  useEffect(() => {
    void fetchNextUser()
  }, [fetchNextUser])

  const swipeMutation = api.profile.swipe.useMutation({
    onSuccess: (data) => {
      if (data.status === 'MATCH') {
        toast({
          title: "It's a match!",
          description: "You've matched with this user.",
          variant: "default",
        })
      }
      void fetchNextUser()
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

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-bold text-red-600 text-center mb-8">Sonder</h1>
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-[500px]"
            >
              <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            </motion.div>
          ) : !currentUser ? (
            <motion.div
              key="no-users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[500px] bg-gray-900 rounded-lg p-8"
            >
              <p className="text-white text-xl mb-4 text-center">No more users available</p>
              <Button
                onClick={() => void fetchNextUser()}
                className="bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Find More Users
              </Button>
              <Button
                onClick={() => router.push('/home')}
                className="bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <Home size={20} className="mr-2" />
                Got to home
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="swipe-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SwipeCard
                user={currentUser}
                onSwipe={handleSwipe}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default SwipeInterface