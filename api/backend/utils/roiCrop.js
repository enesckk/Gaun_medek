import sharp from "sharp";

// Try to load OpenCV - will be set dynamically in functions
let cv = null;

/**
 * Warp image using perspective transform and crop ROIs
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} markers - Marker coordinates
 * @returns {Promise<Object>} Warped image buffer and ROI definitions
 */
async function warpAndDefineROIs(imageBuffer, markers) {
  // Try to load OpenCV if not already loaded
  if (!cv) {
    try {
      const cvModule = await import("opencv4nodejs").catch(() => null);
      cv = cvModule?.default || cvModule || null;
    } catch (error) {
      cv = null;
    }
  }
  
  if (!cv) {
    throw new Error(
      "Perspective transform requires opencv4nodejs. Please install: npm install opencv4nodejs"
    );
  }

  try {
    // Target canvas size
    const targetWidth = 2480;
    const targetHeight = 3508;

    // Source points (markers)
    const srcPoints = [
      [markers.topLeft.x, markers.topLeft.y],
      [markers.topRight.x, markers.topRight.y],
      [markers.bottomLeft.x, markers.bottomLeft.y],
      [markers.bottomRight.x, markers.bottomRight.y],
    ];

    // Destination points (corners of target canvas)
    const dstPoints = [
      [0, 0],
      [targetWidth, 0],
      [0, targetHeight],
      [targetWidth, targetHeight],
    ];

    // Convert buffer to OpenCV Mat
    const image = cv.imdecode(imageBuffer);

    // Get perspective transform matrix
    const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, srcPoints.flat());
    const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, dstPoints.flat());
    const transformMatrix = cv.getPerspectiveTransform(srcMat, dstMat);

    // Apply perspective transform
    const warped = image.warpPerspective(
      transformMatrix,
      new cv.Size(targetWidth, targetHeight)
    );

    // Convert back to buffer
    const warpedBuffer = Buffer.from(cv.imencode(".png", warped));

    // Define ROIs (fixed pixel regions after warping)
    const studentNumberBoxes = [
      { x: 900, y: 1150, w: 140, h: 140 },
      { x: 1040, y: 1150, w: 140, h: 140 },
      { x: 1180, y: 1150, w: 140, h: 140 },
      { x: 1320, y: 1150, w: 140, h: 140 },
      { x: 1460, y: 1150, w: 140, h: 140 },
      { x: 1600, y: 1150, w: 140, h: 140 },
      { x: 1740, y: 1150, w: 140, h: 140 },
      { x: 1880, y: 1150, w: 140, h: 140 },
      { x: 2020, y: 1150, w: 140, h: 140 },
      { x: 2160, y: 1150, w: 140, h: 140 },
    ];

    const examIdBoxes = [
      { x: 980, y: 1350, w: 140, h: 140 },
      { x: 1120, y: 1350, w: 140, h: 140 },
    ];

    const questionScoreBoxes = [
      { number: 1, x: 1500, y: 1650, w: 350, h: 120 },
      { number: 2, x: 1500, y: 1770, w: 350, h: 120 },
      { number: 3, x: 1500, y: 1890, w: 350, h: 120 },
      { number: 4, x: 1500, y: 2010, w: 350, h: 120 },
      { number: 5, x: 1500, y: 2130, w: 350, h: 120 },
      { number: 6, x: 1500, y: 2250, w: 350, h: 120 },
      { number: 7, x: 1500, y: 2370, w: 350, h: 120 },
      { number: 8, x: 1500, y: 2490, w: 350, h: 120 },
      { number: 9, x: 1500, y: 2610, w: 350, h: 120 },
      { number: 10, x: 1500, y: 2730, w: 350, h: 120 },
    ];

    return {
      warpedImage: warpedBuffer,
      studentNumberBoxes,
      examIdBoxes,
      questionScoreBoxes,
    };
  } catch (error) {
    throw new Error(`ROI warping failed: ${error.message}`);
  }
}

/**
 * Crop a specific ROI from the warped image
 * @param {Buffer} warpedImageBuffer - Warped image buffer
 * @param {Object} roi - ROI definition {x, y, w, h}
 * @returns {Promise<Buffer>} Cropped image buffer
 */
async function cropROI(warpedImageBuffer, roi) {
  try {
    const cropped = await sharp(warpedImageBuffer)
      .extract({
        left: roi.x,
        top: roi.y,
        width: roi.w,
        height: roi.h,
      })
      .png()
      .toBuffer();

    return cropped;
  } catch (error) {
    throw new Error(`ROI cropping failed: ${error.message}`);
  }
}

export { warpAndDefineROIs, cropROI };

