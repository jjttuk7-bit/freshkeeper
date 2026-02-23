import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/fridge/:path*',
    '/scan/:path*',
    '/chef/:path*',
    '/shopping/:path*',
    '/analytics/:path*',
    '/family/:path*',
    '/settings/:path*',
  ],
}
