import { Profile, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // invoked on successful sign in
    async signIn({ profile }: {profile: Profile}) {
      // 1 connect to database
      // 2 check if user exists
      // 3 if not, create new user
      // 4 Return true to allow sign in
    },
    // session callback function that modifies the session object
    async session({ session }: {session: Session}) {
      // 1 get user from database
      // 2 asign user id from session
      // 3 return the session
    },
  },
};
