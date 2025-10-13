'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  Search,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function Payments() {
  const { user } = useAuth()

  const transactions = [
    {
      id: 'TXN-001',
      course: 'Advanced Mathematics',
      tutor: 'Dr. Sarah Johnson',
      amount: 150,
      date: '2024-01-10',
      status: 'completed',
      type: 'course_payment'
    },
    {
      id: 'TXN-002',
      course: 'Physics Fundamentals',
      tutor: 'Prof. Michael Chen',
      amount: 180,
      date: '2024-01-08',
      status: 'completed',
      type: 'course_payment'
    },
    {
      id: 'TXN-003',
      course: 'Chemistry Lab Prep',
      tutor: 'Dr. Emily Davis',
      amount: 120,
      date: '2024-01-05',
      status: 'pending',
      type: 'course_payment'
    }
  ]

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      isDefault: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200 font-semibold'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 font-semibold'
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200 font-semibold'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 font-semibold'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments & Billing</h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'STUDENT' 
                  ? 'Manage your course payments and billing information'
                  : 'Track your earnings and payment history'
                }
              </p>
            </div>
            {user?.role === 'STUDENT' && (
              <Button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md">
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            )}
          </div>
        </div>

        {/* Payment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-[#FBBF24]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">Rs. {totalSpent}</p>
                  <p className="text-sm text-gray-500 font-medium">
                    {user?.role === 'STUDENT' ? 'Total Spent' : 'Total Earned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">Rs. {user?.role === 'STUDENT' ? '180' : '450'}</p>
                  <p className="text-sm text-gray-500 font-medium">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{transactions.filter(t => t.status === 'completed').length}</p>
                  <p className="text-sm text-gray-500 font-medium">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{transactions.filter(t => t.status === 'pending').length}</p>
                  <p className="text-sm text-gray-500 font-medium">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="xl:col-span-2">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Transaction History</CardTitle>
                    <CardDescription className="font-medium">Your recent payment activity</CardDescription>
                  </div>
                  <Button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search transactions..." 
                    className="pl-10 border-gray-200 focus:ring-[#FBBF24] focus:border-[#FBBF24]" 
                  />
                </div>

                {/* Transactions */}
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="border border-gray-200 rounded-xl p-4 hover:border-[#FBBF24] hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(transaction.status)}
                            <h4 className="font-semibold text-gray-900">{transaction.course}</h4>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1 font-medium">
                            {user?.role === 'STUDENT' ? 'Tutor: ' : 'Student: '}
                            {transaction.tutor}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Transaction ID: {transaction.id}</span>
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">Rs. {transaction.amount}</p>
                          <Button 
                            size="sm" 
                            className="mt-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods & Quick Actions */}
          <div className="space-y-6">
            {user?.role === 'STUDENT' && (
              <Card className="border-none shadow-md">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-lg font-bold text-gray-900">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-[#FBBF24] hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#FBBF24]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          {method.brand} •••• {method.last4}
                        </p>
                        {method.isDefault && (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200 font-semibold">Default</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md">
                    Add New Card
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <Button className="w-full justify-start bg-white hover:bg-[#FBBF24]/10 text-gray-900 border border-gray-200 hover:border-[#FBBF24] font-semibold shadow-sm hover:shadow-md transition-all">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button className="w-full justify-start bg-white hover:bg-[#FBBF24]/10 text-gray-900 border border-gray-200 hover:border-[#FBBF24] font-semibold shadow-sm hover:shadow-md transition-all">
                  <Calendar className="w-4 h-4 mr-2" />
                  Payment Schedule
                </Button>
                <Button className="w-full justify-start bg-white hover:bg-[#FBBF24]/10 text-gray-900 border border-gray-200 hover:border-[#FBBF24] font-semibold shadow-sm hover:shadow-md transition-all">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing Settings
                </Button>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Completed Payments</span>
                  <span className="font-bold text-[#FBBF24]">
                    Rs. {transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Pending Payments</span>
                  <span className="font-bold text-yellow-600">
                    Rs. {transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">Rs. {transactions.reduce((sum, t) => sum + t.amount, 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}