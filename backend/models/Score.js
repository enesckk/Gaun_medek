import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    scoreValue: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate score entries for the same student-question pair
ScoreSchema.index({ studentId: 1, questionId: 1 }, { unique: true });

export default mongoose.model("Score", ScoreSchema);

