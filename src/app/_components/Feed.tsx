"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Avatar, AvatarFallback,AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Heart, MessageCircle, Repeat, Share, Play } from 'lucide-react';
import Image from 'next/image';
import { api } from "../../trpc/react";


type PostType = string;

type Post = {
  id: string;
  type: PostType;
  author: {
    name: string;
    avatar: string;
    university: string;
  };
  content: string;
  media?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  

  const observerTarget = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetching } = api.post.getPosts.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (data) {
      setPosts((prevPosts) => {
        const newPosts = data.pages.flatMap((page) => page.items);
        const uniquePosts = [...new Set([...prevPosts, ...newPosts])];
        return uniquePosts.filter((post, index, self) =>
          index === self.findIndex((t) => t.id === post.id)
        );
      });
    }
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetching) {
          void fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, fetchNextPage, hasNextPage, isFetching]);

  const renderMedia = (post: Post) => {
    switch (post.type) {
      case 'image':
        return (
          <div className="relative h-64 w-full mb-4">
            <Image 
              src={post.media!} 
              alt={post.content} 
              layout="fill" 
              objectFit="cover" 
              className="rounded-lg"
            />
          </div>
        );
        case 'video':
          return (
            <div className="relative h-64 w-full mb-4 bg-slate-800 rounded-lg flex items-center justify-center">
              {playingVideoId === post.id ? (
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  onPause={() => setPlayingVideoId(null)}
                  onEnded={() => setPlayingVideoId(null)}
                >
                  <source src={post.media} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="cursor-pointer" onClick={() => setPlayingVideoId(post.id)}>
                  <Play className="h-16 w-16 text-red-600" />
                  <span className="sr-only">Play video</span>
                </div>
              )}
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="flex-grow max-w-2xl mx-auto space-y-6">
      {posts.map((post, index) => (
        <Card 
          key={post.id} 
          className="overflow-hidden transition-all duration-300 hover:shadow-xl bg-slate-900 border border-slate-800" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="p-4">
            <div className="flex items-center mb-4">
              <Avatar className="h-12 w-12 mr-3 ring-2 ring-red-600 ring-offset-2 ring-offset-slate-900">
                    
                    <AvatarImage src={post.author.avatar ?? "https://github.com/shadcn.png"} />
                    <AvatarFallback>{post.author.name?.[0] ?? 'U'}</AvatarFallback>
                 
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg text-white">{post.author.name}</h3>
                <p className="text-sm text-slate-400">{post.author.university}</p>
              </div>
            </div>
            <p className="mb-4 text-slate-300">{post.content}</p>
            {renderMedia(post)}
            <div className="flex justify-between items-center text-slate-400 text-sm">
              <span>{post.timestamp}</span>
              <div className="flex space-x-2">
                {['heart', 'message-circle', 'repeat', 'share'].map((action) => (
                  <Button 
                    key={action} 
                    variant="ghost" 
                    size="sm" 
                    className="hover:text-red-500 transition-colors duration-200 text-slate-400"
                  >
                    {action === 'heart' && <><Heart className="mr-1 h-4 w-4" /> {post.likes}</>}
                    {action === 'message-circle' && <><MessageCircle className="mr-1 h-4 w-4" /> {post.comments}</>}
                    {action === 'repeat' && <><Repeat className="mr-1 h-4 w-4" /> {post.shares}</>}
                    {action === 'share' && <Share className="h-4 w-4" />}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
      {isFetching && <p className="text-center text-slate-400">Loading more posts...</p>}
      <div ref={observerTarget} />
    </div>
  );
}