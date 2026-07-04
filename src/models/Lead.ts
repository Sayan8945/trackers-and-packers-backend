import mongoose, { Document, Schema } from "mongoose";

export type LeadStatus = "new" | "contacted" | "converted" | "lost";
export type ServiceType = "household" | "office" | "car" | "bike" | "local" | "domestic";

export interface ILead extends Document {
  name:        string;
  mobile:      string;
  email?:      string;
  moveFrom:    string;
  moveTo:      string;
  moveDate?:   Date;
  serviceType: ServiceType;
  message?:    string;
  status:      LeadStatus;
  createdAt:   Date;
  updatedAt:   Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name:        { type: String, required: true, trim: true },
    mobile:      { type: String, required: true, trim: true },
    email:       { type: String, trim: true, lowercase: true },
    moveFrom:    { type: String, required: true, trim: true },
    moveTo:      { type: String, required: true, trim: true },
    moveDate:    { type: Date },
    serviceType: { type: String, enum: ["household","office","car","bike","local","domestic"], required: true },
    message:     { type: String, trim: true },
    status:      { type: String, enum: ["new","contacted","converted","lost"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model<ILead>("Lead", LeadSchema);
