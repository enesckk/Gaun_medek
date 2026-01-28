/**
 * Export a React component/element as PDF
 * @param elementId - ID of the element to export
 * @param filename - Name of the PDF file (without .pdf extension)
 * @param options - Additional options for PDF generation
 */
export async function exportToPDF(
  elementId: string,
  filename: string = `export_${new Date().toISOString().split('T')[0]}`,
  options?: {
    margin?: number;
    format?: [number, number] | 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape';
    quality?: number;
  }
): Promise<void> {
  // Dynamic imports to avoid build-time errors if packages aren't installed
  let jsPDF: any;
  let html2canvas: any;

  try {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.jsPDF;
  } catch (error) {
    throw new Error('jspdf paketi yüklü değil. Lütfen "npm install jspdf" komutunu çalıştırın.');
  }

  try {
    html2canvas = (await import('html2canvas')).default;
  } catch (error) {
    throw new Error('html2canvas paketi yüklü değil. Lütfen "npm install html2canvas" komutunu çalıştırın.');
  }

  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  const {
    margin = 10,
    format = 'a4',
    orientation = 'portrait',
    quality = 1.0,
  } = options || {};

  try {
    // Show loading indicator
    const loadingToast = document.createElement('div');
    loadingToast.textContent = 'PDF oluşturuluyor...';
    loadingToast.style.position = 'fixed';
    loadingToast.style.top = '20px';
    loadingToast.style.right = '20px';
    loadingToast.style.background = '#0a294e';
    loadingToast.style.color = 'white';
    loadingToast.style.padding = '12px 20px';
    loadingToast.style.borderRadius = '8px';
    loadingToast.style.zIndex = '10000';
    loadingToast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    document.body.appendChild(loadingToast);

    // Convert element to canvas
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Calculate PDF dimensions (mm)
    const baseWidthMm = format === 'a4' ? 210 : format === 'letter' ? 216 : format[0];
    const baseHeightMm = format === 'a4' ? 297 : format === 'letter' ? 279 : format[1];

    const pdfWidthMm = orientation === 'landscape' ? baseHeightMm : baseWidthMm;
    const pdfHeightMm = orientation === 'landscape' ? baseWidthMm : baseHeightMm;

    const contentWidthMm = pdfWidthMm - margin * 2;
    const contentHeightMm = pdfHeightMm - margin * 2;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [pdfWidthMm, pdfHeightMm],
    });

    // Convert mm -> px ratio based on canvas width
    // We scale the canvas to fit the page width; then we slice by the page's inner height.
    const pxPerMm = canvas.width / contentWidthMm;
    const pageContentHeightPx = Math.floor(contentHeightMm * pxPerMm);

    const totalPages = Math.max(1, Math.ceil(canvas.height / pageContentHeightPx));

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) pdf.addPage();

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      const sliceHeightPx = Math.min(pageContentHeightPx, canvas.height - pageIndex * pageContentHeightPx);
      sliceCanvas.height = sliceHeightPx;

      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context oluşturulamadı');

      // White background for each slice
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

      ctx.drawImage(
        canvas,
        0,
        pageIndex * pageContentHeightPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );

      const imgData = sliceCanvas.toDataURL('image/png', 0.95);
      const sliceHeightMm = sliceHeightPx / pxPerMm;

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin,
        contentWidthMm,
        sliceHeightMm
      );
    }

    // Remove loading indicator
    document.body.removeChild(loadingToast);

    // Save PDF
    pdf.save(`${filename}.pdf`);
  } catch (error: any) {
    console.error('PDF export error:', error);
    throw new Error(error?.message || 'PDF oluşturulurken hata oluştu');
  }
}

/**
 * Export multiple elements as a single PDF
 */
export async function exportMultipleToPDF(
  elementIds: string[],
  filename: string = `export_${new Date().toISOString().split('T')[0]}`,
  options?: Parameters<typeof exportToPDF>[2]
): Promise<void> {
  // Dynamic imports
  let jsPDF: any;
  let html2canvas: any;

  try {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.jsPDF;
  } catch (error) {
    throw new Error('jspdf paketi yüklü değil. Lütfen "npm install jspdf" komutunu çalıştırın.');
  }

  try {
    html2canvas = (await import('html2canvas')).default;
  } catch (error) {
    throw new Error('html2canvas paketi yüklü değil. Lütfen "npm install html2canvas" komutunu çalıştırın.');
  }

  const {
    margin = 10,
    format = 'a4',
    orientation = 'portrait',
    quality = 1.0,
  } = options || {};

  const baseWidthMm = format === 'a4' ? 210 : format === 'letter' ? 216 : (format as [number, number])[0];
  const baseHeightMm = format === 'a4' ? 297 : format === 'letter' ? 279 : (format as [number, number])[1];

  const pdfWidthMm = orientation === 'landscape' ? baseHeightMm : baseWidthMm;
  const pdfHeightMm = orientation === 'landscape' ? baseWidthMm : baseHeightMm;

  const contentWidthMm = pdfWidthMm - margin * 2;
  const contentHeightMm = pdfHeightMm - margin * 2;

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm],
  });

  for (let i = 0; i < elementIds.length; i++) {
    const element = document.getElementById(elementIds[i]);
    if (!element) continue;

    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const pxPerMm = canvas.width / contentWidthMm;
    const pageContentHeightPx = Math.floor(contentHeightMm * pxPerMm);

    const totalPages = Math.max(1, Math.ceil(canvas.height / pageContentHeightPx));

    // New element starts on a new page (except first)
    if (i > 0) pdf.addPage();

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) pdf.addPage();

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      const sliceHeightPx = Math.min(pageContentHeightPx, canvas.height - pageIndex * pageContentHeightPx);
      sliceCanvas.height = sliceHeightPx;

      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context oluşturulamadı');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

      ctx.drawImage(
        canvas,
        0,
        pageIndex * pageContentHeightPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );

      const imgData = sliceCanvas.toDataURL('image/png', 0.95);
      const sliceHeightMm = sliceHeightPx / pxPerMm;

      pdf.addImage(imgData, 'PNG', margin, margin, contentWidthMm, sliceHeightMm);
    }
  }

  pdf.save(`${filename}.pdf`);
}
