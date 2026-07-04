import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  title:       string;
  slug:        string;
  excerpt:     string;
  content:     string;
  coverImage?: string;
  category:    string;
  tags:        string[];
  author:      string;
  status:      "draft" | "published";
  publishedAt?: Date;
  createdAt:   Date;
  updatedAt:   Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt:     { type: String, required: true, trim: true },
    content:     { type: String, required: true },
    coverImage:  { type: String },
    category:    { type: String, required: true, trim: true },
    tags:        [{ type: String }],
    author:      { type: String, default: "Admin" },
    status:      { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model<IBlog>("Blog", BlogSchema);
