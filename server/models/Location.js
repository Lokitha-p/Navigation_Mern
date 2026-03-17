import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    block: { type: String, required: true },
    floor: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "room",
        "classroom",
        "lab",
        "office",
        "facility",
        "common",
        "landing",
      ],
      default: "room",
    },
    description: { type: String },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

const Location = mongoose.model("Location", locationSchema);
export default Location;
