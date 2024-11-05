'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Search, Filter, Heart, Loader2, X, ShoppingCart, Menu, Plus } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Badge } from '../../components/ui/badge'
import { Skeleton } from "../../components/ui/skeleton"
import { useToast } from "../../hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "../../components/ui/dialog"
import { Sheet, SheetContent,  SheetTrigger } from "../../components/ui/sheet"
import { api } from "../../trpc/react"
import { useDebounce } from '../../hooks/use-debounce'
import ProductListingDialog from '../_components/ListProduct'
import { useRouter } from 'next/navigation'
import { AvatarImage, Avatar } from '~/components/ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'

const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Other'] as const
type Category = (typeof categories)[number]
type SortOption = 'recent' | 'price_asc' | 'price_desc'

interface Product {
  id: number
  title: string
  price: number
  category: string | null
  description: string | null
  image: string
  createdAt: Date
  sellerId: string
}

interface User {
  id: string
  name: string | null
  image: string | null
  email: string | null
}

interface ProductWithSeller {
  product: Product
  seller: Pick<User, 'id' | 'name' | 'image'>
}

const SearchBar: React.FC<{ value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }> = ({ value, onChange }) => (
  
  <div className="relative group flex-1 max-w-xl">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors" />
    <Input
      type="search"
      placeholder="Search for items..."
      value={value}
      onChange={onChange}
      className="pl-10 pr-4 py-2 w-full bg-gray-900 border-gray-700 text-white placeholder-gray-400 rounded-full focus:border-red-500 focus:ring-red-500 transition-all"
    />
    {value && (
      <button
        onClick={() => onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
)

const ProductCard: React.FC<{ item: ProductWithSeller }> = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Card className="overflow-hidden bg-slate-800 border-slate-700 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl">
        <div 
          className="relative h-64 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
     <Image
  src={item.product.image}
  alt={item.product.title}
  fill
  quality={85} 
  className="object-cover transition-transform duration-300 group-hover:scale-110"
 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
  priority={false}
/>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/60 flex items-center justify-center"
              >
                <div className="space-y-4">
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white"onClick={()=>router.push(`/market/${item.product.id}`)}>
                    View Details
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700">
            {item.product.category ?? 'Uncategorized'}
          </Badge>
        </div>
        <CardContent className="p-4 bg-slate-900 text-white">
          <h3 className="text-lg font-semibold truncate mb-2">{item.product.title}</h3>
          <p className="text-2xl font-bold text-red-500 mb-2">${item.product.price.toFixed(2)}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
       
              <Avatar className='mr-2'>
                <AvatarImage src={item.seller.image ?? '/placeholder.svg?height=24&width=24'} />
                <AvatarFallback>{item.seller.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-base text-gray-300">{item.seller.name}</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(item.product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const FilterDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: Category;
  onCategoryChange: (value: Category) => void;
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  sortBy: SortOption;
  onSortChange: (value: string) => void;
}> = ({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-700">
      <DialogHeader>
        <DialogTitle>Filter Products</DialogTitle>
        <DialogDescription>Customize your product view</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-200">Category</label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
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
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-200">Price Range</label>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
              className="w-24 bg-gray-800 border-gray-700 text-white"
            />
            <span className="text-gray-400">to</span>
            <Input
              type="text"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="w-24 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={onPriceRangeChange}
            className="mt-2"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-200">Sort By</label>
          <Tabs value={sortBy} onValueChange={onSortChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="recent" className="data-[state=active]:bg-red-600">Recent</TabsTrigger>
              <TabsTrigger value="price_asc" className="data-[state=active]:bg-red-600">Price ↑</TabsTrigger>
              <TabsTrigger value="price_desc" className="data-[state=active]:bg-red-600">Price ↓</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)

const Marketplace: React.FC = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const debouncedSearch = useDebounce(searchTerm, 500)
  const { ref, inView } = useInView({ threshold: 0 })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = api.product.getProducts.useInfiniteQuery(
    {
      limit: 12,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: debouncedSearch,
      sortBy
    },
    {
      getNextPageParam: (lastPage): number | undefined => 
        lastPage?.length ? lastPage[lastPage.length - 1]?.product.id : undefined,
    }
  )

  const allProducts = data?.pages.flat() ?? []

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const filteredProducts = allProducts.filter((item: ProductWithSeller) => 
    (selectedCategory === 'All' || item.product.category === selectedCategory) &&
    item.product.price >= priceRange[0] && 
    item.product.price <= priceRange[1]
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleCategoryChange = useCallback((value: Category) => {
    setSelectedCategory(value)
  }, [])

  const handlePriceRangeChange = useCallback((value: [number, number]) => {
    setPriceRange([value[0] ?? 0, value[1] ?? 1000])
  }, [])

  const isSortOption = (value: string): value is SortOption => {
    return ['recent', 'price_asc', 'price_desc'].includes(value);
  };

  const handleSortChange = useCallback((value: string) => {
    if (isSortOption(value)) {
      setSortBy(value);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-slate-900 shadow-lg sticky top-0 z-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors">
                Sonder Market
              </Link>
              <SearchBar value={searchTerm} onChange={handleSearchChange} />
            </div>
            <div className="flex items-center space-x-4">
            <ProductListingDialog>
          <Button className="hidden md:flex items-center bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            List Product
          </Button>
        </ProductListingDialog>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-800 text-white">
                  <nav className="flex flex-col space-y-4">
                    <Link href="/cart" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Cart</span>
                    </Link>
                    <Link href="/wishlist" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                      <Heart className="h-5 w-5" />
                      <span>Wishlist</span>
                    </Link>
       
                    <Button
                      onClick={() => setIsFilterOpen(true)}
                      variant="outline"
                      className="flex items-center justify-center w-full bg-gray-700 hover:bg-gray-600 text-white  border-gray-600"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
                <Link href="/wishlist" className="text-gray-300 hover:text-white transition-colors">
                  <Heart className="h-5 w-5" />
                </Link>
                <Button
                  onClick={() => setIsFilterOpen(true)}
                  variant="outline"
                  className="flex items-center bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-black text-white">
        <FilterDialog
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-300">{filteredProducts.length} products found</p>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="recent" className="text-white hover:bg-red-700">Most Recent</SelectItem>
                <SelectItem value="price_asc" className="text-white hover:bg-red-700">Price: Low to High</SelectItem>
                <SelectItem value="price_desc" className="text-white hover:bg-red-700">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="text-center text-red-500 mb-8">
            Failed to load products. Please try again.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-96 bg-gray-800" />
              ))
            ) : (
              filteredProducts.map((item) => (
                <ProductCard key={item.product.id} item={item} />
              ))
            )}
          </AnimatePresence>
        </div>
        
        {isFetchingNextPage && (
          <div className="flex justify-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        )}

        <div ref={ref} className="h-10" />
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">About Sonder Market</h3>
              <p className="text-gray-400">Discover unique items from sellers around the world.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">&copy; 2023 Sonder Market. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Marketplace