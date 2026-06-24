
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

        if (existingUserByEmail?.isVerified || existingUserByPhoneNo?.isVerified) {
            return errorResponse("Email or Phone number already in use", 409)
        }
        
        if (existingUserByEmail && existingUserByPhoneNo && existingUserByEmail._id.toString() != existingUserByPhoneNo._id.toString()) {
            return errorResponse(
                "Email and phone number belong to different pending accounts. Please use the original details or wait for account cleanup.",
                409
            );
        }
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);
        if (existingUserByEmail) {
            existingUserByEmail.name = name;
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.phoneNumber = phoneNumber;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry;
            await existingUserByEmail.save();
            const emailResponse = await sendVerificationEmail(email, name, verifyCode);
            if (!emailResponse.success) {
                return errorResponse("Failed to send verification email", 500);
            }
            return successResponse("User Updated Successfully", 200)

        }
        if (existingUserByPhoneNo) {
            existingUserByPhoneNo.name = name;
            existingUserByPhoneNo.password = hashedPassword;
            existingUserByPhoneNo.email = email;
            existingUserByPhoneNo.verifyCode = verifyCode;
            existingUserByPhoneNo.verifyCodeExpiry = verifyCodeExpiry;
            await existingUserByPhoneNo.save();
            const emailResponse = await sendVerificationEmail(email, name, verifyCode);
            if (!emailResponse.success) {
                return errorResponse("Failed to send verification email", 500);
            }
            return successResponse("User Updated Successfully", 200)
        }
        const user = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            verifyCode,
            verifyCodeExpiry
        })
        const emailResponse = await sendVerificationEmail(email, name, verifyCode);
        if (!emailResponse.success) {
            await UserModel.deleteOne({ _id: user._id });
            return errorResponse("Failed to send verification email", 500);
        }
        return successResponse("User Created Successfully")
    } catch (error) {
        console.log("Signup error", error);
        return errorResponse("error registring user")
    }
}