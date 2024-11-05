"use client"

import React, { useState } from 'react'
import { z } from 'zod'
import { api } from '~/trpc/react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "~/components/ui/dialog"
import { useToast } from '~/hooks/use-toast'
import { Loader2, X, Send } from 'lucide-react'
import { Textarea } from "~/components/ui/textarea"
import { UploadButton } from '~/lib/uploadthing'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useSession } from 'next-auth/react'

const postSchema = z.object({
  content: z.string().min(1, "Make sure your post has content").max(500, "Content too long"),
  media: z.string().optional(),
  type: z.enum(['text', 'image', 'video']),
})

export default function PostCreationDialog({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const createPostMutation = api.post.createPost.useMutation()
  const {data: session} = useSession()
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
        description: "Your post has been successfully shared!",
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
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border border-slate-800">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-slate-400" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">Create a post</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={session?.user.image ?? "https://github.com/shadcn.png"} />
              <AvatarFallback>{session?.user.name?.charAt(0)?? "CN"}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 min-h-[100px] resize-none"
              />
              {media && (
                <div className="mt-2 relative">
                  {type === 'image' ? (
                    <img src={media} alt="Uploaded content" className="max-w-full h-auto rounded-lg" />
                  ) : (
                    <video src={media} controls className="max-w-full h-auto rounded-lg" />
                  )}
                  <button
                    onClick={() => setMedia('')}
                    className="absolute top-2 right-2 bg-slate-800 rounded-full p-1 hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  setMedia(res?.[0]?.url ?? '')
                  setType('image')
                  toast({
                    title: "Upload complete",
                    description: "Your image has been uploaded successfully.",
                  })
                }}
                onUploadError={(error: Error) => {
                  toast({
                    title: "Upload failed",
                    description: error.message || "An error occurred during upload.",
                    variant: "destructive"
                  })
                }}
              >
         
              </UploadButton>
              <UploadButton
                endpoint="videoUploader"
                onClientUploadComplete={(res) => {
                  setMedia(res?.[0]?.url ?? '')
                  setType('video')
                  toast({
                    title: "Upload complete",
                    description: "Your video has been uploaded successfully.",
                  })
                }}
                onUploadError={(error: Error) => {
                  toast({
                    title: "Upload failed",
                    description: error.message || "An error occurred during upload.",
                    variant: "destructive"
                  })
                }}
              >
   
              </UploadButton>
            </div>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreatePost}
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}