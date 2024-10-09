'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { GoogleOutlined } from '@ant-design/icons'

const Logo: React.FC<{ height?: number }> = ({ height = 40 }) => (
  <div style={{ height }}>
    <span className="text-2xl font-bold text-red-600">Sonder</span>
  </div>
)

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('google', { callbackUrl: '/' })
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
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo height={60} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to Sonder
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Connect with your campus community
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <GoogleOutlined className="text-xl mr-3" />
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}