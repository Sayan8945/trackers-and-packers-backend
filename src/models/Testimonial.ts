import mongoose, { Document, Schema } from "mongoose";

export interface ITestimonial extends Document {
  name:      string;
  role:      string;
  text:      string;
  rating:    number;
  address?:  string;
  date?:     string;
  image?:    string;
  status:    "published" | "hidden";
  createdAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name:    { type: String, required: true, trim: true },
    role:    { type: String, required: true, trim: true },
    text:    { type: String, required: true, trim: true },
    rating:  { type: Number, min: 1, max: 5, default: 5 },
    address: { type: String, trim: true },
    date:    { type: String },
    image:   { type: String },
    status:  { type: String, enum: ["published", "hidden"], default: "published" },
  },
  { timestamps: true }
);

export default mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
