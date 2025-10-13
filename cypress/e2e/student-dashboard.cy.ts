describe('Student Dashboard', () => {
  beforeEach(() => {
    // Mock user authentication as student
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

    // Mock enrolled courses
    cy.intercept('GET', '/api/courses/enrolled', {
      statusCode: 200,
      body: [
        {
          id: 'course-1',
          title: 'Advanced Mathematics',
          description: 'Comprehensive mathematics course',
          price: 5000,
          tutor: {
            name: 'John Doe',
            email: 'john@example.com'
          },
          enrollmentDate: '2024-01-15T10:30:00Z',
          progress: 75
        },
        {
          id: 'course-2',
          title: 'Physics Fundamentals',
          description: 'Basic physics concepts',
          price: 4000,
          tutor: {
            name: 'Dr. Smith',
            email: 'smith@example.com'
          },
          enrollmentDate: '2024-02-01T09:00:00Z',
          progress: 45
        }
      ]
    })

    // Mock upcoming sessions
    cy.intercept('GET', '/api/sessions/upcoming', {
      statusCode: 200,
      body: [
        {
          id: 'session-1',
          courseId: 'course-1',
          courseTitle: 'Advanced Mathematics',
          tutorName: 'John Doe',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration: 60,
          meetingLink: 'https://meet.google.com/abc-def-ghi'
        }
      ]
    })
  })

  it('should display student dashboard with enrolled courses', () => {
    cy.visit('/dashboard')
    
    cy.get('[data-cy=student-dashboard]').should('be.visible')
    cy.get('[data-cy=welcome-message]').should('contain', 'Welcome back, Jane!')
    
    // Check enrolled courses section
    cy.get('[data-cy=enrolled-courses]').should('be.visible')
    cy.get('[data-cy=course-item]').should('have.length', 2)
    
    cy.get('[data-cy=course-item]').first().within(() => {
      cy.get('[data-cy=course-title]').should('contain', 'Advanced Mathematics')
      cy.get('[data-cy=tutor-name]').should('contain', 'John Doe')
      cy.get('[data-cy=progress-bar]').should('be.visible')
      cy.get('[data-cy=progress-text]').should('contain', '75%')
    })
  })

  it('should display upcoming sessions', () => {
    cy.visit('/dashboard')
    
    cy.get('[data-cy=upcoming-sessions]').should('be.visible')
    cy.get('[data-cy=session-item]').should('have.length', 1)
    
    cy.get('[data-cy=session-item]').first().within(() => {
      cy.get('[data-cy=session-course]').should('contain', 'Advanced Mathematics')
      cy.get('[data-cy=session-tutor]').should('contain', 'John Doe')
      cy.get('[data-cy=session-time]').should('be.visible')
      cy.get('[data-cy=join-meeting-btn]').should('be.visible')
    })
  })

  it('should navigate to course details when course is clicked', () => {
    cy.visit('/dashboard')
    
    cy.get('[data-cy=course-item]').first().click()
    cy.url().should('include', '/dashboard/courses/course-1')
  })

  it('should allow joining upcoming sessions', () => {
    cy.visit('/dashboard')
    
    cy.get('[data-cy=join-meeting-btn]').first().should('have.attr', 'href').and('include', 'meet.google.com')
    cy.get('[data-cy=join-meeting-btn]').first().should('have.attr', 'target', '_blank')
  })

  it('should handle empty states', () => {
    // Mock empty responses
    cy.intercept('GET', '/api/courses/enrolled', {
      statusCode: 200,
      body: []
    })
    
    cy.intercept('GET', '/api/sessions/upcoming', {
      statusCode: 200,
      body: []
    })

    cy.visit('/dashboard')
    
    cy.get('[data-cy=no-courses]').should('be.visible')
    cy.get('[data-cy=no-courses]').should('contain', 'No enrolled courses yet')
    
    cy.get('[data-cy=no-sessions]').should('be.visible')
    cy.get('[data-cy=no-sessions]').should('contain', 'No upcoming sessions')
    
    cy.get('[data-cy=browse-courses-btn]').should('be.visible')
    cy.get('[data-cy=browse-courses-btn]').click()
    cy.url().should('include', '/courses')
  })

  it('should display learning statistics', () => {
    // Mock learning stats
    cy.intercept('GET', '/api/students/stats', {
      statusCode: 200,
      body: {
        totalCoursesEnrolled: 5,
        completedCourses: 2,
        totalStudyHours: 45,
        averageProgress: 68
      }
    })

    cy.visit('/dashboard')
    
    cy.get('[data-cy=learning-stats]').should('be.visible')
    cy.get('[data-cy=total-courses]').should('contain', '5')
    cy.get('[data-cy=completed-courses]').should('contain', '2')
    cy.get('[data-cy=study-hours]').should('contain', '45')
    cy.get('[data-cy=average-progress]').should('contain', '68%')
  })
})