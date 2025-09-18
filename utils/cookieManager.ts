// Cookie management utilities for authentication

export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean;
}

export class CookieManager {
  /**
   * Get cookie value by name
   */
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

  /**
   * Get JWT token from cookies (checks multiple possible names)
   */
  static getJWTToken(): string | null {
    // Check for backend cookie name 'jwtToken' first
    let token = this.getCookie('jwtToken');
    if (token) return token;
    
    // Fallback to alternative name 'jwt_token'
    token = this.getCookie('jwt_token');
    if (token) return token;
    
    return null;
  }

  /**
   * Set cookie with proper options
   */
  static setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (options.path) cookieString += `; path=${options.path}`;
    if (options.domain) cookieString += `; domain=${options.domain}`;
    if (options.maxAge !== undefined) cookieString += `; max-age=${options.maxAge}`;
    if (options.expires) cookieString += `; expires=${options.expires.toUTCString()}`;
    if (options.secure) cookieString += `; secure`;
    if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;
    if (options.httpOnly) cookieString += `; httponly`;
    
    document.cookie = cookieString;
  }

  /**
   * Delete cookie (set with past expiration date)
   */
  static deleteCookie(name: string, options: Partial<CookieOptions> = {}): void {
    if (typeof document === 'undefined') return;
    
    const deleteOptions: CookieOptions = {
      ...options,
      expires: new Date('Thu, 01 Jan 1970 00:00:00 UTC'),
      maxAge: 0
    };
    
    this.setCookie(name, '', deleteOptions);
  }

  /**
   * Clear all authentication cookies with multiple domain/path combinations
   */
  static clearAuthCookies(): void {
    if (typeof document === 'undefined') return;
    
    const cookieNames = ['jwtToken', 'jwt_token', 'role', 'JSESSIONID', 'sessionId'];
    const hostname = window.location.hostname;
    
    // Different combinations of path and domain to ensure complete removal
    const pathDomainCombinations = [
      { path: '/' },
      { path: '/', domain: hostname },
      { path: '/', domain: `.${hostname}` },
      { path: '/', sameSite: 'Lax' as const },
      { path: '/', sameSite: 'None' as const, secure: true },
      { path: '/', sameSite: 'Strict' as const }
    ];
    
    cookieNames.forEach(cookieName => {
      pathDomainCombinations.forEach(options => {
        this.deleteCookie(cookieName, options);
      });
    });
    
    console.log('All authentication cookies cleared');
  }

  /**
   * Get all cookies as an object
   */
  static getAllCookies(): Record<string, string> {
    if (typeof document === 'undefined') return {};
    
    const cookies: Record<string, string> = {};
    
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    
    return cookies;
  }

  /**
   * Debug function to log all cookies
   */
  static debugCookies(): void {
    console.log('=== Cookie Debug Info ===');
    console.log('All cookies:', this.getAllCookies());
    console.log('JWT Token (jwtToken):', this.getCookie('jwtToken'));
    console.log('JWT Token (jwt_token):', this.getCookie('jwt_token'));
    console.log('Role cookie:', this.getCookie('role'));
    console.log('========================');
  }
}

// Export default instance
export default CookieManager;