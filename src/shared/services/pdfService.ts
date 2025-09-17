import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFService {
  static async generatePDFFromHTML(htmlContent: string, _fileName = 'cv.pdf'): Promise<Blob> {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '794px'; // A4 width in pixels at 96 DPI
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        windowWidth: 794,
        windowHeight: 1123 // A4 height in pixels at 96 DPI
      });

      // Calculate dimensions for PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > 297 ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add pages if content is longer than one page
      const pageHeight = 297; // A4 height in mm
      let position = 0;
      let remainingHeight = imgHeight;

      while (remainingHeight > 0) {
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        
        if (!pageCtx) throw new Error('Could not get canvas context');

        const sourceY = position * (canvas.height / imgHeight);
        const sourceHeight = Math.min(pageHeight * (canvas.height / imgHeight), canvas.height - sourceY);
        
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );

        if (position > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          pageCanvas.toDataURL('image/png'),
          'PNG',
          0, 0, imgWidth, Math.min(pageHeight, remainingHeight)
        );

        position += pageHeight;
        remainingHeight -= pageHeight;
      }

      // Return as blob
      return pdf.output('blob');
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  }

  static downloadPDF(blob: Blob, fileName = 'cv.pdf') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}