import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // null değerlere izin ver ama unique olsun
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    programs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program",
      },
    ],
    programOutcomes: [
      {
        code: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Database Indexes for performance optimization
DepartmentSchema.index({ code: 1 }, { unique: true, sparse: true }); // Unique index zaten var ama açıkça belirtiyoruz
DepartmentSchema.index({ name: 1 }, { unique: true }); // Unique index zaten var ama açıkça belirtiyoruz
DepartmentSchema.index({ createdAt: -1 }); // Son eklenen bölümler için

export default mongoose.model("Department", DepartmentSchema);

