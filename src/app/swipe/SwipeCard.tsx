import React, { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { Briefcase, GraduationCap, Calendar, FlipHorizontal, X, Heart } from 'lucide-react'
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import Image from 'next/image'

interface SwipeCardProps {
  user: {
    id: string
    name: string
    image: string
    profile: {
      displayName: string
      bio?: string
      university: string
      major: string
      graduationYear: number
      interests: string[]
    }
  }
  onSwipe: (direction: 'left' | 'right') => void
}

export default function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  const [exitX, setExitX] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageUrl, setImageUrl] = useState(user.image)
  const controls = useAnimation()

  useEffect(() => {
    console.log("User data:", user)
    console.log("Image URL:", imageUrl)

    setImageError(false)
    setImageUrl(user.image)
  }, [user])

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      setExitX(1000)
      await controls.start({ x: 1000, opacity: 0, transition: { duration: 0.5 } })
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      setExitX(-1000)
      await controls.start({ x: -1000, opacity: 0, transition: { duration: 0.5 } })
      onSwipe('left')
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleImageError = () => {
    console.error("Image failed to load:", imageUrl)
    setImageError(true)
    setImageUrl('/collegeImage.webp') 
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.5 } }}
      className="relative w-full max-w-sm mx-auto h-[500px]"
    >
      <Card className="w-full h-full overflow-hidden bg-slate-900 border-slate-800">
        <motion.div
          className="w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div
            className="absolute w-full h-full backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="relative w-full h-full">
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                  Failed to load image
                </div>
              ) : (
                <Image
                  src={imageUrl}
                  alt={`${user.profile.displayName}'s profile picture`}
                  layout="fill"
                  objectFit="cover"
                  onError={handleImageError}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h2 className="text-2xl font-bold text-white">{user.profile.displayName}</h2>
                <p className="text-slate-300">{user.profile.major}</p>
              </div>
            </div>
          </motion.div>


          <motion.div
            className="absolute w-full h-full backface-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4">{user.profile.displayName}</h2>
              
              {user.profile.bio && (
                <p className="text-slate-300 mb-4">{user.profile.bio}</p>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-slate-300">
                  <Briefcase size={16} className="mr-2 text-red-500" />
                  <span>{user.profile.major}</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <GraduationCap size={16} className="mr-2 text-red-500" />
                  <span>{user.profile.university}</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Calendar size={16} className="mr-2 text-red-500" />
                  <span>Class of {user.profile.graduationYear}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">Interests:</h3>
                <div className="flex flex-wrap gap-2">
                  {user.profile.interests.map((interest, index) => (
                    <Badge 
                      key={index} 
                      className="bg-red-900/30 text-red-300 border border-red-800"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </motion.div>
        </motion.div>

  
        <Button
          onClick={handleFlip}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white hover:bg-slate-800"
        >
          <FlipHorizontal size={20} />
        </Button>
      </Card>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between z-10">
        <Button
          onClick={() => void onSwipe('left')}
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white"
        >
          <X size={20} />
        </Button>
        <Button
          onClick={() => void onSwipe('right')}
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white"
        >
          <Heart size={20} />
        </Button>
      </div>
    </motion.div>
  )
}