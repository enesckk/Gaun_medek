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
    maxScore: {
      type: Number,
      default: 100,
      immutable: true, // Her zaman 100, değiştirilemez
    },
    // Sınav bazlı ÖÇ eşleme - bu sınav hangi ÖÇ'lere eşlenecek
    learningOutcomes: [
      {
        type: String, // ÖÇ kodu (örn: "ÖÇ1", "ÖÇ2")
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Exam", ExamSchema);

