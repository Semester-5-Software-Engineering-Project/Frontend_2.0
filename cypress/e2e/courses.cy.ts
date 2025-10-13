describe('Course Management Tests', () => {
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

    // Mock course data
    cy.intercept('GET', '/api/courses/tutor/tutor-123', {
      statusCode: 200,
      body: [
        {
          id: 'course-1',
          title: 'Advanced Mathematics',
          description: 'Complete mathematics course',
          tutorId: 'tutor-123',
          domain: 'Mathematics',
          fee: 50,
          duration: 60,
          status: 'ACTIVE',
          createdAt: '2025-01-01'
        }
      ]
    })

    cy.visit('/dashboard/courses')
  })

  describe('Courses List', () => {
    it('should display courses page', () => {
      cy.get('[data-cy=courses-header]').should('contain', 'My Courses')
      cy.get('[data-cy=courses-list]').should('be.visible')
    })

    it('should display course cards', () => {
      cy.get('[data-cy=course-card]').should('have.length.at.least', 1)
      
      cy.get('[data-cy=course-card]').first().within(() => {
        cy.get('[data-cy=course-title]').should('contain', 'Advanced Mathematics')
        cy.get('[data-cy=course-domain]').should('contain', 'Mathematics')
        cy.get('[data-cy=course-fee]').should('contain', '$50')
      })
    })

    it('should navigate to course details', () => {
      cy.get('[data-cy=course-card]').first().click()
      cy.url().should('include', '/dashboard/courses/course-1')
    })
  })

  describe('Course Details Page', () => {
    beforeEach(() => {
      // Mock course details
      cy.intercept('GET', '/api/courses/course-1', {
        statusCode: 200,
        body: {
          id: 'course-1',
          title: 'Advanced Mathematics',
          description: 'Complete mathematics course',
          tutorId: 'tutor-123',
          domain: 'Mathematics',
          fee: 50,
          duration: 60,
          status: 'ACTIVE'
        }
      })

      // Mock modules
      cy.intercept('GET', '/api/modules/course/course-1', {
        statusCode: 200,
        body: [
          {
            id: 'module-1',
            courseId: 'course-1',
            title: 'Calculus Basics',
            description: 'Introduction to calculus',
            order: 1
          }
        ]
      })

      // Mock enrollment check
      cy.intercept('GET', '/api/enrollments/check**', {
        statusCode: 200,
        body: { is_paid: true }
      })

      cy.visit('/dashboard/courses/course-1')
    })

    it('should display course information', () => {
      cy.get('[data-cy=course-title]').should('contain', 'Advanced Mathematics')
      cy.get('[data-cy=course-description]').should('contain', 'Complete mathematics course')
      cy.get('[data-cy=course-fee]').should('contain', '$50')
    })

    it('should display modules list', () => {
      cy.get('[data-cy=modules-section]').should('be.visible')
      cy.get('[data-cy=module-item]').should('have.length.at.least', 1)
      
      cy.get('[data-cy=module-item]').first().within(() => {
        cy.get('[data-cy=module-title]').should('contain', 'Calculus Basics')
        cy.get('[data-cy=module-description]').should('contain', 'Introduction to calculus')
      })
    })

    it('should show upload materials dialog for tutors', () => {
      cy.get('[data-cy=upload-materials-btn]').click()
      cy.get('[data-cy=upload-dialog]').should('be.visible')
      cy.get('[data-cy=upload-dialog-title]').should('contain', 'Upload Materials')
    })
  })

  describe('Payment Integration', () => {
    beforeEach(() => {
      // Mock unpaid enrollment
      cy.intercept('GET', '/api/enrollments/check**', {
        statusCode: 200,
        body: { is_paid: false }
      })

      cy.visit('/dashboard/courses/course-1')
    })

    it('should show payment dialog for unpaid content', () => {
      cy.get('[data-cy=payment-required]').should('be.visible')
      cy.get('[data-cy=payment-dialog-btn]').click()
      cy.get('[data-cy=payment-dialog]').should('be.visible')
    })

    it('should display payment form fields', () => {
      cy.get('[data-cy=payment-dialog-btn]').click()
      
      cy.get('[data-cy=billing-name]').should('be.visible')
      cy.get('[data-cy=billing-email]').should('be.visible')
      cy.get('[data-cy=billing-phone]').should('be.visible')
      cy.get('[data-cy=billing-address]').should('be.visible')
      cy.get('[data-cy=payment-submit]').should('be.visible')
    })

    it('should validate payment form', () => {
      cy.get('[data-cy=payment-dialog-btn]').click()
      cy.get('[data-cy=payment-submit]').click()
      
      // Should show validation errors
      cy.get('[data-cy=error-message]').should('be.visible')
    })
  })

  describe('Materials Upload', () => {
    beforeEach(() => {
      cy.get('[data-cy=upload-materials-btn]').click()
    })

    it('should display upload form', () => {
      cy.get('[data-cy=upload-title]').should('be.visible')
      cy.get('[data-cy=upload-description]').should('be.visible')
      cy.get('[data-cy=upload-file]').should('be.visible')
      cy.get('[data-cy=upload-submit]').should('be.visible')
    })

    it('should validate upload form', () => {
      cy.get('[data-cy=upload-submit]').click()
      cy.get('[data-cy=error-message]').should('contain', 'required')
    })

    it('should upload materials successfully', () => {
      cy.intercept('POST', '/api/materials/upload', {
        statusCode: 200,
        body: { message: 'Material uploaded successfully' }
      }).as('uploadRequest')

      cy.get('[data-cy=upload-title]').type('Sample Material')
      cy.get('[data-cy=upload-description]').type('This is a test material')
      
      // Mock file upload
      const fileName = 'test-document.pdf'
      cy.get('[data-cy=upload-file]').selectFile({
        contents: Cypress.Buffer.from('test content'),
        fileName,
        mimeType: 'application/pdf'
      })

      cy.get('[data-cy=upload-submit]').click()
      cy.wait('@uploadRequest')
      
      cy.get('[data-cy=success-message]').should('be.visible')
      cy.get('[data-cy=upload-dialog]').should('not.exist')
    })
  })
})