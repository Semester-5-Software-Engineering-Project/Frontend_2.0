'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Filter,
  TrendingUp,
  Users,
  Award
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Label } from 'recharts'

export default function Reviews() {
  const { user } = useAuth()
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState('')

  const reviews = [
    {
      id: 1,
      STUDENT: 'Alex Smith',
      course: 'Advanced Mathematics',
      rating: 5,
      comment: 'Excellent explanation of complex topics. Dr. Johnson makes calculus easy to understand and provides great practice problems.',
      date: '2024-01-10',
      helpful: 12,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      STUDENT: 'Emma Wilson',
      course: 'Calculus Fundamentals',
      rating: 5,
      comment: 'Amazing TUTOR! Very patient and knowledgeable. The course materials are comprehensive and well-organized.',
      date: '2024-01-08',
      helpful: 8,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c0479506?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      STUDENT: 'John Davis',
      course: 'Advanced Mathematics',
      rating: 4,
      comment: 'Great course overall. Could use more interactive examples, but the content is solid.',
      date: '2024-01-05',
      helpful: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      STUDENT: 'Sarah Lee',
      course: 'Statistics & Probability',
      rating: 5,
      comment: 'Perfect for exam preparation! The step-by-step approach really helped me understand difficult concepts.',
      date: '2024-01-03',
      helpful: 15,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ]

  const stats = {
    averageRating: 4.8,
    totalReviews: 156,
    fiveStarPercent: 78,
    responseRate: 95
  }

  const handleSubmitReview = () => {
    if (!selectedRating || !reviewText.trim()) return
    
    // Submit review logic here
    setSelectedRating(null)
    setReviewText('')
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'STUDENT' 
                  ? 'Rate your tutors and read course reviews'
                  : 'Manage your reviews and student feedback'
                }
              </p>
            </div>
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 font-semibold">
              <Filter className="w-4 h-4 mr-2" />
              Filter Reviews
            </Button>
          </div>
        </div>

        {user?.role === 'TUTOR' && (
          /* TUTOR Stats */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Star className="w-7 h-7 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                    <p className="text-sm text-gray-500 font-medium">Avg. Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                    <p className="text-sm text-gray-500 font-medium">Total Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.fiveStarPercent}%</p>
                    <p className="text-sm text-gray-500 font-medium">5-Star Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Award className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.responseRate}%</p>
                    <p className="text-sm text-gray-500 font-medium">Response Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Reviews List */}
          <div className="xl:col-span-2">
            <Card className="border-none shadow-md">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {user?.role === 'STUDENT' ? 'Course Reviews' : 'Student Reviews'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {user?.role === 'STUDENT' 
                    ? 'See what other students say about courses'
                    : 'Feedback from your students'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback className="bg-[#FBBF24] text-black font-semibold">
                          {review.STUDENT.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">{review.STUDENT}</h4>
                            <p className="text-sm text-gray-600 font-medium">{review.course}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              {new Date(review.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                        <div className="flex items-center space-x-4">
                          <Button size="sm" variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful ({review.helpful})
                          </Button>
                          {user?.role === 'TUTOR' && (
                            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Reply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {user?.role === 'STUDENT' && (
              /* Leave a Review */
              <Card className="border-none shadow-md">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                  <CardTitle className="text-lg font-bold text-gray-900">Leave a Review</CardTitle>
                  <CardDescription className="text-gray-600">Share your experience with other students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setSelectedRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star 
                            className={`w-7 h-7 transition-colors ${
                              selectedRating && star <= selectedRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="review" className="text-sm font-semibold text-gray-900 block mb-2">Your Review</label>
                    <Textarea 
                      id="review"
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                      className="border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitReview}
                    className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md"
                    disabled={!selectedRating || !reviewText.trim()}
                  >
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Rating Distribution (for TUTORs) */}
            {user?.role === 'TUTOR' && (
              <Card className="border-none shadow-md">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                  <CardTitle className="text-lg font-bold text-gray-900">Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = stars === 5 ? 78 : stars === 4 ? 15 : stars === 3 ? 5 : 2
                    return (
                      <div key={stars} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-14">
                          <span className="text-sm font-semibold text-gray-900">{stars}</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-[#FBBF24] h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-medium w-10 text-right">{percentage}%</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="border-none shadow-md">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">New 5-star review received</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Course rating updated</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Achievement unlocked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}