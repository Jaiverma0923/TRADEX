import dbConnect from "@/src/lib/dbConnect";
import { errorResponse, successResponse } from "@/src/lib/response";
import UserModel from "@/src/model/user";

export async function POST(req:Request){
    await dbConnect();
    try {
        const { email , verifyCode }=await req.json();
        const user=await UserModel.findOne({email});
        if(!user){
            return errorResponse("User not found",404);
        }
        if(user.isVerified){
            return errorResponse("User already Verified",409);
        }
        const time=new Date();
        if(user.verifyCodeExpiry < time){
            return errorResponse("Code expired",400);
        }
        if(user.verifyCode!==verifyCode){
            return errorResponse("Incorrect Code",400)
        }  
        user.isVerified=true;
        user.verifyCode = "";
        user.verifyCodeExpiry = new Date(0);
        await user.save();
        return successResponse("User verified successfully",200);
    } catch (error) {
        console.log("Error Verifying Email",error);
        return errorResponse("Error Verifying Email")
    }
}