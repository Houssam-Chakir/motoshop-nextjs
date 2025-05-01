import mongoose from "mongoose";

let connected = false;

const connectDB = async () => {
  // check if mongodb uri is undefined
  if (!process.env.MONGODB_URI) throw new Error("Undefined MongoDB URI");
  const MONGODB_URI: string = process.env.MONGODB_URI;

  //ensure only fields defined in schema to be saved in database
  mongoose.set("strictQuery", true);

  //check if db is already connected
  if (connected) {
    console.log("MongoDB is already connected ✅");
    return;
  }

  // connect to mongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    connected = true;
  } catch (error) {
    console.log('Error connecting to database', error);
    connected = false
  }
};

export default connectDB;
