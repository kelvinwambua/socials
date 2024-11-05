"use client"

import React, { useState } from 'react'
import { z } from 'zod'
import { api } from '~/trpc/react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "~/components/ui/dialog"
import { useToast } from '~/hooks/use-toast'
import { Loader2, X, Tag} from 'lucide-react'
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { UploadButton } from '~/lib/uploadthing'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { set } from 'lodash'

const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Other'] as const

const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  price: z.number().positive("Price must be positive"),
  category: z.enum(categories, { required_error: "Please select a category" }),
  image: z.string().min(1, "Product image is required"),
})

export default function ProductListingDialog({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const createProductMutation = api.product.createProduct.useMutation()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '' as typeof categories[number],
    image: ''
  })

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleCategoryChange = (value: typeof categories[number]) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }))
  }

  const handleCreateListing = async () => {
    setIsLoading(true)
    try {
      const productData = productSchema.parse({
        ...formData,
        price: Number(formData.price)
      })
      
      await createProductMutation.mutateAsync(productData)
      
      toast({
        title: "Listing created",
        description: "Your product has been successfully listed!",
      })
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '' as typeof categories[number],
        image: ''
      })
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
          description: "Failed to create listing. Please try again.",
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
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border border-slate-800">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-slate-400" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">Create a listing</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Product title"
                value={formData.title}
                onChange={handleInputChange('title')}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map((category) => (
                      <SelectItem 
                        key={category} 
                        value={category}
                        className="text-white hover:bg-red-700"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-1/3">
                <Input
                  type="text"
                  placeholder="Price"
                  defaultValue={0}
                  value={formData.price}
                  onChange={handleInputChange('price')}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                />
              </div>
            </div>

            <Textarea
              placeholder="Product description"
              value={formData.description}
              onChange={handleInputChange('description')}
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 min-h-[100px]"
            />

            {formData.image ? (
              <div className="relative">
                <img 
                  src={formData.image} 
                  alt="Product preview" 
                  className="max-h-[200px] w-full object-cover rounded-lg"
                />
                <button
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 bg-slate-800 rounded-full p-1 hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <UploadButton
                  endpoint="imageUploader"

                  onClientUploadComplete={(res) => {
                    setFormData(prev => ({ ...prev, image: res?.[0]?.url ?? '' }))
                    toast({
                      title: "Upload complete",
                      description: "Your product image has been uploaded successfully.",
                    })
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      title: "Upload failed",
                      description: error.message || "An error occurred during upload.",
                      variant: "destructive"
                    })
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreateListing}
              disabled={isLoading || !formData.title || !formData.price || !formData.category || !formData.image}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Tag className="h-4 w-4 mr-2" />
              )}
              List Product
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}