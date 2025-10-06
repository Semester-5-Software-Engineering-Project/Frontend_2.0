'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  TrendingUp, 
  Download, 
  Plus,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Mock data - replace with actual API calls
interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed'
  date: string
  reference?: string
}

interface WalletData {
  balance: number
  totalEarnings: number
  pendingWithdrawals: number
  transactions: Transaction[]
}

export default function WalletPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    totalEarnings: 0,
    pendingWithdrawals: 0,
    transactions: []
  })
  
  const [loading, setLoading] = useState(true)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false)
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    routingNumber: '',
    notes: ''
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockData: WalletData = {
      balance: 1250.75,
      totalEarnings: 3500.00,
      pendingWithdrawals: 500.00,
      transactions: [
        {
          id: '1',
          type: 'credit',
          amount: 150.00,
          description: 'Payment for Mathematics Course - John Doe',
          status: 'completed',
          date: '2025-10-05T10:30:00Z',
          reference: 'PAY-001'
        },
        {
          id: '2',
          type: 'debit',
          amount: 200.00,
          description: 'Withdrawal to Bank Account',
          status: 'pending',
          date: '2025-10-04T15:45:00Z',
          reference: 'WTH-002'
        },
        {
          id: '3',
          type: 'credit',
          amount: 300.00,
          description: 'Payment for Physics Course - Jane Smith',
          status: 'completed',
          date: '2025-10-03T09:15:00Z',
          reference: 'PAY-003'
        },
        {
          id: '4',
          type: 'debit',
          amount: 100.00,
          description: 'Withdrawal to Bank Account',
          status: 'failed',
          date: '2025-10-02T14:20:00Z',
          reference: 'WTH-004'
        },
        {
          id: '5',
          type: 'credit',
          amount: 225.50,
          description: 'Payment for Chemistry Course - Mike Johnson',
          status: 'completed',
          date: '2025-10-01T11:00:00Z',
          reference: 'PAY-005'
        }
      ]
    }
    
    setTimeout(() => {
      setWalletData(mockData)
      setLoading(false)
    }, 1000)
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

    if (amount > walletData.balance) {
      toast({
        title: "Error",
        description: "Insufficient balance for this withdrawal",
        variant: "destructive",
      })
      return
    }

    setIsProcessingWithdraw(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful withdrawal request
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'debit',
        amount: amount,
        description: `Withdrawal to ${withdrawalData.bankName}`,
        status: 'pending',
        date: new Date().toISOString(),
        reference: `WTH-${Date.now()}`
      }
      
      setWalletData(prev => ({
        ...prev,
        pendingWithdrawals: prev.pendingWithdrawals + amount,
        transactions: [newTransaction, ...prev.transactions]
      }))
      
      setWithdrawalData({
        amount: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        routingNumber: '',
        notes: ''
      })
      
      setShowWithdrawDialog(false)
      
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully. It will be processed within 2-3 business days.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingWithdraw(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading wallet data...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Wallet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">${walletData.balance.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Available for withdrawal</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${walletData.totalEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All time earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">${walletData.pendingWithdrawals.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Being processed</p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent payments and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                {walletData.transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {walletData.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {transaction.type === 'credit' ? (
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <ArrowDownLeft className="w-5 h-5 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{transaction.description}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(transaction.date)}</span>
                              {transaction.reference && (
                                <>
                                  <span>•</span>
                                  <span>Ref: {transaction.reference}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`font-semibold ${
                              transaction.type === 'credit' ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </div>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(transaction.status)}
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
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
                  <div className="text-2xl font-bold text-primary">${walletData.balance.toFixed(2)}</div>
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
                      max={walletData.balance}
                      step="0.01"
                      className="pl-10 text-lg font-medium"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum: ${walletData.balance.toFixed(2)}
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
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (walletData.balance * 0.25).toFixed(2)})}
                      className="text-xs"
                    >
                      25%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (walletData.balance * 0.5).toFixed(2)})}
                      className="text-xs"
                    >
                      50%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: (walletData.balance * 0.75).toFixed(2)})}
                      className="text-xs"
                    >
                      75%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalData({...withdrawalData, amount: walletData.balance.toFixed(2)})}
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

                  <div className="space-y-1">
                    <Label htmlFor="routingNumber" className="text-sm font-medium">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={withdrawalData.routingNumber}
                      onChange={(e) => setWithdrawalData({...withdrawalData, routingNumber: e.target.value})}
                      placeholder="021000021"
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