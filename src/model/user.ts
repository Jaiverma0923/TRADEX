import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  verifyCode:string,
  verifyCodeExpiry: Date,
  isVerified: boolean,
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<User> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique:true
    },
    verifyCode: {
      type: String,
    },
    verifyCodeExpiry: {
      type: Date,
      required:true
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    balance: {
      type: Number,
      default: 100000,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;