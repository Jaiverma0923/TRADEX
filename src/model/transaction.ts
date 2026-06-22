import mongoose, { Document, Schema } from "mongoose"

export interface Transaction extends Document{
    userId:mongoose.Types.ObjectId,
    symbol:string,
    companyName:string,
    type:"BUY" | "SELL", 
    quantity:number,
    price:number,
}
const TransactionSchema=new Schema<Transaction>(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        symbol:{
            type:String,
            required:true
        },
        companyName:{
            type:String,
            required:true
        },
        type:{
            type:String,
            enum:["BUY","SELL"],
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            required:true,
        }
    },
    {
        timestamps:true
    }
)
const TransactionModel=mongoose.models.Transaction as mongoose.Model<Transaction> || mongoose.model<Transaction>("Transaction",TransactionSchema);
export default TransactionModel;