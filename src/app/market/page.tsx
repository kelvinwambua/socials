
"use client"

import { useState, useEffect } from 'react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Search, MapPin, Heart, Share, Grid, List } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

type Product = {
  id: string
  title: string
  price: number
  image: string
  location: string
  category: string
  seller: {
    name: string
    avatar: string
  }
}

const mockProducts: Product[] = [
    {
      id: '1',
      title: 'The Great Gatsby',
      price: 12.99,
      image: '/collegeImage.webp',
      location: 'New York, USA',
      category: 'Books',
      seller: {
        name: 'John Doe',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '2',
      title: 'iPhone 13',
      price: 999.99,
      image: '/collegeImage.webp',
      location: 'San Francisco, USA',
      category: 'Electronics',
      seller: {
        name: 'Jane Smith',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '3',
      title: 'Leather Sofa',
      price: 499.99,
      image: '/collegeImage.webp',
      location: 'Los Angeles, USA',
      category: 'Furniture',
      seller: {
        name: 'Emily Johnson',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '4',
      title: 'Winter Jacket',
      price: 89.99,
      image: '/collegeImage.webp',
      location: 'Chicago, USA',
      category: 'Clothing',
      seller: {
        name: 'Mike Brown',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '5',
      title: 'Electric Guitar',
      price: 299.99,
      image: '/collegeImage.webp',
      location: 'Austin, USA',
      category: 'Other',
      seller: {
        name: 'Sarah Wilson',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '6',
      title: 'MacBook Pro',
      price: 1999.99,
      image: '/collegeImage.webp',
      location: 'Boston, USA',
      category: 'Electronics',
      seller: {
        name: 'Alex Green',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '7',
      title: 'Mountain Bike',
      price: 599.99,
      image: '/collegeImage.webp',
      location: 'Denver, USA',
      category: 'Other',
      seller: {
        name: 'Chris Blue',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '8',
      title: 'Harry Potter Box Set',
      price: 69.99,
      image: '/collegeImage.webp',
      location: 'Seattle, USA',
      category: 'Books',
      seller: {
        name: 'Olivia White',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '9',
      title: '4K Smart TV',
      price: 799.99,
      image: '/collegeImage.webp',
      location: 'Dallas, USA',
      category: 'Electronics',
      seller: {
        name: 'Lucas Gray',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '10',
      title: 'Office Chair',
      price: 149.99,
      image: '/collegeImage.webp',
      location: 'Phoenix, USA',
      category: 'Furniture',
      seller: {
        name: 'Sophia Red',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '11',
      title: 'Vintage Watch',
      price: 349.99,
      image: '/collegeImage.webp',
      location: 'Miami, USA',
      category: 'Other',
      seller: {
        name: 'Liam Black',
        avatar: 'https://github.com/shadcn.png',
      },
    },
    {
      id: '12',
      title: 'Running Shoes',
      price: 59.99,
      image: '/collegeImage.webp',
      location: 'Portland, USA',
      category: 'Clothing',
      seller: {
        name: 'Ethan Brown',
        avatar: 'https://github.com/shadcn.png',
      },
    }
  ]
  
const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Other']

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [products, setProducts] = useState(mockProducts)
  const [visibleProducts, setVisibleProducts] = useState(12)
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  useEffect(() => {
    if (inView) {
      setVisibleProducts((prevVisible) => prevVisible + 12)
    }
  }, [inView])

  const filterProducts = () => {
    let filtered = mockProducts
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    setProducts(filtered)
  }

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory])

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/marketplace/${product.id}`}>
        <Card className="overflow-hidden bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-300">
          <CardContent className="p-0">
            <div className="relative h-48 md:h-64">
              <Image
                src={product.image}
                alt={product.title}
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button variant="ghost" size="icon" className="bg-slate-800/50 hover:bg-slate-800">
                  <Heart className="h-4 w-4 text-red-500" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-slate-800/50 hover:bg-slate-800">
                  <Share className="h-4 w-4 text-blue-500" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{product.title}</h3>
            <p className="text-2xl font-bold text-red-500 mb-2">${product.price.toFixed(2)}</p>
            <div className="flex items-center text-slate-400 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{product.location}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Image
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                <span className="text-sm text-slate-400">{product.seller.name}</span>
              </div>
              <span className="text-xs text-slate-500">{product.category}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-red-600">Sonder</h1>
        
        <div className="flex flex-col md:flex-row mb-8 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow">
            <Input
              type="search"
              placeholder="Search for items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 text-white border-slate-700 focus:border-red-600 focus:ring-red-600"
            />
          </div>
          <Select onValueChange={(value) => setSelectedCategory(value)}>
            <SelectTrigger className="w-full md:w-[180px] bg-slate-800 text-white border-slate-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-700">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-red-600">All</TabsTrigger>
            <TabsTrigger value="popular" className="text-white data-[state=active]:bg-red-600">Popular</TabsTrigger>
            <TabsTrigger value="recent" className="text-white data-[state=active]:bg-red-600">Recent</TabsTrigger>
          </TabsList>
        </Tabs>

        <AnimatePresence>
          <motion.div 
            className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
          >
            {products.slice(0, visibleProducts).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>
        
        {visibleProducts < products.length && (
          <div ref={ref} className="flex justify-center mt-8">
            <Button 
              onClick={() => setVisibleProducts(prev => prev + 12)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}