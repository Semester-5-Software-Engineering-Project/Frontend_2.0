describe('Navigation and Layout Tests', () => {
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

    cy.visit('/dashboard')
  })

  describe('Sidebar Navigation', () => {
    it('should display sidebar with navigation items', () => {
      cy.get('[data-cy=sidebar]').should('be.visible')
      cy.get('[data-cy=nav-dashboard]').should('be.visible')
      cy.get('[data-cy=nav-courses]').should('be.visible')
      cy.get('[data-cy=nav-sessions]').should('be.visible')
      cy.get('[data-cy=nav-payments]').should('be.visible')
      cy.get('[data-cy=nav-reviews]').should('be.visible')
      cy.get('[data-cy=nav-schedule]').should('be.visible')
      cy.get('[data-cy=nav-upload]').should('be.visible')
      cy.get('[data-cy=nav-wallet]').should('be.visible')
      cy.get('[data-cy=nav-profile]').should('be.visible')
    })

    it('should highlight active navigation item', () => {
      cy.get('[data-cy=nav-dashboard]').should('have.class', 'bg-primary')
      
      cy.get('[data-cy=nav-courses]').click()
      cy.get('[data-cy=nav-courses]').should('have.class', 'bg-primary')
      cy.get('[data-cy=nav-dashboard]').should('not.have.class', 'bg-primary')
    })

    it('should navigate to different pages', () => {
      cy.get('[data-cy=nav-courses]').click()
      cy.url().should('include', '/dashboard/courses')
      
      cy.get('[data-cy=nav-wallet]').click()
      cy.url().should('include', '/dashboard/wallet')
      
      cy.get('[data-cy=nav-profile]').click()
      cy.url().should('include', '/dashboard/profile')
    })
  })

  describe('Header', () => {
    it('should display user information', () => {
      cy.get('[data-cy=user-avatar]').should('be.visible')
      cy.get('[data-cy=user-name]').should('contain', 'John Doe')
      cy.get('[data-cy=user-role]').should('contain', 'TUTOR')
    })

    it('should display logout option', () => {
      cy.get('[data-cy=user-menu]').click()
      cy.get('[data-cy=logout-btn]').should('be.visible')
    })

    it('should logout successfully', () => {
      cy.intercept('POST', '/api/auth/logout', {
        statusCode: 200
      }).as('logoutRequest')

      cy.get('[data-cy=user-menu]').click()
      cy.get('[data-cy=logout-btn]').click()
      
      cy.wait('@logoutRequest')
      cy.url().should('include', '/auth')
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-6')
      cy.get('[data-cy=mobile-menu-btn]').should('be.visible')
      cy.get('[data-cy=sidebar]').should('not.be.visible')
      
      cy.get('[data-cy=mobile-menu-btn]').click()
      cy.get('[data-cy=mobile-sidebar]').should('be.visible')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.get('[data-cy=sidebar]').should('be.visible')
      cy.get('[data-cy=mobile-menu-btn]').should('not.be.visible')
    })
  })
})