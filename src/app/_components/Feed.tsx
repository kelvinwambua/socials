"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Heart, MessageCircle, Repeat, Share } from 'lucide-react';
import Image from 'next/image';
import { api } from "../../trpc/react";
import ReactPlayer from "react-player"

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
  isLiked: boolean;
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const observerTarget = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetching } = api.post.getPosts.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const likePostMutation = api.post.likePost.useMutation({
    onSuccess: (result, variables) => {
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === variables.postId.toString()
            ? { ...post, likes: result.liked ? post.likes + 1 : post.likes - 1, isLiked: result.liked }
            : post
        )
      );
    },
  });

  const toggleLike = (postId: string) => {
    likePostMutation.mutate({ postId: parseInt(postId) });
  };

  useEffect(() => {
    if (data) {
      setPosts((prevPosts) => {
        const newPosts = data.pages.flatMap((page) => page.items.map(item => ({
          ...item,
          isLiked: false 
        })));
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

    const currentTarget = observerTarget.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [observerTarget, fetchNextPage, hasNextPage, isFetching]);

  const handleVideoEnd = (postId: string) => {
    setPlayingVideoId(null);
  };

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
          <div className="relative h-64 w-full mb-4 bg-slate-800 rounded-lg overflow-hidden">
            <ReactPlayer
              url={post.media}
              width="100%"
              height="100%"
              playing={playingVideoId === post.id}
              controls={true}
              
              loop={true}
              light={true}
              onEnded={() => handleVideoEnd(post.id)}
              onPause={() => setPlayingVideoId(null)}
              onPlay={() => setPlayingVideoId(post.id)}
              config={{
                file: {
                  attributes: {
                    style: { 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }
                  }
                }
              }}
            />
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
                <AvatarFallback>{post.author.name[0] ?? 'U'}</AvatarFallback>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`transition-colors duration-200 ${post.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                  onClick={() => toggleLike(post.id)}
                  disabled={likePostMutation.isPending}
                >
                  <Heart className="mr-1 h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} /> {post.likes}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:text-blue-500 transition-colors duration-200 text-slate-400"
                >
                  <MessageCircle className="mr-1 h-4 w-4" /> {post.comments}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:text-green-500 transition-colors duration-200 text-slate-400"
                >
                  <Repeat className="mr-1 h-4 w-4" /> {post.shares}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:text-yellow-500 transition-colors duration-200 text-slate-400"
                >
                  <Share className="h-4 w-4" />
                </Button>
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