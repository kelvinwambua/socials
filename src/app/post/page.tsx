"use client"

import React, { useState } from 'react'
import { z } from 'zod'
import { api } from '~/trpc/react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "~/components/ui/dialog"
import { useToast } from '~/hooks/use-toast'
import { Loader2, Image, Video, Type, X } from 'lucide-react'
import { cn } from "~/lib/utils"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

const postSchema = z.object({
  content: z.string().min(1, "Make sure your post has content").max(500, "Content too long"),
  media: z.string().optional(),
  type: z.enum(['text', 'image', 'video']),
})

export default function PostCreationDialog() {
  const { toast } = useToast()
  const createPostMutation = api.post.createPost.useMutation()
  const [type, setType] = useState<'text' | 'image' | 'video'>('text')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreatePost = async () => {
    setIsLoading(true)
    try {
      const postData = postSchema.parse({ content, media, type })
      await createPostMutation.mutateAsync(postData)
      toast({
        title: "Post created",
        description: "Your post has been successfully created!",
      })
      setContent('')
      setMedia('')
      setType('text')
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid input",
          description: error.errors[0]?.message ?? "Please check your input",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-slate-900 text-white hover:bg-slate-800 hover:text-red-500">
          <Type className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black border border-slate-800">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">Create a new post</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "bg-slate-900 text-white hover:bg-slate-800",
                type === 'text' && "bg-red-600 hover:bg-red-700"
              )}
              onClick={() => setType('text')}
            >
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "bg-slate-900 text-white hover:bg-slate-800",
                type === 'image' && "bg-red-600 hover:bg-red-700"
              )}
              onClick={() => setType('image')}
            >
              <Image className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "bg-slate-900 text-white hover:bg-slate-800",
                type === 'video' && "bg-red-600 hover:bg-red-700"
              )}
              onClick={() => setType('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
          </div>
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white placeholder-slate-400"
          />
          {(type === 'image' || type === 'video') && (
            <Input
              placeholder={`Enter ${type} URL`}
              value={media}
              onChange={(e) => setMedia(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white placeholder-slate-400"
            />
          )}
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleCreatePost}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Create Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}