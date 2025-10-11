'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Video, Star, Clock, Shield } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import HeroCarousel from './ui/HeroCarousel'

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#FBBF24] rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">TutorVerse</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-[#FBBF24] transition-colors font-semibold">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-300 hover:text-[#FBBF24] transition-colors font-semibold">How it Works</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-300 hover:text-[#FBBF24] transition-colors font-semibold">Pricing</button>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-semibold shadow-md">
                Log In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <HeroCarousel />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-white to-gray-100">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with Expert
            <span className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent block mt-2">Tutors Online</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto font-medium">
            Join thousands of students and tutors on our platform. Schedule sessions, 
            access course materials, and learn from anywhere with integrated video conferencing.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black text-lg px-8 py-6 font-bold shadow-lg hover:shadow-xl transition-all">
                Get Started
              </Button>
            </Link>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Learn</h2>
            <p className="text-xl text-gray-600 font-medium">Comprehensive tools for modern online education</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all hover:border-[#FBBF24] border border-transparent">
              <CardHeader className="p-6">
                <div className="w-14 h-14 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-[#FBBF24]" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">HD Video Sessions</CardTitle>
                <CardDescription className="text-gray-600 font-medium mt-2">
                  High-quality video conferencing with Jitsi integration for seamless learning
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all hover:border-[#FBBF24] border border-transparent">
              <CardHeader className="p-6">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Expert Tutors + AI Study Assistant</CardTitle>
                <CardDescription className="text-gray-600 font-medium mt-2">
                  Connect with qualified tutors across various subjects and skill levels
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all hover:border-[#FBBF24] border border-transparent">
              <CardHeader className="p-6">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Flexible Scheduling</CardTitle>
                <CardDescription className="text-gray-600 font-medium mt-2">
                  Book sessions at your convenience with automated reminders and notifications
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all hover:border-[#FBBF24] border border-transparent">
              <CardHeader className="p-6">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Course Materials</CardTitle>
                <CardDescription className="text-gray-600 font-medium mt-2">
                  Access comprehensive learning materials, documents, and resources
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all hover:border-[#FBBF24] border border-transparent">
              <CardHeader className="p-6">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Secure Payments</CardTitle>
                <CardDescription className="text-gray-600 font-medium mt-2">
                  Safe and secure payment processing for all your learning needs
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all hover:border-[#FBBF24] border border-transparent">
              <CardHeader className="p-6">
                <div className="w-14 h-14 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-[#FBBF24]" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Reviews & Ratings</CardTitle>
                <CardDescription className="text-gray-600 font-medium mt-2">
                  Rate your experience and help others find the best tutors
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 font-medium">Get started in just a few simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-3xl font-bold text-black">1</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">Create Your Account</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Sign up as a student or tutor in seconds. Complete your profile to get started.
                  </CardDescription>
                </CardHeader>
              </Card>
              {/* Connector Arrow - Hidden on mobile */}
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-[#FBBF24] text-4xl z-10">
                →
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">Find Your Tutor</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Browse through our expert tutors, check ratings, and find the perfect match for your needs.
                  </CardDescription>
                </CardHeader>
              </Card>
              {/* Connector Arrow - Hidden on mobile */}
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-[#FBBF24] text-4xl z-10">
                →
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">Enroll For a Module</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Book a session at your convenience. Receive instant confirmation and reminders.
                  </CardDescription>
                </CardHeader>
              </Card>
              {/* Connector Arrow - Hidden on mobile */}
              <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-[#FBBF24] text-4xl z-10">
                →
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-3xl font-bold text-white">4</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">Start Learning</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Join HD video sessions, access materials, and achieve your learning goals.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <Link href="/auth">
              <Button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black text-lg px-10 py-6 font-bold shadow-lg hover:shadow-xl transition-all">
                Start Your Journey Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fair & Transparent Pricing</h2>
            <p className="text-xl text-gray-600 font-medium">Every tutor sets their own fair price for their modules</p>
          </div>
          
          {/* Main Pricing Card */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] border-none shadow-2xl overflow-hidden">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <h3 className="text-4xl font-bold text-black mb-4">Pay Per Module</h3>
                  <p className="text-xl text-gray-900 font-semibold">Simple, Fair, Transparent</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-8 h-8 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-black mb-2">Tutor-Set Pricing</h4>
                    <p className="text-sm text-gray-900">Tutors determine fair prices based on expertise</p>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-8 h-8 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-black mb-2">No Hidden Fees</h4>
                    <p className="text-sm text-gray-900">What you see is what you pay - completely transparent</p>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-8 h-8 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-black mb-2">No Subscriptions</h4>
                    <p className="text-sm text-gray-900">Pay only for the modules you want to learn</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-8">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">What&apos;s Included</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 font-medium">HD/4K video sessions</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 font-medium">All course materials</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 font-medium">AI Study Assistant</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 font-medium">Lifetime module access</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 font-medium">Direct tutor support</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 font-medium">Completion certificates</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Our platform empowers tutors to set fair prices that reflect their expertise and the value they provide. 
              Students benefit from transparent pricing with <strong className="text-[#FBBF24]">no subscriptions, no hidden fees</strong> - 
              just quality education at fair prices.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 border-t border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-[#FBBF24] rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold">TutorVerset</span>
          </div>
          <p className="text-gray-300 mb-6 font-medium">Connecting learners with expert tutors worldwide</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <a href="#" className="hover:text-[#FBBF24] transition-colors font-semibold">Privacy Policy</a>
            <a href="#" className="hover:text-[#FBBF24] transition-colors font-semibold">Terms of Service</a>
            <a href="#" className="hover:text-[#FBBF24] transition-colors font-semibold">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}