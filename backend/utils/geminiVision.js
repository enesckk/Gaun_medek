import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initialize Gemini Vision API client
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Get Gemini model with fallback - tries models in order until one works
 */
function getGeminiModel(genAI) {
  // Model priority list (newest to oldest, most capable to least)
  const modelNames = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ];

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      console.log(`✅ Using Gemini model: ${modelName}`);
      return model;
    } catch (error) {
      console.warn(`⚠️ Model ${modelName} not available: ${error.message}`);
      continue;
    }
  }

  // If all models fail, throw error
  throw new Error(`None of the Gemini models are available. Tried: ${modelNames.join(", ")}`);
}

/**
 * Extract numeric value from an image using Gemini Vision API
 * @param {Buffer} imageBuffer - Image buffer (PNG)
 * @returns {Promise<number>} Extracted number (0 if empty)
 */
async function extractNumberFromImage(imageBuffer) {
  try {
    const genAI = getGeminiClient();
    const model = getGeminiModel(genAI);

    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");

    const prompt =
      "Extract the numeric value inside this box. Only return a single number. If empty, return 0. Do not include any explanation or text, only the number.";

    console.log("🤖 Calling Gemini API to extract number from image...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/png",
        },
      },
    ]);

    const response = result.response;
    const text = response.text().trim();
    
    console.log(`🤖 Gemini API response: "${text}"`);

    // Parse the response
    if (!text || text === "" || text.toLowerCase() === "empty") {
      console.log("  → Parsed as: 0 (empty)");
      return 0;
    }

    // Extract first number from response
    const numberMatch = text.match(/\d+/);
    if (!numberMatch) {
      console.error(`  ❌ No number found in response: "${text}"`);
      throw new Error("Invalid score value detected.");
    }

    const number = parseInt(numberMatch[0], 10);
    if (isNaN(number)) {
      console.error(`  ❌ Invalid number parsed: "${numberMatch[0]}"`);
      throw new Error("Invalid score value detected.");
    }

    console.log(`  ✅ Parsed number: ${number}`);
    return number;
  } catch (error) {
    if (error.message.includes("GEMINI_API_KEY")) {
      throw error;
    }
    console.error(`  ❌ Gemini API error: ${error.message}`);
    throw new Error(`Gemini Vision API error: ${error.message}`);
  }
}

/**
 * Extract student id (numeric) from a full page image using Gemini Vision
 * @param {Buffer} imageBuffer - PNG buffer
 * @returns {Promise<string|null>} student number or null
 */
async function extractStudentIdFromImage(imageBuffer) {
  try {
    console.log("🤖 Calling Gemini API for full-page student number OCR...");
    const genAI = getGeminiClient();
    const model = getGeminiModel(genAI);
    const base64Image = imageBuffer.toString("base64");
    const prompt =
      "Extract ONLY the student ID number from this exam paper. Return just the digits without spaces or text. If not found, return EMPTY.";
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/png",
        },
      },
    ]);
    const text = result.response.text().trim();
    console.log(`🤖 Gemini OCR response: "${text}"`);
    if (!text || text.toLowerCase() === "empty") {
      console.log("  → No student number found (EMPTY)");
      return null;
    }
    const match = text.match(/\d{5,12}/);
    if (match) {
      console.log(`  ✅ Extracted student number: ${match[0]}`);
      return match[0];
    } else {
      console.log(`  ❌ No valid student number pattern found in: "${text}"`);
      return null;
    }
  } catch (error) {
    console.error(`  ❌ Full-page OCR error: ${error.message}`);
    return null;
  }
}

/**
 * Extract student number from 10 digit boxes
 * @param {Array<Buffer>} digitBoxes - Array of 10 image buffers
 * @returns {Promise<string>} Student number string
 */
async function extractStudentNumber(digitBoxes) {
  console.log(`🔢 Extracting student number from ${digitBoxes.length} digit boxes...`);
  const digits = [];
  for (let i = 0; i < digitBoxes.length; i++) {
    console.log(`  Reading digit ${i + 1}/${digitBoxes.length}...`);
    const digit = await extractNumberFromImage(digitBoxes[i]);
    digits.push(digit.toString());
    console.log(`  Digit ${i + 1}: ${digit}`);
  }
  const studentNumber = digits.join("");
  console.log(`✅ Extracted student number: ${studentNumber}`);
  return studentNumber;
}

/**
 * Extract exam ID from 2 digit boxes
 * @param {Array<Buffer>} digitBoxes - Array of 2 image buffers
 * @returns {Promise<string>} Exam ID string (2 digits)
 */
async function extractExamId(digitBoxes) {
  const digit1 = await extractNumberFromImage(digitBoxes[0]);
  const digit2 = await extractNumberFromImage(digitBoxes[1]);
  return `${digit1}${digit2}`;
}

/**
 * Extract scores from question score boxes
 * @param {Array<Buffer>} scoreBoxes - Array of score box image buffers
 * @returns {Promise<Array<number>>} Array of scores
 */
async function extractScores(scoreBoxes) {
  const scores = [];
  for (let i = 0; i < scoreBoxes.length; i++) {
    const score = await extractNumberFromImage(scoreBoxes[i]);
    // Clamp score between 0 and 100
    scores.push(Math.max(0, Math.min(100, score)));
  }
  return scores;
}

export {
  extractNumberFromImage,
  extractStudentNumber,
  extractExamId,
  extractScores,
  extractStudentIdFromImage,
};

