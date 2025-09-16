import { NextRequest } from 'next/server'

/**
 * Environment-driven CSRF protection utility for production deployment
 * Supports multiple domains and flexible configuration
 */

// Get allowed origins from environment variables
function getAllowedOrigins(): string[] {
  const origins: string[] = []
  
  // Development origins (always included in development)
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:5000',
      'https://localhost:5000', 
      'http://127.0.0.1:5000',
      'https://127.0.0.1:5000'
    )
  }
  
  // Production origins from environment
  if (process.env.NEXTAUTH_URL) {
    origins.push(process.env.NEXTAUTH_URL)
  }
  
  // Additional allowed origins (comma-separated)
  if (process.env.ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    origins.push(...additionalOrigins)
  }
  
  // Replit production domain pattern (auto-detect from REPLIT_DOMAINS)
  if (process.env.REPLIT_DOMAINS) {
    const replitDomain = `https://${process.env.REPLIT_DOMAINS}`
    origins.push(replitDomain)
  }
  
  // Fallback: construct from host header if no configured origins (development only)
  if (origins.length === 0 && process.env.NODE_ENV === 'development') {
    console.warn('No CSRF origins configured, falling back to localhost')
    origins.push(
      'http://localhost:5000',
      'https://localhost:5000'
    )
  }
  
  // Remove duplicates and return
  return [...new Set(origins)]
}

export interface CSRFValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates CSRF protection by checking Origin and Referer headers
 * against environment-configured allowlist
 */
export function validateCSRF(request: NextRequest): CSRFValidationResult {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const allowedOrigins = getAllowedOrigins()
  
  if (allowedOrigins.length === 0) {
    console.error('CSRF: No allowed origins configured - this is a security risk!')
    return {
      isValid: false,
      error: 'CSRF configuration error - no allowed origins'
    }
  }
  
  // Validate Origin header (exact match)
  let isValidOrigin = false
  if (origin) {
    isValidOrigin = allowedOrigins.includes(origin)
    if (!isValidOrigin) {
      console.warn(`CSRF: Invalid origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`)
    }
  }
  
  // Validate Referer header (exact origin match)
  let isValidReferer = false
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = refererUrl.origin
      isValidReferer = allowedOrigins.includes(refererOrigin)
      if (!isValidReferer) {
        console.warn(`CSRF: Invalid referer origin: ${refererOrigin}. Allowed: ${allowedOrigins.join(', ')}`)
      }
    } catch (error) {
      console.warn(`CSRF: Invalid referer URL format: ${referer}`)
    }
  }
  
  // Require either valid Origin OR valid Referer for CSRF protection
  if (!isValidOrigin && !isValidReferer) {
    return {
      isValid: false,
      error: `CSRF validation failed. Origin: ${origin || 'missing'}, Referer: ${referer || 'missing'}. Allowed origins: ${allowedOrigins.join(', ')}`
    }
  }
  
  return { isValid: true }
}

/**
 * Middleware helper that returns error response for failed CSRF validation
 */
export function createCSRFError(result: CSRFValidationResult) {
  return {
    error: 'CSRF validation failed - request blocked for security',
    details: result.error,
    status: 403
  }
}