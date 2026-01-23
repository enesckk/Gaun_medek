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

// Database Indexes for performance optimization
StudentSchema.index({ studentNumber: 1 }, { unique: true }); // Unique index zaten var ama açıkça belirtiyoruz
StudentSchema.index({ department: 1 }); // Department'a göre arama
StudentSchema.index({ classLevel: 1 }); // Sınıf seviyesine göre arama
StudentSchema.index({ createdAt: -1 }); // Son eklenen öğrenciler için

export default mongoose.model("Student", StudentSchema);

