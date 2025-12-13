import mongoose from "mongoose";

const QuestionScoreSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true },
    score: { type: Number, required: true },
    learningOutcomeCode: { type: String, required: true },
  },
  { _id: false }
);

const StudentExamResultSchema = new mongoose.Schema(
  {
    studentNumber: { type: String, required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    questionScores: { type: [QuestionScoreSchema], default: [] },
    outcomePerformance: { type: Object, default: {} },
    programOutcomePerformance: { type: Object, default: {} },
  },
  {
    timestamps: true,
  }
);

const StudentExamResult = mongoose.model("StudentExamResult", StudentExamResultSchema);

export default StudentExamResult;

