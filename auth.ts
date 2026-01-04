
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false
      
      const allowedUsers = process.env.ALLOWED_USERS?.split(",") || []
      // Trim spaces just in case user added spaces in env var
      const cleanAllowedUsers = allowedUsers.map(u => u.trim())
      
      return cleanAllowedUsers.includes(user.email)
    },
  },
  pages: {
    signIn: '/login', // We will create a custom login page
  },
})
