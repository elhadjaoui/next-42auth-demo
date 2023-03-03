import NextAuth from 'next-auth'
import FortyTwoProvider from 'next-auth/providers/42-school'

const invalidPrimaryCampus = (profile) => {
    const campusId = profile.campus_users.find(cu => cu.is_primary)?.campus_id

    return campusId.toString() !== process.env.CAMPUS_ID
}

export const authOptions = {
    secret: process.env.SECRET,
    
    providers: [
        FortyTwoProvider({
            clientId: process.env.FT_UID,
            clientSecret: process.env.FT_SECRET
        })
    ],

    callbacks: {
        async signIn({ profile, user }) {
            // don't proceed if missing infos.
            if (!profile || !user) return false
            
            // if you want to authorize your app to your campus only
            if (invalidPrimaryCampus(profile)) return false;

            return user
        },
        // to pass a value from the sign-in to the frontend, client-side,
        // you can use a combination of the session and jwt callback like so:
        async jwt({ token, profile, account }) {
            if (profile && account) {
                // we pass user_id, login and access_token to the frontend via token
                token.user_id = profile.id
                token.login = profile.login
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }) {
            // we received user_id, login and access_token from the jwt callback
            session.user.login = token.login
            session.user.user_id = token.user_id
            session.accessToken = token.accessToken
            return session
        },

    }
}

export default NextAuth(authOptions)