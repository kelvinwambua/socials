"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

const InstagramStyleHomePage = () => {
  const router = useRouter();

  const posts = [
    {
      id: 1,
      user: { name: 'John Doe', image: '/path/to/john.jpg' },
      content: 'Studying for finals at the library! #UniversityLife',
      image: '/api/placeholder/600/600',
      likes: 42,
      comments: 5,
    },
    {
      id: 2,
      user: { name: 'Jane Smith', image: '/path/to/jane.jpg' },
      content: 'Just joined the debate club! Excited for new challenges. 🎓',
      image: '/api/placeholder/600/600',
      likes: 38,
      comments: 7,
    },
    // Add more mock posts as needed
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800 p-4 sticky top-0 bg-black z-10">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">Sonder</h1>
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/messages')}>
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <ScrollArea className="flex-grow">
        <main className="max-w-xl mx-auto p-4">
          {/* Stories */}
          {/* <div className="flex space-x-4 overflow-x-auto pb-4 mb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Avatar className="w-16 h-16 ring-2 ring-red-600 p-0.5">
                  <AvatarImage src={`/api/placeholder/64/64?text=User${i+1}`} />
                  <AvatarFallback>U{i+1}</AvatarFallback>
                </Avatar>
                <span className="text-xs mt-1">User {i+1}</span>
              </div>
            ))}
          </div> */}

          {/* Posts */}
          {posts.map((post) => (
            <Card key={post.id} className="mb-6 bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Avatar>
                  <AvatarImage src={post.user.image} />
                  <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{post.user.name}</h3>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <img src={post.image} alt="Post content" className="w-full" />
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <div className="flex justify-between w-full py-2">
                  <div className="flex space-x-4">
                    <Button variant="ghost" size="icon">
                      <Heart className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Send className="h-6 w-6" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Bookmark className="h-6 w-6" />
                  </Button>
                </div>
                <p className="font-semibold">{post.likes} likes</p>
                <p><span className="font-semibold">{post.user.name}</span> {post.content}</p>
                <p className="text-slate-400">View all {post.comments} comments</p>
                <Input 
                  placeholder="Add a comment..." 
                  className="mt-2 bg-transparent border-none focus:ring-0"
                />
              </CardFooter>
            </Card>
          ))}
        </main>
      </ScrollArea>
    </div>
  );
};

export default InstagramStyleHomePage;