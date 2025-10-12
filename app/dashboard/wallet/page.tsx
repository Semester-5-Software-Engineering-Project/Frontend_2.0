'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Wallet, Download, DollarSign, AlertCircle, Loader2, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import axiosInstance from '@/app/utils/axiosInstance'

interface WalletResponse {
  availableBalance: number
}

interface Withdrawal {
  withdrawalId: string
  tutorId: string
  tutorName: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  method: string
  accountName: string
  bankName: string
  accountNumber: string
  notes: string
  createdAt: string
  processedAt: string | null
}

interface WithdrawalsResponse {
  withdrawals: Withdrawal[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export default function WalletPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Debug user state
  useEffect(() => {
    console.log('WalletPage - Current user:', user)
    console.log('WalletPage - User ID:', user?.id)
    console.log('WalletPage - User role:', user?.role)
  }, [user])
  
  const [availableBalance, setAvailableBalance] = useState<number>(0)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)
  
  const [loading, setLoading] = useState(true)
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false)
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    notes: ''
  })

  // Fetch real wallet data
  useEffect(() => {
  const fetchWallet = async () => {
    try {
      const res = await axiosInstance.get<WalletResponse>(`/api/wallet/mywallet`)
      setAvailableBalance(res.data.availableBalance || 0)
      console.log("Wallet balance : " + res.data.availableBalance)
    } catch (e: any) {
      console.error('Failed to fetch wallet:', e)
      setError(e?.response?.data?.message || 'Failed to load wallet')
      setAvailableBalance(0)
    } finally {
      setLoading(false)
    }
  }

  fetchWallet()
}, [user?.id])

  // Fetch withdrawals with pagination
  const fetchWithdrawals = async (page: number = 1) => {
    setWithdrawalsLoading(true)
    try {
      console.log(`Fetching withdrawals for page ${page}...`)
      const res = await axiosInstance.get(`/api/wallet/withdrawals?page=${page - 1}&size=10`)
      console.log('Withdrawals response:', res.data)
      
      // Handle different response formats
      let withdrawalsData = []
      let totalCount = 0
      let totalPages = 1
      let currentPageNum = page
      
      if (Array.isArray(res.data)) {
        // If response is directly an array
        withdrawalsData = res.data
        totalCount = res.data.length
        totalPages = Math.ceil(totalCount / 10)
      } else if (res.data.withdrawals) {
        // If response has withdrawals property
        withdrawalsData = res.data.withdrawals
        totalCount = res.data.totalCount || res.data.withdrawals.length
        totalPages = res.data.totalPages || Math.ceil(totalCount / 10)
        currentPageNum = (res.data.currentPage || (page - 1)) + 1
      } else if (res.data.content) {
        // If using Spring Boot pagination format
        withdrawalsData = res.data.content
        totalCount = res.data.totalElements || res.data.content.length
        totalPages = res.data.totalPages || Math.ceil(totalCount / 10)
        currentPageNum = (res.data.number || (page - 1)) + 1
      }
      
      console.log('Processed withdrawals:', withdrawalsData)
      console.log('Total count:', totalCount)
      
      setWithdrawals(withdrawalsData)
      setCurrentPage(currentPageNum)
      setTotalPages(totalPages)
      setTotalWithdrawals(totalCount)
    } catch (e: any) {
      console.error('Failed to fetch withdrawals:', e)
      console.error('Error response:', e.response?.data)
      setWithdrawals([])
    } finally {
      setWithdrawalsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Component mounted, fetching withdrawals...')
    fetchWithdrawals(1) // Always fetch withdrawals on page load
  }, [])


  const handleWithdrawRequest = async () => {
    if (!withdrawalData.amount || !withdrawalData.bankName || !withdrawalData.accountNumber || !withdrawalData.accountHolderName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const amount = parseFloat(withdrawalData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (amount > availableBalance) {
      toast({
        title: "Error",
        description: "Insufficient balance for this withdrawal",
        variant: "destructive",
      })
      return
    }

    setIsProcessingWithdraw(true)
    
    try {
      // Build DTO matching backend WithdrawalDto
      const payload = {
        amount,
        method: 'BANK_TRANSFER',
        accountName: withdrawalData.accountHolderName,
        bankName: withdrawalData.bankName,
        accountNumber: withdrawalData.accountNumber,
        notes: withdrawalData.notes || null,
      }

      const res = await axiosInstance.post('/api/wallet/withdraw', payload)

      // Use server message if provided, else default success text
      const serverMessage = (res?.data && typeof res.data === 'string') ? res.data : 'Withdrawal request submitted.'

      // Append transaction locally (optimistic update)
      // Refresh wallet balance after successful request
      try {
        const refreshed = await axiosInstance.get<WalletResponse>(`/api/wallet/mywallet`)
        setAvailableBalance(refreshed.data.availableBalance || availableBalance)
        console.log('Wallet balance refreshed after withdrawal request.')
        
        // Refresh withdrawals list to show the new request
        fetchWithdrawals(1)
        setCurrentPage(1)
      } catch {}

      setWithdrawalData({
        amount: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        notes: ''
      })

      setShowWithdrawDialog(false)

      toast({
        title: "Success",
        description: serverMessage || "Withdrawal request submitted successfully. It will be processed within 2-3 business days.",
      })
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message || error?.response?.data || 'Failed to submit withdrawal request. Please try again.'
      toast({
        title: "Error",
        description: apiMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessingWithdraw(false)
    }
  }

  // Helper functions for withdrawal display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-semibold">Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200 font-semibold">Rejected</Badge>
      default:
        return <Badge variant="secondary" className="font-semibold">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchWithdrawals(page)
  }

  // Removed transaction/status helpers because UI simplified

  if (user?.role !== 'TUTOR') {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto mt-12">
          <Alert variant="destructive" className="border-2 border-red-200 shadow-md">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="font-bold text-lg">Access Restricted</AlertTitle>
            <AlertDescription className="font-medium">
              This page is only available to tutors.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-cy="wallet-page">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200" data-cy="wallet-header">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-cy="wallet-title">My Wallet</h1>
              <p className="text-gray-600 mt-1" data-cy="wallet-description">Manage your earnings and withdrawal requests</p>
            </div>
            <Button 
              onClick={() => setShowWithdrawDialog(true)}
              className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold shadow-md"
              data-cy="request-withdrawal-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              Request Withdrawal
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Loader2 className="w-4 h-4 animate-spin" /> <span className="font-medium">Loading balance...</span>
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-lg p-4 max-w-md shadow-sm">
            <span className="font-medium">{error}</span>
          </div>
        )}
        {!loading && !error && (
          <Card className="border-none shadow-md max-w-sm hover:shadow-lg transition-shadow" data-cy="balance-card">
            <CardHeader className="pb-3 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                <Wallet className="h-5 w-5 text-[#FBBF24]" /> Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-[#FBBF24]" data-cy="available-balance">${availableBalance.toFixed(2)}</div>
              <p className="text-sm text-gray-600 mt-2 font-medium">Funds you can withdraw now</p>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal History */}
        {!loading && !error && (
          <Card className="border-none shadow-md" data-cy="withdrawal-history-card">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Clock className="w-5 h-5 text-gray-700" />
                Withdrawal History
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your recent withdrawal requests ({totalWithdrawals} total)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6" data-cy="withdrawal-history-content">
              {withdrawalsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2 text-gray-600" data-cy="loading-spinner">
                    <Loader2 className="w-5 h-5 animate-spin text-[#FBBF24]" />
                    <span className="font-medium">Loading withdrawals...</span>
                  </div>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-12" data-cy="no-withdrawals">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No withdrawal requests yet</h3>
                  <p className="text-sm text-gray-600">Your withdrawal history will appear here</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3" data-cy="withdrawal-list">
                    {withdrawals.map((withdrawal, index) => (
                      <div key={withdrawal.withdrawalId} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:shadow-md hover:border-[#FBBF24] transition-all bg-white" data-cy="withdrawal-item">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-[#FBBF24] rounded-full flex items-center justify-center shadow-sm">
                              <Download className="w-5 h-5 text-black" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-gray-900" data-cy="withdrawal-number">Withdrawal #{(currentPage - 1) * 10 + index + 1}</h4>
                              <span data-cy="withdrawal-status">{getStatusBadge(withdrawal.status)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span className="font-medium" data-cy="withdrawal-date">{formatDate(withdrawal.createdAt)}</span>
                              <span>•</span>
                              <span data-cy="withdrawal-bank">{withdrawal.bankName}</span>
                              <span>•</span>
                              <span data-cy="withdrawal-account">****{withdrawal.accountNumber.slice(-4)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-[#FBBF24]" data-cy="withdrawal-amount">
                            ${withdrawal.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200" data-cy="pagination">
                      <div className="text-sm text-gray-600 font-medium">
                        Showing {withdrawals.length} of {totalWithdrawals} withdrawals
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0 border-gray-300"
                          data-cy="prev-page-btn"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className={`h-8 w-8 p-0 ${
                                  currentPage === pageNum 
                                    ? 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black border-[#FBBF24]' 
                                    : 'border-gray-300'
                                }`}
                                data-cy={`page-${pageNum}-btn`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0 border-gray-300"
                          data-cy="next-page-btn"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Withdrawal Dialog */}
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog} data-cy="withdrawal-dialog">
          <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <Download className="w-6 h-6 text-[#FBBF24]" />
                Request Withdrawal
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 font-medium">
                Complete the form below to request a withdrawal from your wallet
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Amount & Balance */}
              <div className="space-y-4">
                {/* Available Balance Info */}
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-[#FBBF24]/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-[#FBBF24]" />
                    <span className="text-sm font-bold text-gray-900">Available Balance</span>
                  </div>
                  <div className="text-3xl font-bold text-[#FBBF24]" data-cy="dialog-available-balance">${availableBalance.toFixed(2)}</div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Ready for withdrawal</p>
                </div>

                {/* Withdrawal Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-bold text-gray-900">Withdrawal Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawalData.amount}
                      onChange={(e) => setWithdrawalData({...withdrawalData, amount: e.target.value})}
                      min="0"
                      max={availableBalance}
                      step="0.01"
                      className="pl-10 text-lg font-semibold border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                      data-cy="withdrawal-amount-input"
                    />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Maximum: ${availableBalance.toFixed(2)}
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-900">Quick Select</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (availableBalance * 0.25).toFixed(2)})}
                      className="text-xs border-gray-300 hover:bg-yellow-50 hover:border-[#FBBF24] font-semibold"
                    >
                      25%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (availableBalance * 0.5).toFixed(2)})}
                      className="text-xs border-gray-300 hover:bg-yellow-50 hover:border-[#FBBF24] font-semibold"
                    >
                      50%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (availableBalance * 0.75).toFixed(2)})}
                      className="text-xs border-gray-300 hover:bg-yellow-50 hover:border-[#FBBF24] font-semibold"
                    >
                      75%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: availableBalance.toFixed(2)})}
                      className="text-xs border-gray-300 hover:bg-yellow-50 hover:border-[#FBBF24] font-semibold"
                    >
                      Max
                    </Button>
                  </div>
                </div>
              </div>

              {/* Middle Column - Bank Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-[#FBBF24] rounded-full"></div>
                  <h4 className="font-bold text-sm text-gray-900">Bank Account Details</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="accountHolderName" className="text-sm font-semibold text-gray-900">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      value={withdrawalData.accountHolderName}
                      onChange={(e) => setWithdrawalData({...withdrawalData, accountHolderName: e.target.value})}
                      placeholder="John Doe"
                      className="text-sm border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="bankName" className="text-sm font-semibold text-gray-900">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={withdrawalData.bankName}
                      onChange={(e) => setWithdrawalData({...withdrawalData, bankName: e.target.value})}
                      placeholder="Bank of America"
                      className="text-sm border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="accountNumber" className="text-sm font-semibold text-gray-900">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={withdrawalData.accountNumber}
                      onChange={(e) => setWithdrawalData({...withdrawalData, accountNumber: e.target.value})}
                      placeholder="1234567890"
                      className="text-sm border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Notes & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-[#FBBF24] rounded-full"></div>
                  <h4 className="font-bold text-sm text-gray-900">Additional Information</h4>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-900">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={withdrawalData.notes}
                    onChange={(e) => setWithdrawalData({...withdrawalData, notes: e.target.value})}
                    placeholder="Any special instructions for this withdrawal..."
                    rows={4}
                    className="text-sm resize-none border-gray-300 focus:border-[#FBBF24] focus:ring-[#FBBF24]"
                  />
                </div>

                {/* Processing Info */}
                <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-bold mb-1">Processing Information:</p>
                      <ul className="space-y-0.5 text-xs font-medium">
                        <li>• Withdrawals are processed within 2-3 business days</li>
                        <li>• A processing fee may apply</li>
                        <li>• You&apos;ll receive an email confirmation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleWithdrawRequest}
                    disabled={isProcessingWithdraw}
                    className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-bold h-11 shadow-md"
                  >
                    {isProcessingWithdraw ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Request...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Submit Withdrawal Request
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => setShowWithdrawDialog(false)}
                    variant="outline"
                    disabled={isProcessingWithdraw}
                    className="w-full h-11 border-gray-300 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}