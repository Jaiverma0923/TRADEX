
import { sendVerificationEmail } from "@/src/helpers/sendVerificationEmail";
import dbConnect from "@/src/lib/dbConnect"
import { errorResponse, successResponse } from "@/src/lib/response";
import UserModel from "@/src/model/user";
import { signUpSchema } from "@/src/schemas/signUpSchema";
import bcrypt from "bcryptjs";


export const POST = async (req: Request) => {
    try {
        await dbConnect();
        const body = await req.json();
        const result = signUpSchema.safeParse(body);
        if (!result.success) {
            return errorResponse(result.error.issues[0]?.message || "Invalid input", 400)
        }
        const { name, email, password, phoneNumber } = result.data
        const [existingUserByEmail, existingUserByPhoneNo] =
            await Promise.all([
                UserModel.findOne({ email }),
                UserModel.findOne({ phoneNumber }),
            ]);
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return errorResponse("email already exist", 409);
            }
            if (existingUserByEmail.phoneNumber !== phoneNumber) {
                return errorResponse(
                    "Phone number does not match account",
                    400
                );
            }
            else {

                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry;
                await existingUserByEmail.save();
                const emailResponse = await sendVerificationEmail( email, name, verifyCode );
                if (!emailResponse.success) {
                    return errorResponse("Failed to send verification email",500);
                }
                return successResponse("Verification code updated", 200)
            }
        }
        if (existingUserByPhoneNo) {
            return errorResponse("phone number already exist", 409);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user=await UserModel.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            verifyCode,
            verifyCodeExpiry
        })
        const emailResponse = await sendVerificationEmail( email, name, verifyCode );
        console.log(emailResponse);
        if (!emailResponse.success) {
            await UserModel.deleteOne({_id:user._id});
            return errorResponse("Failed to send verification email",500);
        }
        return successResponse("User Created Successfully")
    } catch (error) {
        console.log("Signup error", error);
        return errorResponse("error registring user")
    }
}