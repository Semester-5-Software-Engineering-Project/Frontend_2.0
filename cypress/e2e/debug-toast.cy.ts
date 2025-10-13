describe('Toast Debug Test', () => {
  it('should find toast elements in the page', () => {
    cy.visit('/auth')
    
    // Try to submit form and debug what appears
    cy.get('[data-cy=login-submit]').click()
    cy.wait(2000)
    
    // Take a screenshot to see what's happening
    cy.screenshot('toast-debug')
    
    // Log the entire body HTML to see what's there
    cy.get('body').then(($body) => {
      console.log('Body HTML:', $body.html())
    })
    
    // Try all possible selectors
    const selectors = [
      '[data-sonner-toast]',
      '[data-sonner-toaster]',
      '.sonner-toast',
      '.Toaster',
      '[role="alert"]',
      '[role="status"]',
      '[data-testid*="toast"]',
      '[class*="toast"]',
      '[class*="notification"]'
    ]
    
    selectors.forEach((selector) => {
      cy.get('body').then(($body) => {
        const elements = $body.find(selector)
        if (elements.length > 0) {
          cy.log(`Found elements with selector ${selector}:`, elements.length)
          elements.each((i, el) => {
            cy.log(`Element ${i}:`, el.outerHTML)
          })
        }
      })
    })
  })
})