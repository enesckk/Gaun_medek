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

export default mongoose.model("LearningOutcome", LearningOutcomeSchema);

