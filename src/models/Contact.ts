import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  name:    string;
  email:   string;
  mobile?: string;
  subject: string;
  message: string;
  read:    boolean;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true, trim: true },
    mobile:  { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IContact>("Contact", ContactSchema);
