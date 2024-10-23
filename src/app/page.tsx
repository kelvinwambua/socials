'use client'

import React, { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightOutlined, CloseOutlined, MenuOutlined, LinkedinFilled, TwitterCircleFilled } from '@ant-design/icons'

const Logo: React.FC<{ _isLabel?: boolean; height?: number }> = ({ _isLabel, height = 40 }) => (
  <div style={{ height }}>
    <span className="text-2xl font-bold text-red-600">Sonder</span>
  </div>
)

const useUserContext = () => ({ isLoggedIn: false })

interface ButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'outline' | 'primary' | 'inverted' | 'muted';
}

const LandingButton: React.FC<ButtonProps> = ({ href, size = 'md', type = 'primary', className, children, ...props }) => {
  const sizes = {
    lg: 'px-5 py-2.5',
    md: 'px-4 py-2',
    sm: 'px-2 py-1',
  }

  const styles = {
    outline: 'bg-white hover:text-black dark:hover:text-black border-2 border-black hover:bg-gray-100 text-black dark:bg-black dark:text-white dark:border-white',
    primary: 'bg-black text-white hover:text-white dark:hover:text-black hover:bg-slate-800 border-2 border-transparent dark:bg-white dark:text-black dark:hover:bg-gray-200',
    inverted: 'bg-white text-black hover:text-black dark:hover:text-black border-2 border-transparent hover:bg-gray-100 dark:bg-black dark:text-white',
    muted: 'bg-gray-100 hover:text-black dark:hover:text-black hover:bg-gray-200 border-2 border-transparent text-black dark:bg-gray-700 dark:text-white',
  }

  return (
    <Link href={href} {...props} className={`rounded text-center transition focus-visible:ring-2 ring-offset-2 ring-gray-200 ${sizes[size]} ${styles[type]} ${className}`}>
      {children}
    </Link>
  )
}

interface NavItem {
  link: string;
  title: string;
  target?: string;
}

interface NavBarProps {
  navItems: NavItem[];
}

