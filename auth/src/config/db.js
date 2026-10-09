import mongoose from "mongoose"

export const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database");
    } catch (error) {
        console.error("MongoDB connection error:" , error);
        process.exit(1);
    }
};