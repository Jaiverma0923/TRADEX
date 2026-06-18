import mongoose, { Document, Schema } from "mongoose";

export interface Watchlist extends Document{
    userId: mongoose.Types.ObjectId,
    symbol:string,
    companyName:string
}
const WatchlistSchema = new Schema<Watchlist>(
    {
        userId:{
            type: Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        symbol:{
            type:String,
            required:true,
            uppercase: true,
            trim: true,
        },
        companyName:{
            type:String,
            required:true,
            trim: true,
        }
    },
    {
        timestamps:true
    }
)
WatchlistSchema.index({userId:1 , symbol:1},{unique:true})

const WatchlistModel= 
(mongoose.models.Watchlist as mongoose.Model<Watchlist>) ||
mongoose.model<Watchlist>("Watchlist", WatchlistSchema);

export default WatchlistModel;