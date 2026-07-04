import mongoose, { Document, Schema } from "mongoose";

export interface IRefreshToken extends Document {
  token:     string;
  userId:    mongoose.Types.ObjectId;
  userType:  "user" | "admin";
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token:    { type: String, required: true, unique: true },
  userId:   { type: Schema.Types.ObjectId, required: true, refPath: "userType" },
  userType: { type: String, enum: ["user", "admin"], required: true },
  expiresAt:{ type: Date, required: true },
}, { timestamps: true });

// Auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
