'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { api } from '~/trpc/react'
import { useToast } from '../../hooks/use-toast'  
import { z } from 'zod' 

const profileSetupSchema = z.object({
  displayName: z.string().min(1, "Display Name is required"),
  bio: z.string().optional(),
  major: z.string().min(1, "Major is required"),
  graduationYear: z.string().min(1, "Graduation Year is required"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
})

const Logo: React.FC<{ height?: number }> = ({ height = 40 }) => (
  <div style={{ height }}>
    <span className="text-2xl font-bold text-red-600">Sonder</span>
  </div>
)

const interestOptions = [
  "Sports", "Music", "Art", "Technology", "Travel", "Cooking", "Reading",
  "Gaming", "Fitness", "Photography", "Dance", "Film", "Fashion", "Volunteering",
  "Coding", "Hiking", "Yoga", "Writing", "Entrepreneurship", "Language Learning"
]

export default function ProfileSetup() {
  const router = useRouter()
  const { toast } = useToast() 
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    major: '',
    graduationYear: '',
    interests: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({})

  const mutation = api.profile.setup.useMutation()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleInterestSelect = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormErrors({})

  
    const result = profileSetupSchema.safeParse(formData)

    if (!result.success) {
   
      const errors = result.error.flatten().fieldErrors
      setFormErrors({
        displayName: errors.displayName?.[0],
        bio: errors.bio?.[0],
        major: errors.major?.[0],
        graduationYear: errors.graduationYear?.[0],
        interests: errors.interests?.[0],
      })

      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      })

      setIsLoading(false)
      return
    }

    try {
      await mutation.mutateAsync({
        displayName: formData.displayName,
        bio: formData.bio,
        major: formData.major,
        graduationYear: parseInt(formData.graduationYear),
        interests: formData.interests,
      })

      toast({
        title: 'Profile Setup Successful',
        description: 'Your profile has been set up successfully.',
        variant: 'default',
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Profile setup error:', error)

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <Logo height={60} />
        </div>
        <h1 className="text-4xl font-bold text-center mb-8">Set Up Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <Input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              required
              className="bg-gray-900 border-gray-700 text-white"
            />
            {formErrors.displayName && <p className="text-red-600 text-sm mt-1">{formErrors.displayName}</p>}
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">
              Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="bg-gray-900 border-gray-700 text-white"
            />
            {formErrors.bio && <p className="text-red-600 text-sm mt-1">{formErrors.bio}</p>}
          </div>
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-slate-300 mb-2">
              Major
            </label>
            <Input
              type="text"
              id="major"
              name="major"
              value={formData.major}
              onChange={handleInputChange}
              required
              className="bg-gray-900 border-gray-700 text-white"
            />
            {formErrors.major && <p className="text-red-600 text-sm mt-1">{formErrors.major}</p>}
          </div>
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-slate-300 mb-2">
              Graduation Year
            </label>
            <Select 
              onValueChange={(value) => setFormData(prev => ({ ...prev, graduationYear: value }))}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select graduation year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.graduationYear && <p className="text-red-600 text-sm mt-1">{formErrors.graduationYear}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.interests.map(interest => (
                <Badge 
                  key={interest} 
                  variant="secondary"
                  className="bg-red-600 hover:bg-red-700 cursor-pointer"
                  onClick={() => handleInterestSelect(interest)}
                >
                  {interest} ✕
                </Badge>
              ))}
            </div>
            <Select onValueChange={handleInterestSelect}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Add an interest" />
              </SelectTrigger>
              <SelectContent>
                {interestOptions.map(interest => (
                  <SelectItem key={interest} value={interest}>{interest}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.interests && <p className="text-red-600 text-sm mt-1">{formErrors.interests}</p>}
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-red-800' : 'bg-red-600'} hover:bg-red-700 text-white`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3                  .org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up profile...
              </span>
            ) : (
              <>
                Complete Profile Setup
                <ArrowRightIcon className="ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

