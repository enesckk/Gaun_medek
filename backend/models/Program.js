import mongoose from "mongoose";

const ProgramSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    programOutcomes: [
      {
        code: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index: department + code should be unique
ProgramSchema.index({ department: 1, code: 1 }, { unique: true });

// Additional indexes for performance optimization
ProgramSchema.index({ department: 1 }); // Department'a göre arama
ProgramSchema.index({ createdAt: -1 }); // Son eklenen programlar için

export default mongoose.model("Program", ProgramSchema);



