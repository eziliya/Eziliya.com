import html2pdf from 'html2pdf.js';

/**
 * Generate high-quality PDF from HTML element using html2pdf.js
 * This provides better quality than basic html2canvas approach
 *
 * @param {HTMLElement} element - The DOM element to convert to PDF
 * @param {string} filename - The name of the PDF file
 * @param {Object} options - Additional options for PDF generation
 */
export async function generateHighQualityPdf(element, filename = 'report.pdf', options = {}) {
  const defaultOptions = {
    margin: [10, 10, 10, 10], // top, right, bottom, left in mm
    filename: filename,
    image: {
      type: 'jpeg',
      quality: 0.98 // High quality (0-1)
    },
    html2canvas: {
      scale: 4, // Higher scale = better quality
      useCORS: true,
      letterRendering: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
      // Capture full height of element
      height: element.scrollHeight,
      windowHeight: element.scrollHeight,
      width: element.scrollWidth,
      windowWidth: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      // Font rendering improvements
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body;
        // Improve text rendering
        clonedElement.style.fontSmoothing = 'antialiased';
        clonedElement.style.webkitFontSmoothing = 'antialiased';
        clonedElement.style.textRendering = 'optimizeLegibility';
        
        // Ensure all text is black and visible
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach(el => {
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.color === 'rgba(0, 0, 0, 0)' || computedStyle.color === 'transparent') {
            el.style.color = '#000000';
          }
        });
      }
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      precision: 16,
      hotfixes: ['px_scaling'] // Fix for proper scaling
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['tr', 'td', 'th', 'img']
    },
    enableLinks: false // Disable links to avoid issues
  };

  // Merge custom options with defaults
  const finalOptions = {
    ...defaultOptions,
    ...options,
    html2canvas: {
      ...defaultOptions.html2canvas,
      ...(options.html2canvas || {})
    },
    jsPDF: {
      ...defaultOptions.jsPDF,
      ...(options.jsPDF || {})
    }
  };

  try {
    // Generate PDF with high quality settings
    await html2pdf()
      .set(finalOptions)
      .from(element)
      .save();
    
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

/**
 * Alternative method: Generate PDF with even higher quality using custom settings
 * This method provides maximum quality but may take longer to generate
 */
export async function generateUltraHighQualityPdf(element, filename = 'report.pdf') {
  return generateHighQualityPdf(element, filename, {
    margin: [10, 10, 10, 10],
    image: { 
      type: 'jpeg', 
      quality: 1.0 // Maximum quality
    },
    html2canvas: { 
      scale: 5, // Ultra high scale for maximum quality
      dpi: 300, // Print quality DPI
      letterRendering: true,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: false, // Don't compress for maximum quality
      precision: 32 // Maximum precision
    }
  });
}

/**
 * Generate PDF optimized for file size while maintaining good quality
 */
export async function generateOptimizedPdf(element, filename = 'report.pdf') {
  return generateHighQualityPdf(element, filename, {
    margin: [10, 10, 10, 10],
    image: { 
      type: 'jpeg', 
      quality: 0.92 // Good balance between quality and size
    },
    html2canvas: { 
      scale: 3,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true // Compress to reduce file size
    }
  });
}

// Made with Bob
