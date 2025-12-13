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

export default mongoose.model("Course", CourseSchema);
