import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    mappedLearningOutcomes: {
      type: [String], // Array of ÖÇ codes (e.g., ["ÖÇ1", "ÖÇ2"])
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "En az bir öğrenme çıktısı (ÖÇ) seçilmelidir",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Question", QuestionSchema);

