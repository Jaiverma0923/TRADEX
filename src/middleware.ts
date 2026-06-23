import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";


export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    const url = request.nextUrl;
    console.log("MIDDLEWARE HIT");
    if (
        token &&
        (
            url.pathname === '/' ||
            url.pathname.startsWith('/login') ||
            url.pathname.startsWith('/signUp') ||
            url.pathname.startsWith('/verify') 
        )
    ) {
        return NextResponse.redirect(
            new URL('/dashboard', request.url)
        );
    }

    if (
        !token &&
        url.pathname.startsWith('/dashboard')
    ) {
        return NextResponse.redirect(
            new URL('/login', request.url)
        );
    }
    return NextResponse.next();

}
// config where do you want to run this middleware file
export const config = {
    matcher: [
        '/login',
        '/signUp',
        '/verify',
        '/'
    ],
};