const LandingNavBar: React.FC<NavBarProps> = ({ navItems }) => {
  const { isLoggedIn } = useUserContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Logo height={40} _isLabel />
          </div>
          <div className="hidden md:flex items-center justify-between flex-1 ml-8">
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.link}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.title}
                </Link>
              ))}
            </div>
            <div>
              {isLoggedIn ? (
                <LandingButton size="sm" href="/home" type="inverted">
                  Dashboard <ArrowRightOutlined />
                </LandingButton>
              ) : (
                <LandingButton size="sm" href="/api/auth/signin" type="inverted">
                  Get Started
                </LandingButton>
              )}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? (
                <CloseOutlined className="block h-6 w-6" />
              ) : (
                <MenuOutlined className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.link}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            {isLoggedIn ? (
              <LandingButton size="sm" href="/home" type="inverted" className="w-full mt-4">
                Dashboard <ArrowRightOutlined />
              </LandingButton>
            ) : (
              <LandingButton size="sm" href="/api/auth/signin" type="inverted" className="w-full mt-4">
                Get Started
              </LandingButton>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

interface HeroProps {
  title: string;
  subtitle: string;
  buttonText: string;
  pictureUrl: string;
}

const LandingHero: React.FC<HeroProps> = ({ title, subtitle, buttonText }) => {
  return (
    <section className="py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold lg:tracking-tight xl:tracking-tighter">
              {title}
            </h1>
            <p className="text-lg mt-4  max-w-xl">
              {subtitle}
            </p>
            <div className="mt-8">
              <LandingButton
                href={'/api/auth/signin'}
                className="flex gap-1 items-center justify-center"
                rel="noopener"
                size="lg"
                type="inverted"
              >
                {buttonText}
                <ArrowRightOutlined className="ml-2" />
              </LandingButton>
            </div>
          </div>

          <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-full lg:h-full">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="relative w-full h-[500px] overflow-hidden spotlight-container">
                  <Image
                    src="/Community.jpg" 
                    alt="Students using app on campus"
                    fill
                    className="object-cover rounded-lg shadow-lg spotlight"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <svg width="0" height="0">
        <defs>
          <clipPath id="blob-clip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 Q0.1,0.4 0,1 V1 Q0.5,1 1,0.5 T1,0 H0 Z" />
          </clipPath>
        </defs>
      </svg>
    </section>
  )
}

interface Feature {
  heading: string;
  description: string;
  icon: React.ReactNode;
}

interface FeaturesProps {
  title: string;
  subtitle: string;
  features: Feature[];
}

const LandingFeatures: React.FC<FeaturesProps> = ({ title, subtitle, features }) => {
  return (
    <section className="py-16 px-5">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-bold lg:tracking-tight">
          {title}
        </h2>
        <p className="text-lg mt-4 text-slate-400">
          {subtitle}
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 mt-16 gap-16">
          {features.map((item, idx) => (
            <div key={idx + 'feature'} className="flex gap-4 items-start">
              <div className="mt-1 bg-black rounded-full p-2 pt-1 w-8 h-8 text-white">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{item.heading}</h3>
                <p className="text-slate-400 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface Testimonial {
  name: string;
  content: string;
  designation: string;
  avatar: string;
}

interface TestimonialsProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

const LandingTestimonials: React.FC<TestimonialsProps> = ({ title, subtitle, testimonials }) => {
  return (
    <section className="py-16 px-5">
      <div className="max-w-5xl mx-auto px-4 py-16 relative group overflow-hidden">
        <div className="mt-16 md:mt-0 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold lg:tracking-tight">
            {title}
          </h2>
          <p className="text-lg mt-4 text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 [column-fill:_balance] sm:columns-2 sm:gap-6 lg:columns-3 lg:gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={`testimonial-${idx}`} className="mb-8 sm:break-inside-avoid">
              <blockquote className="rounded-lg bg-gray-900 p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <Image
                    alt=""
                    src={testimonial.avatar} 
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                  />

                  <div>
                    <p className="mt-0.5 text-lg font-medium text-slate-300">
                      {testimonial.name}
                    </p>
                    <p className="flex gap-0.5 text-slate-400">
                      {testimonial.designation}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-slate-400">{testimonial.content}</p>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface CTAProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

const LandingCTA: React.FC<CTAProps> = ({ title, subtitle, buttonText, buttonLink }) => {
  return (
    <section className="py-16 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="bg-black p-8 md:px-20 md:py-20 mt-20 mx-auto max-w-5xl rounded-lg flex flex-col items-center text-center">
          <h2 className="text-white text-4xl lg:text-5xl font-bold lg:tracking-tight">
            {title}
          </h2>
          <p className="text-slate-400 mt-4 text-lg md:text-xl">{subtitle}</p>
          <div className="flex mt-10">
            <LandingButton href={buttonLink ?? '/register'} size="lg">
              {buttonText}
            </LandingButton>
          </div>
        </div>
      </div>
    </section>
  )
}

const LandingFooter: React.FC = () => {
  const socials = [
    {
      name: 'X',
      icon: <TwitterCircleFilled />,
      link: 'https://twitter.com/',
    },
    {
      name: 'LinkedIn',
      icon: <LinkedinFilled />,
      link: 'https://linkedin.com/',
    },
  ]

  return (
    <div className="relative mt-16">
      <div className="border-t border-neutral-800 px-8 pt-20 pb-32 relative bg-black">
        <div className="max-w-7xl mx-auto flex sm:flex-row flex-col justify-between items-start">
          <div>
            <div className="mr-4 md:flex mb-4">
              <Logo height={50} _isLabel />
            </div>
            <div className="text-slate-400">Copyright &copy; 2024</div>
            <div className="mt-2 text-slate-400">All rights reserved</div>
          </div>
          <div className="grid grid-cols-3 gap-10 items-start mt-10 md:mt-0">
            <div className="flex justify-center space-y-4 flex-col mt-4">
              {socials.map(link => (
                <Link
                  key={link.name}
                  className="transition-colors text-xs sm:text-sm text-slate-400 hover:text-white"
                  href={link.link}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navItems: NavItem[] = [
    { link: '#features', title: 'Features' },
    { link: '#testimonials', title: 'Testimonials' },
    { link: '#pricing', title: 'Pricing' },
  ]

  const features: Feature[] = [
    {
      heading: 'Connect with Peers',
      description: 'Find and connect with like-minded students on your campus.',
      icon: '👥',
    },
    {
      heading: 'Study Groups',
      description: 'Create or join study groups for your courses.',
      icon:  '📚',
    },
    {
      heading: 'Campus Events',
      description: 'Discover and participate in campus events and activities.',
      icon: '🎉',
    },
  ]

  const testimonials: Testimonial[] = [
    {
      name: 'Keane M.',
      content: "If it were not for this app, I would be single🤷‍♂️",
      designation: 'BBIT Year 4',
      avatar: '/Keane.jpg',
    },
    {
      name: 'Claude K.',
      content: "I love this app😍",
      designation: 'CNS Year 3',
      avatar: '/Claude.jpg',
    },
    {
      name: 'Lyon A.',
      content: "Since downloading sonder I have been able to make many new friends!😊",
      designation: 'BICS Year 1',
      avatar: '/Lyon.jpg',
    },
  ]

  return (
    <main className="dark">
      <div className="bg-black text-slate-200">
        <LandingNavBar navItems={navItems} />
        
        <LandingHero
          title="Connect, Learn, and Thrive Together"
          subtitle="Sonder brings university students together, helping you find friends who share your interests, courses, and campus experiences."
          buttonText="Join Sonder"
          pictureUrl="/collegeImage.webp"
        />

        <LandingFeatures
          title="Why Choose Sonder?"
          subtitle="Discover the features that make Sonder the ultimate platform for university students."
          features={features}
        />

        <LandingTestimonials
          title="What Students Say About Sonder"
          subtitle="Hear from students who have found their community through Sonder."
          testimonials={testimonials}
        />

        <LandingCTA
          title="Ready to Find Your Campus Crew?"
          subtitle="Join thousands of students already connecting on Sonder."
          buttonText="Get Started"
          buttonLink="/api/auth/signin"
        />

        <LandingFooter />
      </div>
    </main>
  )
}