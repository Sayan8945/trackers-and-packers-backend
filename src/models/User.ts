import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  mobile?: string;
  password?: string;
  avatar?: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  googleId?: string;
  // Firebase Phone Auth fields
  firebaseUid?: string;
  provider?: "local" | "google" | "firebase";
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile:           { type: String, trim: true, sparse: true },
    password:         { type: String, select: false },
    avatar:           { type: String },
    role:             { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified:  { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    googleId:         { type: String, sparse: true },
    // Firebase Phone Auth fields
    firebaseUid:      { type: String, sparse: true, index: true },
    provider:         { type: String, enum: ["local", "google", "firebase"], default: "local" },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
