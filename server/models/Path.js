import mongoose from "mongoose";

const pathSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    distance: { type: Number, required: true },
    bidirectional: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Path = mongoose.model("Path", pathSchema);
export default Path;
