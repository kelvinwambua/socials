'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import {  Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '~/lib/utils'
import { GoogleOutlined } from '@ant-design/icons'

interface LogoProps {
  height?: number
}

const Logo: React.FC<LogoProps> = ({ height = 40 }) => (
  <div style={{ height }} className="flex items-center">
    <span className="text-3xl font-bold text-red-600">
      Sonder
    </span>
  </div>
)

export default function Component() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSignIn = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const result = await signIn('google', { callbackUrl: '/profile-setup' })
      if (result?.error) {
        console.error('Sign-in error:', result.error)
      }
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Logo height={50} />
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Welcome
            </h1>
            <p className="text-sm text-slate-400">
              Sign in to continue to Sonder
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">
                Please sign in with your university email
              </p>
            </div>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className={cn(
                "relative w-full rounded-lg px-4 py-3",
                "flex items-center justify-center space-x-3",
                "text-sm font-medium text-white",
                "transition-all duration-150",
                "bg-red-600 hover:bg-red-700",
                "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <GoogleOutlined className="h-4 w-4" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
            
            </div>

            <div className="text-center">
              <Link 
                href="/schools"
                className={cn(
                  "inline-flex items-center space-x-1 text-xs text-slate-400",
                  "transition-colors duration-150",
                  "hover:text-red-500"
                )}
              >
                <span>Check if your school is supported</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="hover:text-red-500 hover:underline">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:text-red-500 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}