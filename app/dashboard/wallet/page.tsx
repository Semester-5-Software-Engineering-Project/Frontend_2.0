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
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
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
        <div className="p-6">
          <Alert variant="destructive" className="max-w-2xl">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access restricted</AlertTitle>
            <AlertDescription>
              This page is only available to tutors.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Wallet</h1>
          <Button 
            onClick={() => setShowWithdrawDialog(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Request Withdrawal
          </Button>
        </div>

        {loading && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> <span>Loading balance...</span>
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 max-w-md">
            {error}
          </div>
        )}
        {!loading && !error && (
          <Card className="border-2 border-primary/20 max-w-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" /> Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${availableBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Funds you can withdraw now</p>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal History */}
        {!loading && !error && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Withdrawal History
              </CardTitle>
              <CardDescription>
                Your recent withdrawal requests ({totalWithdrawals} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading withdrawals...</span>
                  </div>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No withdrawal requests yet</p>
                  <p className="text-xs mt-1">Your withdrawal history will appear here</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal, index) => (
                      <div key={withdrawal.withdrawalId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-[#F6BC0E] rounded-full flex items-center justify-center">
                              <Download className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium">Withdrawal #{(currentPage - 1) * 10 + index + 1}</h4>
                              {getStatusBadge(withdrawal.status)}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(withdrawal.createdAt)}</span>
                              <span>•</span>
                              <span>{withdrawal.bankName}</span>
                              <span>•</span>
                              <span>****{withdrawal.accountNumber.slice(-4)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[#F6BC0E]">
                            ${withdrawal.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {withdrawals.length} of {totalWithdrawals} withdrawals
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
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
                                className="h-8 w-8 p-0"
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
                          className="h-8 w-8 p-0"
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
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Request Withdrawal
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Complete the form below to request a withdrawal from your wallet
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Amount & Balance */}
              <div className="space-y-4">
                {/* Available Balance Info */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Available Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">${availableBalance.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for withdrawal</p>
                </div>

                {/* Withdrawal Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">Withdrawal Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawalData.amount}
                      onChange={(e) => setWithdrawalData({...withdrawalData, amount: e.target.value})}
                      min="0"
                      max={availableBalance}
                      step="0.01"
                      className="pl-10 text-lg font-medium"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum: ${availableBalance.toFixed(2)}
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Select</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (availableBalance * 0.25).toFixed(2)})}
                      className="text-xs"
                    >
                      25%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (availableBalance * 0.5).toFixed(2)})}
                      className="text-xs"
                    >
                      50%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (availableBalance * 0.75).toFixed(2)})}
                      className="text-xs"
                    >
                      75%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: availableBalance.toFixed(2)})}
                      className="text-xs"
                    >
                      Max
                    </Button>
                  </div>
                </div>
              </div>

              {/* Middle Column - Bank Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  <h4 className="font-semibold text-sm">Bank Account Details</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="accountHolderName" className="text-sm font-medium">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      value={withdrawalData.accountHolderName}
                      onChange={(e) => setWithdrawalData({...withdrawalData, accountHolderName: e.target.value})}
                      placeholder="John Doe"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="bankName" className="text-sm font-medium">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={withdrawalData.bankName}
                      onChange={(e) => setWithdrawalData({...withdrawalData, bankName: e.target.value})}
                      placeholder="Bank of America"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={withdrawalData.accountNumber}
                      onChange={(e) => setWithdrawalData({...withdrawalData, accountNumber: e.target.value})}
                      placeholder="1234567890"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Notes & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  <h4 className="font-semibold text-sm">Additional Information</h4>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={withdrawalData.notes}
                    onChange={(e) => setWithdrawalData({...withdrawalData, notes: e.target.value})}
                    placeholder="Any special instructions for this withdrawal..."
                    rows={4}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Processing Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">Processing Information:</p>
                      <ul className="space-y-0.5 text-xs">
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
                    className="w-full bg-primary hover:bg-primary/90 h-11"
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
                    className="w-full h-11"
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