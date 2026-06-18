import dbConnect from "@/src/lib/dbConnect";
import { errorResponse } from "@/src/lib/response";
import { auth } from "../auth/[...nextauth]/option";
import WatchlistModel from "@/src/model/watchlist";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const session = await auth();
        if (!session) {
            return errorResponse("Unauthorized", 401)
        }
        const body = await req.json();
        

        const {
            symbol,
            companyName,
        } = body;

        if (!symbol || !companyName) {
            return errorResponse("Missing required fields", 400);
        }
        const existing = await WatchlistModel.findOne({
            userId: session.user._id,
            symbol,
        });
        if (existing) {
            await WatchlistModel.deleteOne({
                _id: existing._id,
            });

            return Response.json(
                {
                    success: true,
                    action: "removed"
                }
            );
        }
        await WatchlistModel.create({
            userId: session.user._id,
            symbol,
            companyName,
        });
        return Response.json(
            {
                success: true,
                action: "added"
            }
        );


    } catch (error) {
        console.error("Error adding to watchlist", error);
        return errorResponse("Error adding to watchlist");
    }
}
export async function GET() {
    await dbConnect();
    try {
        const session = await auth();
        if (!session) {
            return errorResponse("Unauthorized", 401)
        }


        const stocks = await WatchlistModel
            .find(
                { userId: session.user._id },
                {
                    symbol: 1,
                    companyName: 1,
                    createdAt: 1,
                }
            )
            .sort({ createdAt: -1 })
            .lean();
        return Response.json(
            {
                success: true,
                data: stocks
            },
            {
                status: 201
            }
        );


    } catch (error) {
        console.error("Error accessing watchlist", error);
        return errorResponse("Error accessing watchlist");
    }
}
