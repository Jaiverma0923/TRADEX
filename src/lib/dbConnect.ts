import mongoose from "mongoose";

const dbConnect=async()=>{
    if(mongoose.connection.readyState>=1){
        console.log("already connected to database");
        return
    }
    try {
        const mongo=process.env.MONGODB_URI;
        if(!mongo){
            throw new Error("mongoURI is not available");
        }
        await mongoose.connect(mongo);
        console.log("DATABASE CONNECTED")
    } catch (error) {
        console.error("Error connecting Database",error);
        throw error;
    }
}
export default dbConnect;