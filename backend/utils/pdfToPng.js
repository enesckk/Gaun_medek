import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert PDF to PNG using pdf-poppler or pdftoppm
 * @param {Buffer|string} pdfInput - PDF buffer or file path
 * @returns {Promise<{ buffer: Buffer; filePath: string }>} PNG buffer & temp path
 */
async function pdfToPng(pdfInput) {
  try {
    // Check if pdf-poppler is available, otherwise use pdftoppm
    let tempPdfPath;
    let isTempFile = false;

    // If input is buffer, save to temp file
    if (Buffer.isBuffer(pdfInput)) {
      tempPdfPath = path.join(__dirname, "../temp", `temp_${Date.now()}.pdf`);
      const tempDir = path.dirname(tempPdfPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      fs.writeFileSync(tempPdfPath, pdfInput);
      isTempFile = true;
    } else {
      tempPdfPath = pdfInput;
    }

    // Try using pdf-poppler first
    try {
      const pdfPopplerModule = await import("pdf-poppler");
      const pdfPoppler = pdfPopplerModule.default || pdfPopplerModule;
      const options = {
        format: "png",
        out_dir: path.join(__dirname, "../temp"),
        out_prefix: `page_${Date.now()}`,
        page: 1,
      };

      await pdfPoppler.convert(tempPdfPath, options);

      const pngPath = path.join(
        options.out_dir,
        `${options.out_prefix}-1.png`
      );
      const pngBuffer = fs.readFileSync(pngPath);

      // Temizlik: PDF'yi temizle ama PNG'yi sakla (path döndürülüyor)
      if (isTempFile && fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }

      return { buffer: pngBuffer, filePath: pngPath };
    } catch (popplerError) {
      // Fallback to pdftoppm (poppler-utils)
      const outputPath = path.join(
        process.cwd(),
        "temp",
        `output_${Date.now()}.png`
      );
      const outputDir = path.dirname(outputPath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      try {
        execSync(
          `pdftoppm -png -f 1 -l 1 "${tempPdfPath}" "${outputPath.replace('.png', '')}"`,
          { stdio: "ignore" }
        );

        const pngFiles = fs
          .readdirSync(outputDir)
          .filter((f) => f.startsWith(path.basename(outputPath, ".png")) && f.endsWith(".png"));

        if (pngFiles.length === 0) {
          throw new Error("No PNG output generated");
        }

        const generatedPng = path.join(outputDir, pngFiles[0]);
        const pngBuffer = fs.readFileSync(generatedPng);

        // Temizlik: PDF'yi temizle ama PNG'yi sakla (path döndürülüyor)
        if (isTempFile && fs.existsSync(tempPdfPath)) {
          fs.unlinkSync(tempPdfPath);
        }

        return { buffer: pngBuffer, filePath: generatedPng };
      } catch (pdftoppmError) {
        // Cleanup on error
        if (isTempFile && fs.existsSync(tempPdfPath)) {
          fs.unlinkSync(tempPdfPath);
        }
        throw new Error(
          "PDF to PNG conversion failed. Please install pdf-poppler or poppler-utils."
        );
      }
    }
  } catch (error) {
    throw new Error(`PDF to PNG conversion error: ${error.message}`);
  }
}

export { pdfToPng };

