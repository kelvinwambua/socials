"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Tag,
  Heart,
  MessageCircle,
  Share,
  Repeat,
  PenSquare
} from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import ReactPlayer from "react-player";
import Image from 'next/image';

interface ProfileData {
  displayName: string;
  bio: string;
  major: string;
  graduationYear: number;
  interests: string[];
  university: string;
}

interface Post {
  id: string;
  type: string;
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
  isLiked?: boolean;
  
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = 
    api.profile.getProfile.useQuery(undefined, {
      enabled: !!session?.user?.id,
    });

  const { 
    data: userPosts, 
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage
  } = api.post.getUserPosts.useInfiniteQuery(
    {
      userId: session?.user?.id ?? '',
      limit: 10,
    },
    {
      enabled: !!session?.user?.id,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const [formData, setFormData] = useState<ProfileData>({
    displayName: '',
    bio: '',
    major: '',
    graduationYear: new Date().getFullYear() + 4,
    interests: [],
    university: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        bio: profile.bio ?? '',
        major: profile.major,
        graduationYear: profile.graduationYear,
        interests: profile.interests!,
        university: profile.university,
      });
    }
  }, [profile]);

  const updateProfile = api.profile.update.useMutation({
    onSuccess: () => {
      void refetchProfile();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const likePostMutation = api.post.likePost.useMutation({
    onSuccess: () => {
      // Optionally refetch posts after liking
      void refetchProfile();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const renderMedia = (post: Post) => {
    switch (post.type) {
      case 'image':
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image 
              src={post.media!} 
              alt={post.content} 
              layout="fill" 
              objectFit="cover"
              className="transition-transform hover:scale-105"
            />
          </div>
        );
      case 'video':
        return (
          <div className="relative aspect-video w-full rounded-md overflow-hidden bg-slate-800">
            <ReactPlayer
              url={post.media}
              width="100%"
              height="100%"
              playing={playingVideoId === post.id}
              controls={true}
              light={true}
              onPlay={() => setPlayingVideoId(post.id)}
              onPause={() => setPlayingVideoId(null)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Profile Header */}
          <div className="relative w-full rounded-xl">
  
  <div className="w-full h-48 rounded-xl bg-gradient-to-r from-red-900 to-red-600">

    <div className="absolute bottom-4 left-8 right-8 flex items-end justify-between">
      <div className="flex items-end space-x-4">
        <Avatar className="h-28 w-28 border-4 border-red-500">
          <AvatarImage src={session?.user?.image ?? undefined} />
          <AvatarFallback>{session?.user?.name?.[0] ?? 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile?.displayName}</h1>
          <p className="text-slate-300">{profile?.university}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(!isEditing)}
      >
        <PenSquare className="h-4 w-4 mr-2" />
        {isEditing ? 'Cancel' : 'Edit Profile'}
      </Button>
    </div>
  </div>
</div>

          <div className="mt-20">
            {isEditing ? (
              // Edit Profile Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        value={formData.major}
                        onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        value={formData.graduationYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Interests</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-slate-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                interests: prev.interests.filter((_, i) => i !== index)
                              }))}
                              className="text-red-500 hover:text-red-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="Add an interest"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newInterest) {
                              setFormData(prev => ({
                                ...prev,
                                interests: [...prev.interests, newInterest]
                              }));
                              setNewInterest('');
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </form>
            ) : (
              // Profile Info
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6 space-y-6">
                  {profile?.bio && (
                    <p className="text-slate-200">{profile.bio}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-red-600" />
                      <span>{profile?.university}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-red-600" />
                      <span>{profile?.major}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-red-600" />
                      <span>Class of {profile?.graduationYear}</span>
                    </div>
                  </div>

                  {profile?.interests && profile.interests.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-red-600" />
                        <span className="font-medium">Interests</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-slate-800 px-3 py-1 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Posts Section */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start bg-slate-900">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="liked">Liked</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="space-y-4 mt-4">
              {userPosts?.pages.map((page) => 
                page.items.map((post) => (
                  <Card key={post.id} className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.author.name}</p>
                          <p className="text-sm text-slate-400">{post.timestamp}</p>
                        </div>
                      </div>
                      
                      <p className="text-slate-200">{post.content}</p>
                      {renderMedia(post)}
                      
                      <div className="flex justify-between items-center text-slate-400 text-sm">
                        <div className="flex space-x-4">
                          {/* <Button 
                            variant="ghost" 
                            size="sm" 
                            className={post.isLiked ? 'text-red-500' : 'text-slate-400'}
                            onClick={() => likePostMutation.mutate({ postId: parseInt(post.id) })}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button> */}
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="h-4 w-4" />
                            {post.shares}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {hasNextPage && (
                <Button 
                  onClick={() => fetchNextPage()} 
                  disabled={postsLoading}
                  variant="outline"
                  className="w-full"
                >
                  {postsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Load More'
                  )}
                </Button>
              )}
            </TabsContent>
            {/* Add other tab contents as needed */}
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}