import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    semester: String,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    description: String,

    learningOutcomes: [
      {
        code: String,
        description: String,
        programOutcomes: [String], // PÇ codes (e.g., ["PÇ1", "PÇ2"])
      },
    ],

    midtermExam: {
      examCode: String,
      questionCount: Number,
      maxScorePerQuestion: Number,
    },

    finalExam: {
      examCode: String,
      questionCount: Number,
      maxScorePerQuestion: Number,
    },

    students: [
      {
        studentNumber: String,
        fullName: String,
      },
    ],
  },
  { timestamps: true }
);

// Database Indexes for performance optimization
CourseSchema.index({ code: 1 }, { unique: true }); // Unique index zaten var ama açıkça belirtiyoruz
CourseSchema.index({ department: 1 }); // Department'a göre arama
CourseSchema.index({ program: 1 }); // Program'a göre arama
CourseSchema.index({ department: 1, program: 1 }); // Composite index: department + program
CourseSchema.index({ createdAt: -1 }); // Son eklenen dersler için

export default mongoose.model("Course", CourseSchema);
