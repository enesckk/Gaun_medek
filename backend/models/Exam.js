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

// Database Indexes for performance optimization
ExamSchema.index({ courseId: 1 }); // Sık kullanılan: course'a göre sınav arama
ExamSchema.index({ examType: 1 }); // Sınav tipine göre arama
ExamSchema.index({ examCode: 1 }); // Sınav koduna göre arama
ExamSchema.index({ courseId: 1, examType: 1 }); // Composite index: course + examType
ExamSchema.index({ createdAt: -1 }); // Son eklenen sınavlar için

export default mongoose.model("Exam", ExamSchema);

