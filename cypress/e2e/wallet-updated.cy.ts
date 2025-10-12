describe('Wallet Management', () => {
  beforeEach(() => {
    // Mock user authentication as tutor
    cy.intercept('GET', '/api/getuser', {
      statusCode: 200,
      body: {
        user: {
          id: 'tutor-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'TUTOR'
        }
      }
    })

    // Mock wallet balance
    cy.intercept('GET', '/api/wallet/mywallet', {
      statusCode: 200,
      body: {
        availableBalance: 1250.75
      }
    })

    // Mock withdrawal history
    cy.intercept('GET', '/api/wallet/withdrawals**', {
      statusCode: 200,
      body: {
        withdrawals: [
          {
            withdrawalId: 'wd-1',
            tutorId: 'tutor-123',
            tutorName: 'John Doe',
            amount: 500,
            status: 'PENDING',
            method: 'bank_transfer',
            accountName: 'John Doe',
            bankName: 'Commercial Bank',
            accountNumber: '1234567890',
            notes: 'Monthly withdrawal',
            createdAt: '2024-01-15T10:30:00Z',
            processedAt: null
          },
          {
            withdrawalId: 'wd-2',
            tutorId: 'tutor-123',
            tutorName: 'John Doe',
            amount: 750,
            status: 'APPROVED',
            method: 'bank_transfer',
            accountName: 'John Doe',
            bankName: 'People\'s Bank',
            accountNumber: '0987654321',
            notes: 'Previous withdrawal',
            createdAt: '2024-01-01T09:00:00Z',
            processedAt: '2024-01-02T14:30:00Z'
          }
        ],
        totalCount: 2,
        currentPage: 1,
        totalPages: 1
      }
    })

    cy.visit('/dashboard/wallet')
  })

  it('should display wallet page for tutors', () => {
    cy.get('[data-cy=wallet-page]').should('be.visible')
    cy.get('[data-cy=wallet-title]').should('contain', 'My Wallet')
    cy.get('[data-cy=wallet-description]').should('contain', 'Manage your earnings')
  })

  it('should show available balance', () => {
    cy.get('[data-cy=balance-card]').should('be.visible')
    cy.get('[data-cy=available-balance]').should('contain', '$1250.75')
  })

  it('should display withdrawal history', () => {
    cy.get('[data-cy=withdrawal-history-card]').should('be.visible')
    cy.get('[data-cy=withdrawal-list]').should('be.visible')
    cy.get('[data-cy=withdrawal-item]').should('have.length', 2)

    // Check first withdrawal
    cy.get('[data-cy=withdrawal-item]').first().within(() => {
      cy.get('[data-cy=withdrawal-amount]').should('contain', '$500.00')
      cy.get('[data-cy=withdrawal-status]').should('be.visible')
      cy.get('[data-cy=withdrawal-bank]').should('contain', 'Commercial Bank')
      cy.get('[data-cy=withdrawal-account]').should('contain', '****7890')
    })
  })

  it('should open withdrawal dialog when request button is clicked', () => {
    cy.get('[data-cy=request-withdrawal-btn]').click()
    cy.get('[data-cy=withdrawal-dialog]').should('be.visible')
    cy.get('[data-cy=dialog-available-balance]').should('contain', '$1250.75')
  })

  it('should handle withdrawal form submission', () => {
    // Mock successful withdrawal request
    cy.intercept('POST', '/api/wallet/withdraw', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Withdrawal request submitted successfully'
      }
    }).as('withdrawalRequest')

    cy.get('[data-cy=request-withdrawal-btn]').click()
    cy.get('[data-cy=withdrawal-dialog]').should('be.visible')

    // Fill out withdrawal form
    cy.get('[data-cy=withdrawal-amount-input]').type('500')
    cy.get('input[placeholder="Bank Name"]').type('Commercial Bank')
    cy.get('input[placeholder="Account Number"]').type('1234567890')
    cy.get('input[placeholder="Account Holder Name"]').type('John Doe')
    cy.get('textarea[placeholder="Additional notes"]').type('Monthly withdrawal request')

    // Submit form
    cy.get('button').contains('Submit Request').click()

    cy.wait('@withdrawalRequest')
    cy.get('.sonner-toast').should('contain', 'Withdrawal request submitted')
  })

  it('should validate withdrawal amount', () => {
    cy.get('[data-cy=request-withdrawal-btn]').click()
    
    // Try to withdraw more than available balance
    cy.get('[data-cy=withdrawal-amount-input]').type('2000')
    cy.get('input[placeholder="Bank Name"]').type('Test Bank')
    cy.get('input[placeholder="Account Number"]').type('1234567890')
    cy.get('input[placeholder="Account Holder Name"]').type('John Doe')
    
    cy.get('button').contains('Submit Request').click()
    
    // Should show validation error
    cy.get('.sonner-toast').should('contain', 'exceeds available balance')
  })

  it('should handle empty withdrawal history', () => {
    cy.intercept('GET', '/api/wallet/withdrawals**', {
      statusCode: 200,
      body: {
        withdrawals: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      }
    })

    cy.visit('/dashboard/wallet')
    
    cy.get('[data-cy=no-withdrawals]').should('be.visible')
    cy.get('[data-cy=no-withdrawals]').should('contain', 'No withdrawal requests yet')
  })

  it('should handle pagination when multiple withdrawals exist', () => {
    // Mock data with pagination
    cy.intercept('GET', '/api/wallet/withdrawals**', {
      statusCode: 200,
      body: {
        withdrawals: Array.from({ length: 10 }, (_, i) => ({
          withdrawalId: `wd-${i + 1}`,
          tutorId: 'tutor-123',
          tutorName: 'John Doe',
          amount: 100 + i * 50,
          status: i % 2 === 0 ? 'PENDING' : 'APPROVED',
          method: 'bank_transfer',
          accountName: 'John Doe',
          bankName: 'Test Bank',
          accountNumber: '1234567890',
          notes: `Withdrawal ${i + 1}`,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          processedAt: null
        })),
        totalCount: 25,
        currentPage: 1,
        totalPages: 3
      }
    })

    cy.visit('/dashboard/wallet')
    
    cy.get('[data-cy=pagination]').should('be.visible')
    cy.get('[data-cy=next-page-btn]').should('be.visible')
    cy.get('[data-cy=page-1-btn]').should('have.class', 'bg-[#FBBF24]')
  })

  it('should restrict access for non-tutors', () => {
    cy.intercept('GET', '/api/getuser', {
      statusCode: 200,
      body: {
        user: {
          id: 'student-456',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'STUDENT'
        }
      }
    })

    cy.visit('/dashboard/wallet')
    
    // Should show access restricted message
    cy.contains('Access Restricted').should('be.visible')
    cy.contains('only available to tutors').should('be.visible')
  })

  it('should handle loading states', () => {
    // Mock delayed wallet response
    cy.intercept('GET', '/api/wallet/mywallet', (req) => {
      req.reply((res) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(res.send({ 
            statusCode: 200, 
            body: { availableBalance: 1250.75 } 
          })), 1000)
        })
      })
    })

    cy.visit('/dashboard/wallet')
    
    // Should show loading spinner initially
    cy.get('[data-cy=loading-spinner]').should('be.visible')
  })

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '/api/wallet/mywallet', {
      statusCode: 500,
      body: { message: 'Server error' }
    })

    cy.visit('/dashboard/wallet')
    
    // Should show error message
    cy.contains('Failed to load wallet').should('be.visible')
  })
})