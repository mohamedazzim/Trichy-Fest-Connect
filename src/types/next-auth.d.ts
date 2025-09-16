import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      userType: 'producer' | 'consumer'
    }
  }

  interface User {
    userType: 'producer' | 'consumer'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userType: 'producer' | 'consumer'
  }
}