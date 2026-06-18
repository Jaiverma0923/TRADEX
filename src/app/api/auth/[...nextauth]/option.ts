import Credentials from "next-auth/providers/credentials"
import NextAuth from "next-auth"
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/user";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            id: "credentials",//use internally
            name: "Credentials",//shown in UI

            credentials: {
                identifier: { label: "Email", type: "text" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();

                if (!credentials?.identifier || !credentials?.password) {
                    throw new Error("Email/Phone and password are required");
                }
                const identifier = credentials.identifier as string;
                const password = credentials.password as string;
                const user = await UserModel.findOne({
                    $or: [
                        { email: identifier }, { phoneNumber: identifier }
                    ]
                })
                if (!user) {
                    throw new Error("no user found with this email or phoneNumber")
                }
                if (!user.isVerified) {
                    throw new Error("please verify your account before login")
                }
                const isPasswordCorrect = await bcrypt.compare(password, user.password);
                if (isPasswordCorrect) {
                    return {
                        _id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                    };
                }
                else {
                    throw new Error("incorrect password")
                }
            }
        }),
    ],
    callbacks:{
        async jwt({ token, user }) {
            if(user){
                token._id=user._id?.toString();
                token.name=user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if(token){
                session.user._id=token._id;
                session.user.name=token.name;
            }
            return session;
        }
    },
    pages:{
        signIn: "/login",
    },
    session:{
        strategy:"jwt"
    },
    secret:process.env.AUTH_SECRET
})