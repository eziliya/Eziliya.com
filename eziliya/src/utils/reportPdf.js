import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Renders a DOM node to a multi-page A4 PDF and triggers download.
 * Uses the usual html2canvas + jsPDF vertical slice pattern.
 */
export async function downloadReportPdf(element, filename = 'report.pdf') {
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
    allowTaint: true,
    imageTimeout: 0,
  })

  const imgData = canvas.toDataURL('image/png', 1.0)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const marginX = 12
  const imgWidth = pdf.internal.pageSize.getWidth() - 2 * marginX
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', marginX, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', marginX, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}