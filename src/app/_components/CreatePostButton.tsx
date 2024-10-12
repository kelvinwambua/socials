"use client"

import React from 'react'
import { SquarePlus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import PostCreationDialog from './PostForm'

export default function CreatePostButton() {
  return (
    <PostCreationDialog>
      <Button
        variant="ghost"
        className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
      >
        <SquarePlus className="mr-2 h-5 w-5" />
        Create
      </Button>
    </PostCreationDialog>
  )
}