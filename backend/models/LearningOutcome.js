import mongoose from "mongoose";

const LearningOutcomeSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    mappedProgramOutcomes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProgramOutcome",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Database Indexes for performance optimization
LearningOutcomeSchema.index({ courseId: 1 }); // Course'a göre arama
LearningOutcomeSchema.index({ code: 1 }); // Code'a göre arama
LearningOutcomeSchema.index({ courseId: 1, code: 1 }, { unique: true }); // Composite unique: course + code

export default mongoose.model("LearningOutcome", LearningOutcomeSchema);

