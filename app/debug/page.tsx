'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import axiosInstance from '@/app/utils/axiosInstance'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults: any[] = []

    // Test 1: Check cookies
    testResults.push({
      test: 'Cookie Check',
      status: 'info',
      data: {
        allCookies: document.cookie,
        jwtToken: document.cookie.match(/jwtToken=([^;]+)/)?.[1] || 'Not found',
        jwt_token: document.cookie.match(/jwt_token=([^;]+)/)?.[1] || 'Not found',
        localStorage_token: localStorage.getItem('token') || 'Not found',
        localStorage_user: localStorage.getItem('user') || 'Not found'
      }
    })

    // Test 2: Check auth status
    try {
      const authRes = await axiosInstance.get('/api/getuser')
      testResults.push({
        test: 'Auth Status (/api/getuser)',
        status: 'success',
        data: authRes.data
      })
    } catch (error: any) {
      testResults.push({
        test: 'Auth Status (/api/getuser)',
        status: 'error',
        data: {
          status: error.response?.status,
          message: error.response?.data || error.message
        }
      })
    }

    // Test 3: Check tutor profile (if user is tutor)
    if (user?.role === 'TUTOR') {
      try {
        const tutorRes = await axiosInstance.get('/api/tutor-profile/me')
        testResults.push({
          test: 'Tutor Profile (/api/tutor-profile/me)',
          status: 'success',
          data: tutorRes.data
        })
      } catch (error: any) {
        testResults.push({
          test: 'Tutor Profile (/api/tutor-profile/me)',
          status: 'error',
          data: {
            status: error.response?.status,
            message: error.response?.data || error.message,
            headers: error.response?.headers
          }
        })
      }
    }

    // Test 4: Check student profile (if user is student)
    if (user?.role === 'STUDENT') {
      try {
        const studentRes = await axiosInstance.get('/api/student-profile/me')
        testResults.push({
          test: 'Student Profile (/api/student-profile/me)',
          status: 'success',
          data: studentRes.data
        })
      } catch (error: any) {
        testResults.push({
          test: 'Student Profile (/api/student-profile/me)',
          status: 'error',
          data: {
            status: error.response?.status,
            message: error.response?.data || error.message,
            headers: error.response?.headers
          }
        })
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Tool</CardTitle>
          <p className="text-sm text-gray-600">
            This tool helps diagnose authentication and profile issues
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Current User Status:</h3>
              <div className="bg-gray-50 p-3 rounded">
                <pre className="text-sm">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>

            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Running Tests...' : 'Run Diagnostic Tests'}
            </Button>

            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Test Results:</h3>
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{result.test}</CardTitle>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}