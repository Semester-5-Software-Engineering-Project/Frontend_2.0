describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.visit('/auth')
  })

  describe('Login Functionality', () => {
    it('should display login form', () => {
      cy.get('[data-cy=login-form]').should('be.visible')
      cy.get('[data-cy=login-email]').should('be.visible')
      cy.get('[data-cy=login-password]').should('be.visible')
      cy.get('[data-cy=login-submit]').should('be.visible')
    })

    it('should prevent login with empty fields', () => {
      // Store the current URL before clicking submit
      cy.url().then((currentUrl) => {
        // Click submit with empty fields
        cy.get('[data-cy=login-submit]').click()
        
        // Wait a moment for any processing
        cy.wait(2000)
        
        // Should still be on the auth page (login prevented)
        cy.url().should('eq', currentUrl)
        cy.url().should('include', '/auth')
        
        // The form should still be visible (not redirected)
        cy.get('[data-cy=login-form]').should('be.visible')
        
        // Check for toast notification with more flexible selectors
        cy.get('body').then(($body) => {
          if ($body.text().includes('Please fill in all fields') || 
              $body.text().includes('Please fill')) {
            cy.get('body').should('contain.text', 'Please fill')
          } else {
            // Try alternate selectors
            cy.get('[data-sonner-toast], [role="alert"], .sonner-toast', { timeout: 10000 })
              .should('be.visible')
              .and('contain', 'Please fill')
          }
        })
      })
    })

    it('should handle invalid login attempts', () => {
      // Mock a failed login response - use the correct endpoint
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }).as('failedLogin')
      
      cy.get('[data-cy=login-email]').type('invalid@example.com')
      cy.get('[data-cy=login-password]').type('wrongpassword')
      cy.get('[data-cy=login-submit]').click()
      
      // Wait for the API call
      cy.wait('@failedLogin')
      
      // Should still be on auth page after failed login
      cy.url().should('include', '/auth')
      
      // Check for error toast with flexible selectors
      cy.get('body').then(($body) => {
        if ($body.text().includes('Failed to login') || 
            $body.text().includes('Failed')) {
          cy.get('body').should('contain.text', 'Failed')
        } else {
          // Try alternate selectors
          cy.get('[data-sonner-toast], [role="alert"], .sonner-toast', { timeout: 10000 })
            .should('be.visible')
            .and('contain', 'Failed')
        }
      })
    })

    it('should login successfully with valid credentials', () => {
      // Mock successful login - use the correct endpoint
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            name: 'Tiran',
            email: 'tikka@gmail.com',
            role: 'TUTOR'
          }
        }
      }).as('loginRequest')

      // Mock any additional APIs that might be called after login
      cy.intercept('GET', '**/api/getuser', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            name: 'Tiran',
            email: 'tikka@gmail.com',
            role: 'TUTOR'
          }
        }
      })

      cy.get('[data-cy=login-email]').type('tikka@gmail.com')
      cy.get('[data-cy=login-password]').type('1234')
      cy.get('[data-cy=login-submit]').click()

      cy.wait('@loginRequest')
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Registration Functionality', () => {
    beforeEach(() => {
      // Click on the register tab to activate the registration form
      cy.get('[data-cy=register-tab]').click()
      // Wait for the tab switch to complete
      cy.wait(1000)
    })

    it('should display registration form', () => {
      cy.get('[data-cy=register-form]').should('be.visible')
      cy.get('[data-cy=register-name]').should('be.visible')
      cy.get('[data-cy=register-email]').should('be.visible')
      cy.get('[data-cy=register-password]').should('be.visible')
      cy.get('[data-cy=role-student]').should('be.visible')
      cy.get('[data-cy=role-tutor]').should('be.visible')
      cy.get('[data-cy=register-submit]').should('be.visible')
    })

    it('should allow role selection', () => {
      cy.get('[data-cy=role-student]').should('have.class', 'bg-primary')
      cy.get('[data-cy=role-tutor]').click()
      cy.get('[data-cy=role-tutor]').should('have.class', 'bg-primary')
    })

    it('should handle registration form submission', () => {
      // Mock successful registration - use the CORRECT endpoint
      cy.intercept('POST', '**/api/register', {
        statusCode: 200,
        body: { 
          success: true,
          user: { 
            id: '456', 
            name: 'New User', 
            email: 'newuser@example.com',
            role: 'STUDENT' 
          }
        }
      }).as('registerRequest')

      // Mock getuser API that might be called after registration
      cy.intercept('GET', '**/api/getuser', {
        statusCode: 200,
        body: {
          user: { 
            id: '456', 
            name: 'New User', 
            email: 'newuser@example.com',
            role: 'STUDENT' 
          }
        }
      })

      cy.get('[data-cy=register-name]').type('New User')
      cy.get('[data-cy=register-email]').type('newuser@example.com')
      cy.get('[data-cy=register-password]').type('password123')
      cy.get('[data-cy=role-student]').click()
      cy.get('[data-cy=register-submit]').click()

      cy.wait('@registerRequest')
      cy.url().should('include', '/dashboard')
    })

    it('should prevent registration with incomplete fields', () => {
      cy.url().then((currentUrl) => {
        cy.get('[data-cy=register-submit]').click()
        
        // Wait for processing
        cy.wait(2000)
        
        // Should still be on auth page
        cy.url().should('eq', currentUrl)
        cy.url().should('include', '/auth')
        
        // Form should still be visible
        cy.get('[data-cy=register-form]').should('be.visible')
        
        // Check for validation message
        cy.get('body').then(($body) => {
          if ($body.text().includes('Please fill in all fields') || 
              $body.text().includes('Please fill')) {
            cy.get('body').should('contain.text', 'Please fill')
          } else {
            // Try alternate selectors
            cy.get('[data-sonner-toast], [role="alert"], .sonner-toast', { timeout: 10000 })
              .should('be.visible')
              .and('contain', 'Please fill')
          }
        })
      })
    })

    it('should handle registration errors', () => {
      cy.intercept('POST', '**/api/register', {
        statusCode: 400,
        body: { message: 'Email already exists' }
      }).as('registerError')

      cy.get('[data-cy=register-name]').type('Test User')
      cy.get('[data-cy=register-email]').type('existing@example.com')
      cy.get('[data-cy=register-password]').type('password123')
      cy.get('[data-cy=register-submit]').click()

      cy.wait('@registerError')
      
      // Should still be on auth page
      cy.url().should('include', '/auth')
      
      // Check for error message
      cy.get('body').then(($body) => {
        if ($body.text().includes('Failed to register') || 
            $body.text().includes('Failed')) {
          cy.get('body').should('contain.text', 'Failed')
        } else {
          // Try alternate selectors
          cy.get('[data-sonner-toast], [role="alert"], .sonner-toast', { timeout: 10000 })
            .should('be.visible')
            .and('contain', 'Failed')
        }
      })
    })

    it('should allow switching between login and register', () => {
      cy.get('[data-cy=register-form]').should('be.visible')
      cy.get('[data-cy=login-tab]').click()
      cy.get('[data-cy=login-form]').should('be.visible')
      cy.get('[data-cy=register-form]').should('not.be.visible')
    })
  })

  describe('Google Login', () => {
    it('should display Google login button', () => {
      cy.contains('Sign in with Google').should('be.visible')
    })
  })
})