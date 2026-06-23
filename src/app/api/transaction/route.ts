import dbConnect from "@/src/lib/dbConnect";
import { errorResponse, successResponse } from "@/src/lib/response";
import { auth } from "../auth/[...nextauth]/option";
import { TransactionSchema } from "@/src/schemas/transactionSchema";
import TransactionModel from "@/src/model/transaction";

export async function POST(req:Request){
    await dbConnect();
    try {
        const session=await auth();
        if(!session){
            return errorResponse("Unauthorized", 401);
        }
        const body=await req.json();
        const result=TransactionSchema.safeParse(body);
        if(!result.success){
            return errorResponse(result.error.issues[0]?.message || "Invalid input", 400)
        }
        const {symbol,companyName,quantity,price,type}=result.data;
        await TransactionModel.create({
            userId:session?.user._id,
            symbol,
            companyName,
            quantity,
            price,
            type
        })
        return successResponse("Transaction added successfully",201)


    } catch (error) {
        console.error("error adding the transaction",error);
        return errorResponse("error adding the transaction")
    }
}
export async function GET(){
    await dbConnect();
    try {
        const session=await auth();
        if(!session){
            return errorResponse("Unauthorized", 401);
        }
        const user=session?.user._id;
        const transactions=await TransactionModel.find({userId:user}).sort({createdAt:-1}).lean();
        return Response.json(
            {
                success:true,
                data:transactions
            },
            {
                status:200
            }
        )

    } catch (error) {
        console.error("error getting the transaction",error);
        return errorResponse("error getting the transaction")
    }
}