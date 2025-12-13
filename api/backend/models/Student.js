import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    studentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
    },
    classLevel: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Student", StudentSchema);

