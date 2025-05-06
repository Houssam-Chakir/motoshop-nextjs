import mongoose, { Document, model, models, Schema } from "mongoose";

export interface DeliveryInformation {
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  address: string;
  zipcode: number;
  extraDirections: string;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  // password?: string;
  image?: string;
  role: "customer" | "admin";
  likedProducts?: mongoose.Types.ObjectId[];
  cart?: mongoose.Types.ObjectId[];
  orders?: mongoose.Types.ObjectId[];
  deliveryInformation?: DeliveryInformation;
  createdAt?: Date;
  updatedAt?: Date;
  // comparePassword(candidatePassword: string): Promise<boolean>;
}

const DeliveryInfoSchema = new Schema({
  fullName: { type: String, required: false, trim: true },
  phoneNumber: { type: String, required: false },
  email: { type: String, required: false },
  address: { type: String, required: false },
  zipcode: { type: Number, required: false },
  extraDirections: { type: String, required: false },
});

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: [true, "Please provide a name"], trim: true },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
    },
    // password: {
    //   type: String,
    //   minlength: [6, "Password must be at least 6 characters long"],
    // },
    image: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    likedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: { type: Schema.Types.ObjectId, ref: "Cart" },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],

    deliveryInformation: DeliveryInfoSchema,
  },

  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export type UserType = Omit<UserDocument, keyof Document>;

export default User;
export { DeliveryInfoSchema };
