import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    examType: {
      type: String,
      enum: ["midterm", "final"],
      required: true,
    },
    examCode: {
      type: String,
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
    },
    maxScorePerQuestion: {
      type: Number,
      required: true,
    },
    questions: [
      {
        questionNumber: {
          type: Number,
          required: true,
        },
        learningOutcomeCode: {
          type: String, // e.g., "ÖÇ1"
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Exam", ExamSchema);

