describe('Tutor Dashboard Tests', () => {
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

    // Mock modules data
    cy.intercept('GET', '/api/modules/tutor', {
      statusCode: 200,
      body: [
        {
          moduleId: '1',
          tutorId: 'tutor-123',
          name: 'Advanced Mathematics',
          domain: 'Mathematics',
          averageRatings: 4.8,
          fee: 50,
          duration: 60,
          status: 'ACTIVE'
        },
        {
          moduleId: '2',
          tutorId: 'tutor-123',
          name: 'Computer Science Basics',
          domain: 'Computer Science',
          averageRatings: 4.6,
          fee: 40,
          duration: 45,
          status: 'ACTIVE'
        }
      ]
    })

    // Mock total revenue
    cy.intercept('GET', '/api/payments/totalEarningsForTutor', {
      statusCode: 200,
      body: 1250.75
    })

    // Mock upcoming sessions
    cy.intercept('POST', '/api/sessions/upcoming', {
      statusCode: 200,
      body: [
        {
          sessionId: '1',
          studentName: 'Alice Smith',
          moduleName: 'Advanced Mathematics',
          date: '2025-10-13',
          time: '10:00',
          duration: 60
        }
      ]
    })

    cy.visit('/dashboard')
  })

  describe('Dashboard Overview', () => {
    it('should display tutor dashboard header', () => {
      cy.get('h1').should('contain', 'Tutor Dashboard')
      cy.get('[data-cy=welcome-section]').should('be.visible')
    })

    it('should display correct statistics cards', () => {
      cy.get('[data-cy=stats-overview]').should('be.visible')
      
      // Active Modules count
      cy.get('[data-cy=active-modules]').should('contain', '2')
      
      // Total Revenue
      cy.get('[data-cy=total-revenue]').should('contain', '$1,250.75')
      
      // Average Rating
      cy.get('[data-cy=average-rating]').should('contain', '4.7')
    })

    it('should display modules list', () => {
      cy.get('[data-cy=modules-section]').should('be.visible')
      cy.get('[data-cy=module-card]').should('have.length', 2)
      
      // Check first module
      cy.get('[data-cy=module-card]').first().within(() => {
        cy.get('[data-cy=module-name]').should('contain', 'Advanced Mathematics')
        cy.get('[data-cy=module-domain]').should('contain', 'Mathematics')
        cy.get('[data-cy=module-fee]').should('contain', '$50')
        cy.get('[data-cy=module-rating]').should('contain', '4.8')
      })
    })

    it('should display upcoming sessions', () => {
      cy.get('[data-cy=upcoming-sessions]').should('be.visible')
      cy.get('[data-cy=session-item]').should('have.length.at.least', 1)
      
      cy.get('[data-cy=session-item]').first().within(() => {
        cy.get('[data-cy=student-name]').should('contain', 'Alice Smith')
        cy.get('[data-cy=module-name]').should('contain', 'Advanced Mathematics')
        cy.get('[data-cy=session-date]').should('contain', '2025-10-13')
        cy.get('[data-cy=session-time]').should('contain', '10:00')
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to courses page', () => {
      cy.get('[data-cy=nav-courses]').click()
      cy.url().should('include', '/dashboard/courses')
    })

    it('should navigate to wallet page', () => {
      cy.get('[data-cy=nav-wallet]').click()
      cy.url().should('include', '/dashboard/wallet')
    })

    it('should navigate to profile page', () => {
      cy.get('[data-cy=nav-profile]').click()
      cy.url().should('include', '/dashboard/profile')
    })

    it('should navigate to upload materials page', () => {
      cy.get('[data-cy=nav-upload]').click()
      cy.url().should('include', '/dashboard/upload')
    })
  })

  describe('Module Management', () => {
    it('should show module details when clicking on a module', () => {
      cy.get('[data-cy=module-card]').first().click()
      cy.url().should('include', '/dashboard/courses/')
    })

    it('should display create new module button', () => {
      cy.get('[data-cy=create-module-btn]').should('be.visible')
      cy.get('[data-cy=create-module-btn]').should('contain', 'Create New Module')
    })
  })
})