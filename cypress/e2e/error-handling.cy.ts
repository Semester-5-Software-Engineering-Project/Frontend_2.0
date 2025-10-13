describe('Error Handling and Edge Cases', () => {
  describe('API Error Handling', () => {
    beforeEach(() => {
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
    })

    it('should handle 500 server errors gracefully', () => {
      cy.intercept('GET', '/api/wallet/mywallet', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      })

      cy.visit('/dashboard/wallet')
      cy.get('[data-cy=error-message]').should('be.visible')
      cy.get('[data-cy=error-message]').should('contain', 'Failed to load wallet')
    })

    it('should handle network errors', () => {
      cy.intercept('GET', '/api/wallet/mywallet', { forceNetworkError: true })

      cy.visit('/dashboard/wallet')
      cy.get('[data-cy=error-message]').should('be.visible')
    })

    it('should handle 401 unauthorized errors', () => {
      cy.intercept('GET', '/api/getuser', {
        statusCode: 401,
        body: { message: 'Unauthorized' }
      })

      cy.visit('/dashboard')
      cy.url().should('include', '/auth')
    })

    it('should handle empty API responses', () => {
      cy.intercept('GET', '/api/wallet/withdrawals**', {
        statusCode: 200,
        body: []
      })

      cy.visit('/dashboard/wallet')
      cy.get('[data-cy=no-withdrawals]').should('be.visible')
      cy.get('[data-cy=no-withdrawals]').should('contain', 'No withdrawal requests yet')
    })
  })

  describe('Form Validation Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/auth')
    })

    it('should handle special characters in email', () => {
      cy.get('input[type=email]').type('test+special@example.com')
      cy.get('input[type=password]').type('password123')
      cy.get('button[type=submit]').click()
      
      // Should accept valid email with special characters
      cy.get('[data-cy=error-message]').should('not.contain', 'email')
    })

    it('should handle very long input values', () => {
      const longString = 'a'.repeat(1000)
      cy.get('input[type=email]').type(`${longString}@example.com`)
      cy.get('input[type=password]').type(longString)
      cy.get('button[type=submit]').click()
      
      // Should handle long inputs gracefully
      cy.get('[data-cy=error-message]').should('be.visible')
    })

    it('should handle SQL injection attempts', () => {
      cy.get('input[type=email]').type(`'; DROP TABLE users; --@example.com`)
      cy.get('input[type=password]').type(`'; DROP TABLE users; --`)
      cy.get('button[type=submit]').click()
      
      // Should treat as invalid input
      cy.get('[data-cy=error-message]').should('be.visible')
    })
  })

  describe('Loading States', () => {
    it('should show loading spinners during API calls', () => {
      cy.intercept('GET', '/api/wallet/mywallet', (req) => {
        // Delay response to test loading state
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res.send({ statusCode: 200, body: { availableBalance: 100 } })), 2000)
          })
        })
      })

      cy.visit('/dashboard/wallet')
      cy.get('[data-cy=loading-spinner]').should('be.visible')
      cy.get('[data-cy=loading-spinner]').should('not.exist', { timeout: 3000 })
    })

    it('should prevent double submission during form processing', () => {
      cy.intercept('POST', '/api/auth/login', (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res.send({ statusCode: 200, body: { success: true } })), 1000)
          })
        })
      })

      cy.visit('/auth')
      cy.get('input[type=email]').type('test@example.com')
      cy.get('input[type=password]').type('password123')
      
      cy.get('button[type=submit]').click()
      cy.get('button[type=submit]').should('be.disabled')
      cy.get('button[type=submit]').click() // Try to click again
      
      // Should only make one request
      cy.get('[data-cy=loading-indicator]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/dashboard')
    })

    it('should support keyboard navigation', () => {
      cy.get('[data-cy=nav-courses]').focus()
      cy.focused().should('have.attr', 'data-cy', 'nav-courses')
      
      cy.focused().type('{enter}')
      cy.url().should('include', '/dashboard/courses')
    })

    it('should have proper ARIA labels', () => {
      cy.get('[data-cy=sidebar]').should('have.attr', 'role', 'navigation')
      cy.get('[data-cy=user-menu]').should('have.attr', 'aria-label')
    })

    it('should support screen readers', () => {
      cy.get('[data-cy=available-balance]').should('have.attr', 'aria-label')
      cy.get('[data-cy=withdrawal-status]').should('have.attr', 'aria-label')
    })
  })

  describe('Performance', () => {
    it('should load dashboard within acceptable time', () => {
      const start = Date.now()
      cy.visit('/dashboard')
      cy.get('[data-cy=tutor-dashboard]').should('be.visible').then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(3000) // Should load within 3 seconds
      })
    })

    it('should handle large datasets efficiently', () => {
      // Mock large withdrawal history
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        withdrawalId: `${i + 1}`,
        tutorId: 'tutor-123',
        amount: Math.random() * 1000,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        bankName: 'Test Bank',
        accountNumber: '1234567890'
      }))

      cy.intercept('GET', '/api/wallet/withdrawals**', {
        statusCode: 200,
        body: largeDataset
      })

      cy.visit('/dashboard/wallet')
      cy.get('[data-cy=withdrawal-item]').should('have.length.at.most', 10) // Should paginate
      cy.get('[data-cy=pagination]').should('be.visible')
    })
  })
})