import sharp from "sharp";

// Lazy load OpenCV - only load when needed (saves memory)
let cv = null;
let opencvType = null; // 'opencv4nodejs' or 'opencv.js'
let opencvLoadPromise = null; // Cache the load promise

/**
 * Lazy load OpenCV - only loads when first needed
 */
async function loadOpenCV() {
  // Return cached instance if already loaded
  if (cv) {
    return { cv, opencvType };
  }

  // Return cached promise if already loading
  if (opencvLoadPromise) {
    return opencvLoadPromise;
  }

  // Start loading
  opencvLoadPromise = (async () => {
    try {
      // First try opencv4nodejs (preferred, better performance)
      const cvModule = await import("opencv4nodejs").catch(() => null);
      if (cvModule) {
        const loadedCv = cvModule?.default || cvModule || null;
        if (loadedCv) {
          cv = loadedCv;
          opencvType = 'opencv4nodejs';
          global.cv = cv;
          global.opencvType = opencvType;
          return { cv, opencvType };
        }
      }
    } catch (error) {
      // Ignore, try opencv.js
    }

    // If opencv4nodejs not available, try opencv.js
    try {
      const opencvJs = await import("opencv.js").catch(() => null);
      if (opencvJs) {
        cv = opencvJs.default || opencvJs;
        opencvType = 'opencv.js';
        global.cv = cv;
        global.opencvType = opencvType;
        return { cv, opencvType };
      }
    } catch (error) {
      // Ignore
    }

    return { cv: null, opencvType: null };
  })();

  return opencvLoadPromise;
}

/**
 * Detect 4 black square markers in the exam template
 * @param {Buffer} imageBuffer - PNG image buffer
 * @returns {Promise<Object>} Marker coordinates
 */
