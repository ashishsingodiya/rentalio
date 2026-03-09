import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB Connected");
    });
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;
