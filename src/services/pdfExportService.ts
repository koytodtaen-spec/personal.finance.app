import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  fileName?: string;
  elementId?: string;
  onProgress?: (status: string) => void;
}

/**
 * Capture an HTML DOM element and compile it into a downloadable A4 PDF file
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  fileName: string = 'financial-statement.pdf',
  onProgress?: (msg: string) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress('กำลังประมวลผลรูปแบบเอกสาร...');

    // Temporarily ensure background is clean white and proper width for A4
    const originalShadow = element.style.boxShadow;
    element.style.boxShadow = 'none';

    if (onProgress) onProgress('กำลังเรนเดอร์กราฟิกและฟอนต์ความละเอียดสูง (2x HD)...');

    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for ultra-sharp vector-like text & charts
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800, // Normalized desktop width for standard A4 layout
    });

    element.style.boxShadow = originalShadow;

    if (onProgress) onProgress('กำลังสร้างโครงสร้างไฟล์ PDF...');

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    const imgProps = pdf.getImageProperties(imgData);
    const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = calculatedHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Handle multi-page overflow if the transaction ledger is long
    while (heightLeft > 0) {
      position = heightLeft - calculatedHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    if (onProgress) onProgress('กำลังบันทึกไฟล์...');
    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);

    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
}

/**
 * Triggers standard browser print dialog for the target element
 */
export function triggerPrintReport(): void {
  window.print();
}
