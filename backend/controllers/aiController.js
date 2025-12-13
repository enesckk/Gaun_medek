import multer from "multer";
import { pdfToPng } from "../utils/pdfToPng.js";
import { detectMarkers } from "../utils/markerDetect.js";
import { warpAndDefineROIs, cropROI } from "../utils/roiCrop.js";
import {
  extractStudentNumber,
  extractExamId,
  extractScores,
} from "../utils/geminiVision.js";

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"), false);
    }
  },
});

/**
 * Process exam PDF and extract data using AI
 * POST /api/ai/process
 */
const processExam = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Step 1: Convert PDF to PNG
    let imageBuffer;
    if (req.file.mimetype === "application/pdf") {
      const { buffer } = await pdfToPng(req.file.buffer);
      imageBuffer = buffer;
    } else {
      // Already an image
      imageBuffer = req.file.buffer;
    }

    // Step 2: Detect template markers
    const markers = await detectMarkers(imageBuffer);

    // Step 3: Warp image and define ROIs
    const { warpedImage, studentNumberBoxes, examIdBoxes, questionScoreBoxes } =
      await warpAndDefineROIs(imageBuffer, markers);

    // Step 4: Crop all ROIs
    const studentNumberCrops = await Promise.all(
      studentNumberBoxes.map((box) => cropROI(warpedImage, box))
    );

    const examIdCrops = await Promise.all(
      examIdBoxes.map((box) => cropROI(warpedImage, box))
    );

    const questionScoreCrops = await Promise.all(
      questionScoreBoxes.map((box) => cropROI(warpedImage, box))
    );

    // Step 5: Extract data using Gemini Vision API
    const studentNumber = await extractStudentNumber(studentNumberCrops);
    const examId = await extractExamId(examIdCrops);
    const scores = await extractScores(questionScoreCrops);

    // Step 6: Assemble final JSON
    const answers = questionScoreBoxes.map((box, index) => ({
      number: box.number,
      scoreValue: scores[index],
    }));

    // Generate session ID for frontend tracking
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const result = {
      sessionId,
      studentNumber,
      examId,
      answers,
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI processing error:", error);
    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "AI could not process the exam sheet. Check template or values.",
    });
  }
};

export {
  processExam,
  upload,
};