export async function detectMarkers(imageBuffer) {
  try {
    // Lazy load OpenCV when needed
    const { cv: loadedCv, opencvType: loadedType } = await loadOpenCV();
    const opencv = loadedCv || global.cv || cv;
    const cvType = loadedType || global.opencvType || opencvType;

    if (!opencv) {
      throw new Error("OpenCV not available");
    }

    console.log(`🔍 Marker detection başlatılıyor (OpenCV tipi: ${cvType})...`);

    let image, gray, threshold, contours;
    let imageWidth, imageHeight; // Store for later use

    if (cvType === 'opencv.js') {
      // opencv.js API - convert PNG buffer to Mat
      // Optimize: Resize large images before processing to save memory
      // Marker detection doesn't need full resolution (max 2000px width/height)
      const maxDimension = 2000;
      let processedBuffer = imageBuffer;
      let originalWidth = 0;
      let originalHeight = 0;
      let scaleRatio = 1.0;

      // Get image dimensions first
      const metadata = await sharp(imageBuffer).metadata();
      originalWidth = metadata.width || 1654;
      originalHeight = metadata.height || 2339;
      
      // Resize if too large (save memory)
      if (originalWidth > maxDimension || originalHeight > maxDimension) {
        const targetWidth = originalWidth > originalHeight 
          ? maxDimension 
          : Math.round((originalWidth / originalHeight) * maxDimension);
        const targetHeight = originalHeight > originalWidth 
          ? maxDimension 
          : Math.round((originalHeight / originalWidth) * maxDimension);
        
        scaleRatio = originalWidth / targetWidth; // Store scale for later
        processedBuffer = await sharp(imageBuffer)
          .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer();
        
        console.log(`   🔄 Görüntü ${originalWidth}x${originalHeight} -> ${targetWidth}x${targetHeight} olarak küçültüldü (bellek tasarrufu)`);
      }
      
      // Use Sharp to decode PNG and get raw image data
      const imageData = await sharp(processedBuffer)
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });
      
      const { data, info } = imageData;
      imageWidth = info.width;
      imageHeight = info.height;
      
      // Create Mat from image data (RGBA format)
      // Use TypedArray instead of Array.from for better memory efficiency
      image = new opencv.Mat(info.height, info.width, opencv.CV_8UC4);
      
      // Copy data to Mat using TypedArray (more memory efficient than Array.from)
      const dataArray = new Uint8Array(data);
      const tempMat = opencv.matFromArray(info.height, info.width, opencv.CV_8UC4, dataArray);
      tempMat.copyTo(image);
      tempMat.delete();
      
      // Convert RGBA to grayscale
      gray = new opencv.Mat();
      opencv.cvtColor(image, gray, opencv.COLOR_RGBA2GRAY);
      
      // Apply Gaussian blur (like Python code) - reduces noise
      const blurred = new opencv.Mat();
      opencv.GaussianBlur(gray, blurred, new opencv.Size(5, 5), 0);
      
      // Apply OTSU threshold (like Python code) - better than fixed threshold
      threshold = new opencv.Mat();
      opencv.threshold(blurred, threshold, 0, 255, opencv.THRESH_BINARY_INV + opencv.THRESH_OTSU);
      
      // Find contours
      const contoursVec = new opencv.MatVector();
      const hierarchy = new opencv.Mat();
      opencv.findContours(threshold, contoursVec, hierarchy, opencv.RETR_EXTERNAL, opencv.CHAIN_APPROX_SIMPLE);
      
      const contourCount = contoursVec.size();
      console.log(`   📊 ${contourCount} contour bulundu`);
      
      contours = [];
      // Extract contours and check for square shapes (like Python code)
      for (let i = 0; i < contourCount; i++) {
        try {
          const contour = contoursVec.get(i);
          if (contour && contour.rows > 0 && contour.cols > 0) {
            // Check if contour is approximately a square (like Python code)
            const area = opencv.contourArea(contour, false);
            if (area < 1000) {  // Filter small noise (like Python code)
              contour.delete();
              continue;
            }
            
            // Approximate polygon (like Python code)
            const peri = opencv.arcLength(contour, true);
            const approx = new opencv.Mat();
            opencv.approxPolyDP(contour, approx, 0.04 * peri, true);
            
            // Check if it's a quadrilateral (4 corners)
            if (approx.rows === 4) {
              const rect = opencv.boundingRect(approx);
              const ar = rect.width / rect.height;
              
              // Check if it's approximately square (0.8 < ar < 1.2, like Python code)
              if (0.8 < ar && ar < 1.2) {
                // Clone the contour to avoid issues when Vec is deleted
                const contourClone = new opencv.Mat();
                contour.copyTo(contourClone);
                contours.push(contourClone);
              }
            }
            
            approx.delete();
            contour.delete();
          }
        } catch (err) {
          console.warn(`   ⚠️ Contour ${i} işlenirken hata:`, err.message);
          // Continue with next contour
        }
      }
      
      // Cleanup intermediate Mat objects
      image.delete();
      gray.delete();
      blurred.delete();
      threshold.delete();
      hierarchy.delete();
      contoursVec.delete();
    } else {
      // opencv4nodejs API (original code)
      image = opencv.imdecode(imageBuffer);
      imageWidth = image.cols || 1654;
      imageHeight = image.rows || 2339;
      gray = image.bgrToGray();
      threshold = gray.threshold(127, 255, opencv.THRESH_BINARY_INV);
      contours = threshold.findContours(
        opencv.RETR_EXTERNAL,
        opencv.CHAIN_APPROX_SIMPLE
      );
    }

    // Filter contours by shape and size
    const markers = [];
    
    // Calculate area thresholds based on image size
    // For 1654x2339: minArea=1600 (~40x40), maxArea=3600 (~60x60)
    // Scale based on actual image size
    const scaleFactor = Math.min(imageWidth / 1654, imageHeight / 2339);
    const minArea = Math.round(1600 * scaleFactor * scaleFactor);
    const maxArea = Math.round(3600 * scaleFactor * scaleFactor);
    const aspectRatioTolerance = 0.3; // Increased tolerance for aspect ratio
    
    console.log(`   📐 Görüntü boyutu: ${imageWidth}x${imageHeight}px, ölçek: ${scaleFactor.toFixed(2)}`);
    console.log(`   📏 Area filtreleme: ${minArea}-${maxArea} (özgün: 1600-3600)`);

    for (let i = 0; i < contours.length; i++) {
      const contour = contours[i];
      let area, rect;
      
      if (cvType === 'opencv.js') {
        try {
          // Validate contour before processing
          if (!contour || contour.rows === 0 || contour.cols === 0) {
            contour.delete();
            continue;
          }
          
          area = opencv.contourArea(contour, false);
          
          // Check if area is valid
          if (isNaN(area) || area < 0) {
            contour.delete();
            continue;
          }
          
          const rectMat = opencv.boundingRect(contour);
          
          // boundingRect in opencv.js returns a Rect object
          // It should have x, y, width, height properties
          if (rectMat && typeof rectMat === 'object') {
            // Check if it's a Rect object with properties
            if ('x' in rectMat && 'y' in rectMat && 'width' in rectMat && 'height' in rectMat) {
              rect = {
                x: Number(rectMat.x) || 0,
                y: Number(rectMat.y) || 0,
                width: Number(rectMat.width) || 0,
                height: Number(rectMat.height) || 0
              };
            } else {
              // Try to access as array indices if it's an array-like object
              rect = {
                x: Number(rectMat[0]) || 0,
                y: Number(rectMat[1]) || 0,
                width: Number(rectMat[2]) || 0,
                height: Number(rectMat[3]) || 0
              };
            }
            
            // Validate rect values
            if (isNaN(rect.x) || isNaN(rect.y) || isNaN(rect.width) || isNaN(rect.height) ||
                rect.width <= 0 || rect.height <= 0) {
              contour.delete();
              continue;
            }
          } else {
            console.warn(`   ⚠️ boundingRect beklenmeyen format döndü:`, typeof rectMat);
            contour.delete();
            continue;
          }
        } catch (rectError) {
          console.error(`   ❌ Contour işleme hatası (${i}/${contours.length}):`, rectError.message);
          if (contour) {
            try {
              contour.delete();
            } catch (e) {
              // Ignore cleanup errors
            }
          }
          continue;
        }
      } else {
        area = contour.area;
        rect = contour.boundingRect();
      }

      // Check area
      if (area < minArea || area > maxArea) {
        // Debug: log first few rejected contours
        if (i < 10 && markers.length < 5) {
          console.log(`   ⚠️ Contour ${i} area filtresi: area=${area.toFixed(0)} (min=${minArea}, max=${maxArea}), size=${rect.width}x${rect.height}`);
        }
        // Cleanup opencv.js contour if needed
        if (cvType === 'opencv.js') {
          contour.delete();
        }
        continue;
      }

      // Check aspect ratio (should be close to 1 for squares)
      const aspectRatio = rect.width / rect.height;
      if (Math.abs(aspectRatio - 1) > aspectRatioTolerance) {
        // Debug: log first few rejected contours
        if (i < 10 && markers.length < 5) {
          console.log(`   ⚠️ Contour ${i} aspect ratio filtresi: ${aspectRatio.toFixed(2)} (tolerance=${aspectRatioTolerance}), size=${rect.width}x${rect.height}`);
        }
        // Cleanup opencv.js contour if needed
        if (cvType === 'opencv.js') {
          contour.delete();
        }
        continue;
      }
      
      // Debug: log all accepted markers
      console.log(`   ✅ Marker adayı ${markers.length + 1}: area=${area.toFixed(0)}, size=${rect.width}x${rect.height}, aspect=${aspectRatio.toFixed(2)}, pos=(${rect.x},${rect.y})`);

      // Calculate center
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;

      markers.push({
        x: centerX,
        y: centerY,
        width: rect.width,
        height: rect.height,
      });
      
      // Cleanup opencv.js Mat objects
      if (cvType === 'opencv.js') {
        contour.delete();
      }
    }

    console.log(`   📍 ${markers.length} marker adayı bulundu (minimum 4 gerekli)`);

    if (markers.length < 4) {
      throw new Error(
        `Template markers not found. Found ${markers.length} markers, need 4. Please upload the correct exam template.`
      );
    }

    // Sort markers to identify corners
    const sortedBySum = [...markers].sort((a, b) => a.x + a.y - (b.x + b.y));
    const topLeft = sortedBySum[0];

    const sortedByXDesc = [...markers].sort((a, b) => b.x - a.x || a.y - b.y);
    const topRight = sortedByXDesc[0];

    const sortedByXAsc = [...markers].sort((a, b) => a.x - b.x || b.y - a.y);
    const bottomLeft = sortedByXAsc[0];

    const sortedBySumDesc = [...markers].sort(
      (a, b) => b.x + b.y - (a.x + a.y)
    );
    const bottomRight = sortedBySumDesc[0];

    return {
      success: true,
      topLeft: { x: topLeft.x, y: topLeft.y },
      topRight: { x: topRight.x, y: topRight.y },
      bottomLeft: { x: bottomLeft.x, y: bottomLeft.y },
      bottomRight: { x: bottomRight.x, y: bottomRight.y },
    };
  } catch (err) {
    const errorMessage = err?.message || String(err) || "Unknown error";
    const reason = errorMessage.includes("OpenCV not available") 
      ? "opencv_missing" 
      : "markers_not_found";
    
    console.error("❌ Marker detection hatası:", errorMessage);
    console.error("   Hata detayı:", err);
    
    if (reason === "opencv_missing") {
      console.warn("⚠️  OpenCV yüklü değil. Marker detection kullanılamıyor, şablon modu aktif.");
    } else {
      console.warn("⚠️  Marker bulunamadı:", errorMessage, "- Şablon modu kullanılıyor.");
    }
    
    return {
      success: false,
      reason,
      markers: [],
      message: reason === "opencv_missing" 
        ? "OpenCV yüklü değil, şablon modunda işleniyor"
        : "Marker bulunamadı, şablon modunda işleniyor"
    };
  }
}
