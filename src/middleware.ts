import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    return
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Apply middleware to protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/protected/:path*',
  ],
}