import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
    interface User{ //in behind the scene in next-auth async function (user: User) it works like this
        id?:string,
        name?:string
        
    }
    interface Session{
        user:{
            id?:string,
            name?:string
        } & DefaultSession['user']
    }
}
declare module 'next-auth/jwt' {
    interface JWT{
        id?:string,
        name?:string
            
    }
}