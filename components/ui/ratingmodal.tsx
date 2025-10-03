import React, { useState } from 'react'
import { Star, X, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RatingData {
  rating: number
  feedback: string
}

interface ModuleRatingModalProps {
  isOpen: boolean
  onClose: () => void
  moduleTitle: string
  onSubmitRating: (data: RatingData) => Promise<void>
}

const ModuleRatingModal: React.FC<ModuleRatingModalProps> = ({ isOpen, onClose, moduleTitle, onSubmitRating }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarClick = (starValue: number) => {
    setRating(starValue)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmitRating({
        rating,
        feedback: feedback.trim()
      })
      
      // Reset form
      setRating(0)
      setHoverRating(0)
      setFeedback('')
      onClose()
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (stars: number): string => {
    switch (stars) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Select Rating'
    }
  }

  const getRatingColor = (stars: number): string => {
    switch (stars) {
      case 1: return 'text-red-500'
      case 2: return 'text-orange-500'
      case 3: return 'text-yellow-500'
      case 4: return 'text-blue-500'
      case 5: return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Rate This Module</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Module Info */}
          <div className="text-center space-y-2">
            <h3 className="font-medium text-gray-900">{moduleTitle}</h3>
            <p className="text-sm text-gray-500">How would you rate your learning experience?</p>
          </div>

          {/* Star Rating */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Rating Text */}
            <div className="text-center">
              <span className={`text-lg font-medium ${getRatingColor(hoverRating || rating)}`}>
                {getRatingText(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about this module. What did you like? What could be improved?"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Help others learn better</span>
              <span>{feedback.length}/500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Send classNam
                  
                  
                  e="w-4 h-4" />
                  <span>Submit Rating</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModuleRatingModal