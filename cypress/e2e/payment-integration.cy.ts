describe('Payment Integration', () => {
  beforeEach(() => {
    // Mock user as student
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

    // Mock course details
    cy.intercept('GET', '/api/courses/course-123', {
      statusCode: 200,
      body: {
        id: 'course-123',
        title: 'Advanced Mathematics',
        description: 'Comprehensive mathematics course for advanced learners',
        price: 5000,
        tutor: {
          id: 'tutor-123',
          name: 'John Doe',
          email: 'john@example.com',
          profilePicture: '/api/placeholder/100/100'
        },
        materials: [
          { id: 'mat-1', title: 'Chapter 1: Algebra', type: 'PDF', url: '/materials/algebra.pdf' },
          { id: 'mat-2', title: 'Chapter 2: Calculus', type: 'PDF', url: '/materials/calculus.pdf' }
        ],
        isEnrolled: false
      }
    })

    // Mock payment initialization
    cy.intercept('POST', '/api/payments/initiate', {
      statusCode: 200,
      body: {
        success: true,
        orderId: 'order-12345',
        merchantId: 'merchant-test',
        returnUrl: 'http://localhost:3000/payment/success',
        cancelUrl: 'http://localhost:3000/payment/cancel',
        notifyUrl: 'http://localhost:3000/api/payments/notify'
      }
    })

    // Mock payment verification
    cy.intercept('POST', '/api/payments/verify', {
      statusCode: 200,
      body: {
        success: true,
        status: 'SUCCESS',
        message: 'Payment completed successfully'
      }
    })
  })

  it('should display course details and enrollment button', () => {
    cy.visit('/dashboard/courses/course-123')
    
    cy.get('[data-cy=course-title]').should('contain', 'Advanced Mathematics')
    cy.get('[data-cy=course-description]').should('contain', 'Comprehensive mathematics course')
    cy.get('[data-cy=course-price]').should('contain', 'LKR 5,000')
    cy.get('[data-cy=tutor-name]').should('contain', 'John Doe')
    
    cy.get('[data-cy=enroll-button]').should('be.visible')
    cy.get('[data-cy=enroll-button]').should('contain', 'Enroll Now')
  })

  it('should open payment dialog when enroll button is clicked', () => {
    cy.visit('/dashboard/courses/course-123')
    
    cy.get('[data-cy=enroll-button]').click()
    
    cy.get('[data-cy=payment-dialog]').should('be.visible')
    cy.get('[data-cy=payment-dialog-title]').should('contain', 'Complete Payment')
    cy.get('[data-cy=payment-amount]').should('contain', 'LKR 5,000')
    cy.get('[data-cy=payment-course]').should('contain', 'Advanced Mathematics')
  })

  it('should handle PayHere payment flow', () => {
    cy.visit('/dashboard/courses/course-123')
    
    cy.get('[data-cy=enroll-button]').click()
    cy.get('[data-cy=payment-dialog]').should('be.visible')
    
    // Mock PayHere object
    cy.window().then((win: any) => {
      win.payhere = {
        startPayment: cy.stub().callsFake((payment) => {
          // Simulate successful payment
          setTimeout(() => {
            payment.onCompleted('order-12345')
          }, 100)
        })
      }
    })
    
    cy.get('[data-cy=pay-now-button]').click()
    
    // Should show success message
    cy.get('[data-cy=payment-success]').should('be.visible')
    cy.get('[data-cy=payment-success]').should('contain', 'Payment completed successfully')
  })

  it('should handle payment cancellation', () => {
    cy.visit('/dashboard/courses/course-123')
    
    cy.get('[data-cy=enroll-button]').click()
    cy.get('[data-cy=payment-dialog]').should('be.visible')
    
    // Mock PayHere with cancelled payment
    cy.window().then((win: any) => {
      win.payhere = {
        startPayment: cy.stub().callsFake((payment) => {
          setTimeout(() => {
            payment.onDismissed()
          }, 100)
        })
      }
    })
    
    cy.get('[data-cy=pay-now-button]').click()
    
    // Should show cancellation message
    cy.get('[data-cy=payment-cancelled]').should('be.visible')
    cy.get('[data-cy=payment-cancelled]').should('contain', 'Payment was cancelled')
  })

  it('should handle payment errors', () => {
    cy.visit('/dashboard/courses/course-123')
    
    cy.get('[data-cy=enroll-button]').click()
    cy.get('[data-cy=payment-dialog]').should('be.visible')
    
    // Mock PayHere with error
    cy.window().then((win: any) => {
      win.payhere = {
        startPayment: cy.stub().callsFake((payment) => {
          setTimeout(() => {
            payment.onError('Payment processing failed')
          }, 100)
        })
      }
    })
    
    cy.get('[data-cy=pay-now-button]').click()
    
    // Should show error message
    cy.get('[data-cy=payment-error]').should('be.visible')
    cy.get('[data-cy=payment-error]').should('contain', 'Payment processing failed')
  })

  it('should show enrolled state after successful payment', () => {
    // Mock enrolled course
    cy.intercept('GET', '/api/courses/course-123', {
      statusCode: 200,
      body: {
        id: 'course-123',
        title: 'Advanced Mathematics',
        description: 'Comprehensive mathematics course for advanced learners',
        price: 5000,
        tutor: {
          id: 'tutor-123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        materials: [
          { id: 'mat-1', title: 'Chapter 1: Algebra', type: 'PDF', url: '/materials/algebra.pdf' }
        ],
        isEnrolled: true
      }
    })

    cy.visit('/dashboard/courses/course-123')
    
    cy.get('[data-cy=enrolled-badge]').should('be.visible')
    cy.get('[data-cy=enrolled-badge]').should('contain', 'Enrolled')
    cy.get('[data-cy=enroll-button]').should('not.exist')
    
    // Should show course materials
    cy.get('[data-cy=course-materials]').should('be.visible')
    cy.get('[data-cy=material-item]').should('have.length', 1)
    cy.get('[data-cy=material-item]').first().should('contain', 'Chapter 1: Algebra')
  })

  it('should handle payment verification errors', () => {
    // Mock verification failure
    cy.intercept('POST', '/api/payments/verify', {
      statusCode: 400,
      body: {
        success: false,
        message: 'Payment verification failed'
      }
    })

    cy.visit('/dashboard/courses/course-123')
    
    cy.get('[data-cy=enroll-button]').click()
    
    // Mock successful PayHere response but failed verification
    cy.window().then((win: any) => {
      win.payhere = {
        startPayment: cy.stub().callsFake((payment) => {
          setTimeout(() => {
            payment.onCompleted('order-12345')
          }, 100)
        })
      }
    })
    
    cy.get('[data-cy=pay-now-button]').click()
    
    // Should show verification error
    cy.get('[data-cy=payment-error]').should('be.visible')
    cy.get('[data-cy=payment-error]').should('contain', 'Payment verification failed')
  })

  it('should close payment dialog when cancel is clicked', () => {
    cy.visit('/dashboard/courses/course-123')
    
    cy.get('[data-cy=enroll-button]').click()
    cy.get('[data-cy=payment-dialog]').should('be.visible')
    
    cy.get('[data-cy=cancel-payment-button]').click()
    cy.get('[data-cy=payment-dialog]').should('not.exist')
  })
})