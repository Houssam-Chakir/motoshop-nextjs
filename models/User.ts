import mongoose, { Document, model, models, Schema } from "mongoose";

export interface DeliveryInformation {
  fullName: string;
  number: string;
  email: string;
  city: string;
  address: string;
  extraDirections: string;
}

export interface User extends Document {
  name: string;
  email: string;
  // password?: string;
  image?: string;
  role: "customer" | "admin";
  likedProducts: mongoose.Types.ObjectId[];
  cart: mongoose.Types.ObjectId[];
  orders: mongoose.Types.ObjectId[];
  deliveryInformation: DeliveryInformation;
  createdAt: Date;
  updatedAt: Date;
  // comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: [true, "Please provide a name"], trim: true },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
    },
    // password: {
    //   type: String,
    //   minlength: [6, "Password must be at least 6 characters long"],
    // },
    image: String,
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    likedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1, min: [1, "Quantity cannot be less than 1"] },
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,

        ref: "Order",
      },
    ],

    deliveryInformation: {
      fullName: { type: String, required: false, trim: true },
      number: { type: String, required: false },
      email: { type: String, required: false },
      address: { type: String, required: false },
      extraDirections: { type: String, required: false },
    },
  },

  { timestamps: true }
);

const User = models.User || model('User', UserSchema)

export default User
