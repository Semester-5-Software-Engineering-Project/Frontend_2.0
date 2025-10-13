describe('Wallet Tests', () => {
  beforeEach(() => {
    // Mock authentication
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

    // Mock withdrawals history
    cy.intercept('GET', '/api/wallet/withdrawals**', {
      statusCode: 200,
      body: [
        {
          withdrawalId: '1',
          tutorId: 'tutor-123',
          tutorName: 'John Doe',
          amount: 200.0,
          status: 'PENDING',
          method: 'BANK_TRANSFER',
          accountName: 'John Doe',
          bankName: 'Commercial Bank',
          accountNumber: '1234567890',
          notes: 'Monthly withdrawal',
          createdAt: '2025-10-08T15:33:08.082415',
          processedAt: null
        },
        {
          withdrawalId: '2',
          tutorId: 'tutor-123',
          tutorName: 'John Doe',
          amount: 150.0,
          status: 'APPROVED',
          method: 'BANK_TRANSFER',
          accountName: 'John Doe',
          bankName: 'Commercial Bank',
          accountNumber: '1234567890',
          notes: 'Previous withdrawal',
          createdAt: '2025-10-01T10:20:00.000000',
          processedAt: '2025-10-02T14:30:00.000000'
        }
      ]
    })

    cy.visit('/dashboard/wallet')
  })

  describe('Wallet Balance Display', () => {
    it('should display available balance', () => {
      cy.get('[data-cy=available-balance]').should('be.visible')
      cy.get('[data-cy=balance-amount]').should('contain', '$1,250.75')
    })

    it('should show loading state initially', () => {
      cy.get('[data-cy=loading-spinner]').should('be.visible')
      cy.get('[data-cy=available-balance]').should('be.visible')
    })

    it('should display withdrawal button', () => {
      cy.get('[data-cy=request-withdrawal-btn]').should('be.visible')
      cy.get('[data-cy=request-withdrawal-btn]').should('contain', 'Request Withdrawal')
    })
  })

  describe('Withdrawal History', () => {
    it('should display withdrawal history section', () => {
      cy.get('[data-cy=withdrawal-history]').should('be.visible')
      cy.get('[data-cy=withdrawal-history-title]').should('contain', 'Withdrawal History')
    })

    it('should display withdrawal items', () => {
      cy.get('[data-cy=withdrawal-item]').should('have.length', 2)
      
      // Check first withdrawal
      cy.get('[data-cy=withdrawal-item]').first().within(() => {
        cy.get('[data-cy=withdrawal-number]').should('contain', 'Withdrawal #1')
        cy.get('[data-cy=withdrawal-amount]').should('contain', '$200.00')
        cy.get('[data-cy=withdrawal-status]').should('contain', 'Pending')
        cy.get('[data-cy=withdrawal-date]').should('be.visible')
        cy.get('[data-cy=withdrawal-bank]').should('contain', 'Commercial Bank')
      })
    })

    it('should display correct status badges', () => {
      cy.get('[data-cy=withdrawal-item]').first().within(() => {
        cy.get('[data-cy=status-badge]').should('have.class', 'bg-yellow-100')
      })
      
      cy.get('[data-cy=withdrawal-item]').eq(1).within(() => {
        cy.get('[data-cy=status-badge]').should('have.class', 'bg-green-100')
      })
    })
  })

  describe('Withdrawal Request Dialog', () => {
    beforeEach(() => {
      cy.get('[data-cy=request-withdrawal-btn]').click()
    })

    it('should open withdrawal dialog', () => {
      cy.get('[data-cy=withdrawal-dialog]').should('be.visible')
      cy.get('[data-cy=dialog-title]').should('contain', 'Request Withdrawal')
    })

    it('should display form fields', () => {
      cy.get('[data-cy=withdrawal-amount]').should('be.visible')
      cy.get('[data-cy=account-holder-name]').should('be.visible')
      cy.get('[data-cy=bank-name]').should('be.visible')
      cy.get('[data-cy=account-number]').should('be.visible')
      cy.get('[data-cy=notes]').should('be.visible')
    })

    it('should display available balance in dialog', () => {
      cy.get('[data-cy=dialog-balance]').should('contain', '$1,250.75')
    })

    it('should show validation errors for empty required fields', () => {
      cy.get('[data-cy=submit-withdrawal]').click()
      cy.get('[data-cy=toast-error]').should('be.visible')
      cy.get('[data-cy=toast-error]').should('contain', 'required fields')
    })

    it('should validate amount exceeds balance', () => {
      cy.get('[data-cy=withdrawal-amount]').type('2000')
      cy.get('[data-cy=account-holder-name]').type('John Doe')
      cy.get('[data-cy=bank-name]').type('Commercial Bank')
      cy.get('[data-cy=account-number]').type('1234567890')
      cy.get('[data-cy=submit-withdrawal]').click()
      
      cy.get('[data-cy=toast-error]').should('contain', 'Insufficient balance')
    })

    it('should submit withdrawal request successfully', () => {
      cy.intercept('POST', '/api/wallet/withdraw', {
        statusCode: 200,
        body: 'Withdrawal request submitted successfully'
      }).as('withdrawalRequest')

      cy.get('[data-cy=withdrawal-amount]').type('100')
      cy.get('[data-cy=account-holder-name]').type('John Doe')
      cy.get('[data-cy=bank-name]').type('Commercial Bank')
      cy.get('[data-cy=account-number]').type('1234567890')
      cy.get('[data-cy=notes]').type('Test withdrawal')
      cy.get('[data-cy=submit-withdrawal]').click()

      cy.wait('@withdrawalRequest')
      cy.get('[data-cy=toast-success]').should('be.visible')
      cy.get('[data-cy=withdrawal-dialog]').should('not.exist')
    })

    it('should test quick amount buttons', () => {
      cy.get('[data-cy=quick-25]').click()
      cy.get('[data-cy=withdrawal-amount]').should('have.value', '312.69') // 25% of 1250.75

      cy.get('[data-cy=quick-50]').click()
      cy.get('[data-cy=withdrawal-amount]').should('have.value', '625.38') // 50% of 1250.75

      cy.get('[data-cy=quick-75]').click()
      cy.get('[data-cy=withdrawal-amount]').should('have.value', '938.06') // 75% of 1250.75

      cy.get('[data-cy=quick-max]').click()
      cy.get('[data-cy=withdrawal-amount]').should('have.value', '1250.75') // 100% of balance
    })

    it('should close dialog on cancel', () => {
      cy.get('[data-cy=cancel-withdrawal]').click()
      cy.get('[data-cy=withdrawal-dialog]').should('not.exist')
    })
  })

  describe('Access Control', () => {
    it('should restrict access for non-tutors', () => {
      cy.intercept('GET', '/api/getuser', {
        statusCode: 200,
        body: {
          user: {
            id: 'student-123',
            name: 'Jane Student',
            email: 'jane@example.com',
            role: 'STUDENT'
          }
        }
      })

      cy.visit('/dashboard/wallet')
      cy.get('[data-cy=access-restricted]').should('be.visible')
      cy.get('[data-cy=access-restricted]').should('contain', 'only available to tutors')
    })
  })
})