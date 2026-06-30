
import styles from '../au small finance/AusmallfinanceFinalReport.module.css'
import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import logopng from '../../assets/logo.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';


export default function JalgaonBankFinalReport() {
      const location = useLocation()
           const [formData, setFormData] = useState(() => location.state?.formData ?? {})
           const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
           const [isSaving, setIsSaving] = useState(false)
           const [savedReportId, setSavedReportId] = useState(null)
           const reportRef = useRef(null)
         
           useEffect(() => {
             console.log('=== FINAL REPORT LOADED ===');
             console.log('Location state:', location.state);
             console.log('Form data from state:', location.state?.formData);
             console.log('Number of fields received:', Object.keys(location.state?.formData || {}).length);
             
             if (location.state?.formData && Object.keys(location.state.formData).length > 0) {
               console.log('Setting form data in final report...');
               console.log('Sample fields from navigation:', {
                 applicantsName: location.state.formData.applicantsName,
                 dateOfTechnicalInitiation: location.state.formData.dateOfTechnicalInitiation,
                 proposalIdApplicationNo: location.state.formData.proposalIdApplicationNo
               });
               // FIXED: Replace entire formData instead of merging
               setFormData(location.state.formData);
               console.log('Form data set successfully');
             } else {
               console.warn('⚠️ No form data received from navigation state');
             }
           }, [location.state])
         
           const pdfFileName = useMemo(() => {
             const safe = (v) =>
               String(v || '')
                 .trim()
                 .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
                 .replace(/\s+/g, '_')
                 .slice(0, 60)
         
             const date = new Date()
             const yyyy = String(date.getFullYear())
             const mm = String(date.getMonth() + 1).padStart(2, '0')
             const dd = String(date.getDate()).padStart(2, '0')
         
             const base =
               safe(formData.proposalIdApplicationNo) ||
               safe(formData.applicantsName) ||
               `report_${yyyy}${mm}${dd}`
         
             return `TECHNICAL_VALUATION_${base}_${yyyy}${mm}${dd}.pdf`
           }, [formData.applicantsName, formData.proposalIdApplicationNo])
         
           // Save report to MongoDB
           const handleSaveReport = async () => {
             if (isSaving) return;
             
             setIsSaving(true);
             try {
               const token = localStorage.getItem('token');
               
               if (!token) {
                 toast.error('Please login to save the report');
                 return;
               }
         
               const reportData = {
                 ...formData,
                 status: 'draft',
                 assignedTo: 'office-engineer',
                 workflowStage: 'office-engineer'
               };
         
               let response;
               // Get formId from location state or savedReportId
               const formId = location.state?.formId || savedReportId;
               
               if (!formId) {
                 toast.error('No form ID found. Please start from the form page.');
                 return;
               }
         
               // Update the existing form with final report data
               response = await axios.put(
                 `${API_BASE_URL}/ausmall-finance-form/${formId}`,
                 reportData
               );
               
               setSavedReportId(formId);
               toast.success('Final Report saved successfully!');
         
               console.log('Report saved:', response.data);
             } catch (error) {
               console.error('Error saving report:', error);
               const errorMessage = error.response?.data?.message || error.message || 'Failed to save report';
               toast.error(`Save failed: ${errorMessage}`);
             } finally {
               setIsSaving(false);
             }
           };
         
           const handleDownloadPdf = async () => {
             if (!reportRef.current || isDownloadingPdf) return
         
             setIsDownloadingPdf(true)
             try {
               const element = reportRef.current
               const prevScrollX = window.scrollX
               const prevScrollY = window.scrollY
         
               window.scrollTo(0, 0)
               element.scrollIntoView({ block: 'start', inline: 'nearest' })
               await new Promise((r) => setTimeout(r, 1000))
         
               const canvas = await html2canvas(element, {
                 scale: 1.5, // Balanced quality and file size (was 2)
                 useCORS: true,
                 allowTaint: false,
                 backgroundColor: '#ffffff',
                 logging: false, // Disable logging for performance
                 windowWidth: element.scrollWidth,
                 windowHeight: element.scrollHeight,
                 width: element.scrollWidth,
                 height: element.scrollHeight,
                 imageTimeout: 15000, // 15 second timeout
                 removeContainer: true,
                 letterRendering: true,
                 scrollX: 0,
                 scrollY: -window.scrollY,
                 foreignObjectRendering: false,
                 onclone: (clonedDoc) => {
                   const cloned = clonedDoc.querySelector('[data-pdf-root="ausmallfinance"]')
                   if (cloned) {
                     // Set root background
                     cloned.style.backgroundColor = '#ffffff'
                     cloned.style.color = '#000000'
                     cloned.style.fontSmoothing = 'antialiased'
                     cloned.style.webkitFontSmoothing = 'antialiased'
                     cloned.style.textRendering = 'optimizeLegibility'
                     cloned.style.display = 'block'
                     cloned.style.position = 'relative'
                     
                     // Hide all delete photo buttons in PDF
                     const deleteButtons = cloned.querySelectorAll('button[type="button"]')
                     deleteButtons.forEach(button => {
                       if (button.textContent.includes('Delete Photo') || button.textContent.includes('Delete')) {
                         button.style.display = 'none'
                         button.style.visibility = 'hidden'
                         button.style.opacity = '0'
                         button.style.height = '0'
                         button.style.margin = '0'
                         button.style.padding = '0'
                         
                         // Also hide the parent container if it's a photo container
                         const parent = button.closest('div[style*="position: relative"]') || button.parentElement;
                         if (parent && parent.querySelector('img')) {
                           // Check if this is a deleted photo (button exists but photo should be hidden)
                           const img = parent.querySelector('img');
                           if (img && !img.src) {
                             parent.style.display = 'none';
                           }
                         }
                       }
                     })
                     
                     // Hide all buttons in PDF (Save, Download, Delete, etc.)
                     const allButtons = cloned.querySelectorAll('button')
                     allButtons.forEach(button => {
                       button.style.display = 'none'
                       button.style.visibility = 'hidden'
                       button.style.opacity = '0'
                       button.style.height = '0'
                       button.style.margin = '0'
                       button.style.padding = '0'
                     })
                     
                     // Hide file input elements (upload buttons)
                     const fileInputs = cloned.querySelectorAll('input[type="file"]')
                     fileInputs.forEach(input => {
                       input.style.display = 'none'
                       input.style.visibility = 'hidden'
                       input.style.height = '0'
                       input.style.margin = '0'
                       input.style.padding = '0'
                       
                       // Hide the parent container if no photo is uploaded
                       const parent = input.parentElement;
                       if (parent) {
                         // Check if this parent contains an image
                         const hasImage = parent.querySelector('img');
                         if (!hasImage) {
                           // No image found, hide the entire section
                           parent.style.display = 'none';
                           parent.style.visibility = 'hidden';
                           parent.style.height = '0';
                           parent.style.margin = '0';
                           parent.style.padding = '0';
                         }
                       }
                     })
                     
                     // Hide labels for file inputs (Upload Photo labels)
                     const fileLabels = cloned.querySelectorAll('label[for*="Upload"], label[for*="photo"], label[for*="Photo"]')
                     fileLabels.forEach(label => {
                       if (label.getAttribute('for')?.includes('photo') ||
                           label.getAttribute('for')?.includes('Photo') ||
                           label.getAttribute('for')?.includes('Upload') ||
                           label.textContent.includes('Upload')) {
                         label.style.display = 'none'
                         label.style.visibility = 'hidden'
                         label.style.height = '0'
                         label.style.margin = '0'
                         label.style.padding = '0'
                       }
                     })
                     
                     // Hide empty photo containers (photos that were deleted or not uploaded)
                     const photoContainers = cloned.querySelectorAll('div[style*="position: relative"]')
                     photoContainers.forEach(container => {
                       const img = container.querySelector('img')
                       const deleteBtn = container.querySelector('button')
                       // If container has a delete button but no valid image, hide it
                       if (deleteBtn && (!img || !img.src || img.src === '' || img.src === 'null')) {
                         container.style.display = 'none'
                         container.style.visibility = 'hidden'
                         container.style.height = '0'
                         container.style.margin = '0'
                         container.style.padding = '0'
                       }
                     })
                     
                     // Remove entire table rows that contain only empty photo sections
                     const allTableRows = Array.from(cloned.querySelectorAll('tr'))
                     const rowsToRemove = []
                     
                     allTableRows.forEach(row => {
                       // Check if this row contains photo upload sections
                       const hasFileInput = row.querySelector('input[type="file"]')
                       const hasPhotoLabel = row.querySelector('label[for*="photo"], label[for*="Photo"]')
                       
                       if (hasFileInput || hasPhotoLabel) {
                         // This is a photo row, check if it has any actual photos
                         const images = row.querySelectorAll('img')
                         let hasValidImage = false
                         
                         images.forEach(img => {
                           if (img.src && img.src !== '' && img.src !== 'null' && !img.src.includes('logo')) {
                             hasValidImage = true
                           }
                         })
                         
                         // If no valid images in this row, mark for removal
                         if (!hasValidImage) {
                           rowsToRemove.push(row)
                         }
                       }
                     })
                     
                     // Remove spacing rows that come after photo rows
                     const spacingRows = Array.from(cloned.querySelectorAll('tr[style*="height:180"], tr[style*="height:880"], tr[style*="height:900"], tr.noBorder'))
                     spacingRows.forEach(spacingRow => {
                       const prevRow = spacingRow.previousElementSibling
                       if (prevRow && rowsToRemove.includes(prevRow)) {
                         rowsToRemove.push(spacingRow)
                       }
                     })
                     
                     // Actually remove the rows from DOM
                     rowsToRemove.forEach(row => {
                       if (row.parentNode) {
                         row.parentNode.removeChild(row)
                       }
                     })
                     
                     // Fix caption styling for PDF - prevent page breaks and fix overlapping
                     const captions = cloned.querySelectorAll('caption')
                     captions.forEach(caption => {
                       caption.style.display = 'table-caption'
                       caption.style.captionSide = 'top'
                       caption.style.backgroundColor = '#ffffff'
                       caption.style.padding = '0'
                       caption.style.margin = '0'
                       caption.style.border = 'none'
                       caption.style.width = '100%'
                       caption.style.textAlign = 'center'
                       caption.style.pageBreakInside = 'avoid'
                       caption.style.breakInside = 'avoid'
                       caption.style.pageBreakAfter = 'avoid'
                       caption.style.breakAfter = 'avoid'
                       
                       // Fix overlapping logo and text in PDF
                       const captionDivs = caption.querySelectorAll('div')
                       captionDivs.forEach((div, index) => {
                         div.style.pageBreakInside = 'avoid'
                         div.style.breakInside = 'avoid'
                         div.style.display = 'block'
                         div.style.width = '100%'
                         
                         // Fix negative margins that cause overlap in PDF
                         if (div.style.marginTop && div.style.marginTop.includes('-')) {
                           // Convert negative margins to positive for PDF
                           const marginValue = parseInt(div.style.marginTop)
                           if (marginValue < -100) {
                             div.style.marginTop = '30px' // Large negative becomes positive spacing
                           } else if (marginValue < 0) {
                             div.style.marginTop = '-50px' // Small negative becomes small positive
                           }
                         }
                       })
                       
                       // Fix caption images - remove negative margins
                       const captionImages = caption.querySelectorAll('img')
                       captionImages.forEach(img => {
                         img.style.display = 'block'
                         img.style.maxWidth = '100%'
                         img.style.height = 'auto'
                         img.style.pageBreakInside = 'avoid'
                         
                         // Fix negative margin that causes overlap
                         if (img.style.marginTop && img.style.marginTop.includes('-')) {
                           img.style.marginTop = '-130px'
                         }
                         // Ensure proper positioning
                         img.style.position = 'relative'
                         img.style.float = 'left'
                         img.style.marginRight = '20px'
                         img.style.marginBottom = '20px'
                       })
                       
                       // Ensure caption headings are visible and properly spaced
                       const captionHeadings = caption.querySelectorAll('h1, h2, h3, name')
                       captionHeadings.forEach(heading => {
                         heading.style.display = 'block'
                         heading.style.visibility = 'visible'
                         heading.style.opacity = '1'
                         heading.style.pageBreakInside = 'avoid'
                       })
                       
                       // Add clear fix for the last div to prevent overlap
                       const lastDiv = caption.querySelector('div:last-child')
                       if (lastDiv) {
                         lastDiv.style.clear = 'both'
                         lastDiv.style.paddingTop = '10px'
                       }
                     })
                     
                     // Ensure images are visible and properly sized
                     const images = cloned.querySelectorAll('img')
                     images.forEach(img => {
                       img.style.display = 'block'
                       img.style.visibility = 'visible'
                       img.style.opacity = '1'
                       img.style.maxWidth = '100%'
                       img.style.height = 'auto'
                     })
                     
                     // Make all tables visible
                     const tables = cloned.querySelectorAll('table')
                     tables.forEach(table => {
                       table.style.backgroundColor = '#ffffff'
                       table.style.borderCollapse = 'collapse'
                       table.style.width = '100%'
                       table.style.display = 'table'
                     })
                     
                     // Make all table cells visible
                     const cells = cloned.querySelectorAll('td, th')
                     cells.forEach(cell => {
                       cell.style.backgroundColor = '#ffffff'
                       cell.style.color = '#000000'
                       cell.style.border = '1px solid #000000'
                       cell.style.padding = '8px'
                     })
                     
                     // Convert inputs to visible text for PDF capture
                     const inputs = cloned.querySelectorAll('input:not([type="file"]), textarea, select')
                     inputs.forEach(input => {
                       // Get the current value
                       const value = input.value || input.getAttribute('value') || ''
                       
                       if (value) {
                         // Create a span to replace the input
                         const span = clonedDoc.createElement('span')
                         span.textContent = value
                         span.style.display = 'inline-block'
                         span.style.width = '100%'
                         span.style.padding = '6px 8px'
                         span.style.fontFamily = 'Arial, sans-serif'
                         span.style.fontSize = '20px'
                         span.style.fontWeight = '500'
                         span.style.color = '#000000'
                         span.style.backgroundColor = '#ffffff'
                         span.style.border = 'none'
                         span.style.boxSizing = 'border-box'
                         span.style.lineHeight = '1.4'
                         span.style.verticalAlign = 'middle'
                         span.style.webkitFontSmoothing = 'antialiased'
                         span.style.textRendering = 'optimizeLegibility'
                         span.style.whiteSpace = 'pre-wrap'
                         span.style.wordBreak = 'break-word'
                         
                         // Replace input with span
                         input.parentNode.replaceChild(span, input)
                       } else {
                         // If no value, just style the input
                         input.style.backgroundColor = '#ffffff'
                         input.style.color = '#000000'
                         input.style.border = 'none'
                         input.style.opacity = '1'
                         input.style.visibility = 'visible'
                         input.style.display = 'inline-block'
                         input.style.fontFamily = 'Arial, sans-serif'
                         input.style.fontSize = '20px'
                         input.style.fontWeight = '500'
                         input.style.padding = '6px 8px'
                         input.style.width = '100%'
                         input.style.boxSizing = 'border-box'
                         input.style.lineHeight = '1.4'
                         input.style.verticalAlign = 'middle'
                         input.style.webkitFontSmoothing = 'antialiased'
                         input.style.textRendering = 'optimizeLegibility'
                       }
                     })
                     
                     // Make all text elements visible (preserve existing colors)
                     const labels = cloned.querySelectorAll('label, h1, h2, h3, h4, h5, h6, p, span, div')
                     labels.forEach(label => {
                       if (label.style.display === 'none') return
                       // Only set color if not already set
                       if (!label.style.color || label.style.color === 'transparent') {
                         label.style.color = '#000000'
                       }
                       label.style.opacity = '1'
                       label.style.visibility = 'visible'
                     })
                     
                     // Preserve green color for name tags
                     const nameTags = cloned.querySelectorAll('name')
                     nameTags.forEach(name => {
                       if (name.style.display === 'none') return
                       // Keep the green color from inline styles
                       if (!name.style.color) {
                         name.style.color = 'green'
                       }
                       name.style.opacity = '1'
                       name.style.visibility = 'visible'
                     })
                     
                     // Ensure all elements are visible
                     const allElements = cloned.querySelectorAll('*')
                     allElements.forEach(el => {
                       el.style.fontSmoothing = 'antialiased'
                       el.style.webkitFontSmoothing = 'antialiased'
                       if (el.style.display === 'none') return
                       el.style.opacity = '1'
                       el.style.visibility = 'visible'
                     })
                   }
                 },
               })
               
               console.log('Canvas dimensions:', {
                 width: canvas.width,
                 height: canvas.height,
                 expectedPages: Math.ceil(canvas.height / (canvas.width * 1.414))
               })
         
               if (!canvas.width || !canvas.height) {
                 toast.error('Could not capture the report. Please try again.')
                 return
               }
         
               // Create PDF with improved quality settings
               const pdf = new jsPDF({
                 orientation: 'portrait',
                 unit: 'mm',
                 format: 'a4',
                 compress: true,
                 precision: 16
               })
         
               const pageWidth = pdf.internal.pageSize.getWidth()
               const pageHeight = pdf.internal.pageSize.getHeight()
               const margin = 10
               const contentWidthMm = pageWidth - margin * 2
               const contentHeightMm = pageHeight - margin * 2
         
               // Calculate dimensions
               const pxPerMm = canvas.width / contentWidthMm
               const pageSliceHeightPx = Math.floor(contentHeightMm * pxPerMm)
         
               // Create temporary canvas for slicing
               const sliceCanvas = document.createElement('canvas')
               sliceCanvas.width = canvas.width
               const sliceCtx = sliceCanvas.getContext('2d', { alpha: false })
         
               // Helper function to detect if we're cutting through content (table row)
               const findSafeBreakPoint = (startY, idealEndY, canvas) => {
                 const searchRange = 100; // pixels to search up from ideal break point
                 const ctx = canvas.getContext('2d');
                 
                 // Start from ideal break point and search upward for a safe break
                 for (let y = idealEndY; y > idealEndY - searchRange && y > startY + 100; y -= 5) {
                   // Sample pixels across the width to detect blank/white rows
                   const imageData = ctx.getImageData(0, y, canvas.width, 1);
                   const pixels = imageData.data;
                   
                   let isWhiteRow = true;
                   let whitePixelCount = 0;
                   
                   // Check if this row is mostly white (safe to break)
                   for (let i = 0; i < pixels.length; i += 4) {
                     const r = pixels[i];
                     const g = pixels[i + 1];
                     const b = pixels[i + 2];
                     
                     // Consider pixel white if RGB values are high
                     if (r > 250 && g > 250 && b > 250) {
                       whitePixelCount++;
                     }
                   }
                   
                   // If more than 90% of pixels are white, it's a safe break point
                   if (whitePixelCount / (pixels.length / 4) > 0.9) {
                     return y;
                   }
                 }
                 
                 // If no safe point found, return ideal point (fallback)
                 return idealEndY;
               };
         
               // Helper function to check if a page slice is mostly empty/blank
               const isPageEmpty = (canvas, startY, height) => {
                 const ctx = canvas.getContext('2d');
                 const imageData = ctx.getImageData(0, startY, canvas.width, Math.min(height, canvas.height - startY));
                 const pixels = imageData.data;
                 
                 let nonWhitePixels = 0;
                 const totalPixels = pixels.length / 4;
                 
                 // Sample every 10th pixel for performance
                 for (let i = 0; i < pixels.length; i += 40) {
                   const r = pixels[i];
                   const g = pixels[i + 1];
                   const b = pixels[i + 2];
                   
                   // Consider pixel non-white if any RGB value is less than 250
                   if (r < 250 || g < 250 || b < 250) {
                     nonWhitePixels++;
                   }
                 }
                 
                 // If less than 1% of sampled pixels are non-white, consider page empty
                 const sampledPixels = totalPixels / 10;
                 return (nonWhitePixels / sampledPixels) < 0.01;
               };
         
               let renderedHeightPx = 0;
               let pageIndex = 0;
         
               // Slice and add pages with intelligent row detection
               while (renderedHeightPx < canvas.height) {
                 let sliceHeightPx = Math.min(pageSliceHeightPx, canvas.height - renderedHeightPx);
                 
                 // Find safe break point to avoid cutting table rows
                 if (renderedHeightPx + sliceHeightPx < canvas.height) {
                   const safeBreakPoint = findSafeBreakPoint(renderedHeightPx, renderedHeightPx + sliceHeightPx, canvas);
                   sliceHeightPx = safeBreakPoint - renderedHeightPx;
                 }
                 
                 // Check if this page slice is empty before adding it
                 if (isPageEmpty(canvas, renderedHeightPx, sliceHeightPx)) {
                   console.log(`Skipping empty page at position ${renderedHeightPx}`);
                   renderedHeightPx += sliceHeightPx;
                   continue; // Skip this page
                 }
                 
                 sliceCanvas.height = sliceHeightPx;
         
                 // Clear and draw slice
                 sliceCtx.fillStyle = '#ffffff';
                 sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceHeightPx);
                 sliceCtx.drawImage(
                   canvas,
                   0, renderedHeightPx,
                   canvas.width, sliceHeightPx,
                   0, 0,
                   canvas.width, sliceHeightPx
                 );
         
                 // Convert to JPEG with optimized quality (85% - good balance between quality and file size)
                 const imgData = sliceCanvas.toDataURL('image/jpeg', 0.85);
                 const sliceHeightMm = sliceHeightPx / pxPerMm;
         
                 if (pageIndex > 0) pdf.addPage();
                 pdf.addImage(imgData, 'JPEG', margin, margin, contentWidthMm, sliceHeightMm, undefined, 'FAST');
         
                 renderedHeightPx += sliceHeightPx;
                 pageIndex += 1;
               }
         
               console.log('Saving PDF with filename:', pdfFileName)
               console.log('Total pages generated:', pageIndex)
               
               pdf.save(pdfFileName)
               
               console.log('PDF save command executed')
               toast.success(`High-quality PDF downloaded successfully! (${pageIndex} pages)`)
               
               window.scrollTo(prevScrollX, prevScrollY)
             } catch (err) {
               console.error('PDF export failed:', err)
               console.error('Error stack:', err.stack)
               const message =
                 err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error'
               toast.error(`PDF generation failed: ${message}`)
               alert(`PDF Error: ${message}\nCheck console for details`)
             } finally {
               setIsDownloadingPdf(false)
             }
           }
         
           const handleChange = (e) => {
             const target = e.target;
             const { name, type, value, files, checked } = target;
         
             if (!name) return;
         
             if (type === 'file') {
               const file = files?.[0] || null;
               setFormData((prev) => ({ ...prev, [name]: file }));
               return;
             }
         
             if (type === 'checkbox') {
               setFormData((prev) => ({ ...prev, [name]: checked }));
               return;
             }
         
             // Auto-calculate Forced Sale Value (80% of Total Fair Market Value)
             setFormData((prev) => {
               const updated = { ...prev, [name]: value };
         
               // When TotalFairMarketValue changes (for Flat/Shop/Office)
               if (name === 'TotalFairMarketValue') {
                 const totalFairMarketValue = parseFloat(value) || 0;
                 if (totalFairMarketValue > 0) {
                   const forcedSaleValue = totalFairMarketValue * 0.8;
                   updated.ForcedSaleValue = forcedSaleValue.toFixed(2);
                 } else {
                   updated.ForcedSaleValue = '';
                 }
               }
         
               // When TotalFairMarketValues changes (for Independent House/Bungalow)
               if (name === 'TotalFairMarketValues') {
                 const totalFairMarketValues = parseFloat(value) || 0;
                 if (totalFairMarketValues > 0) {
                   const forcedSaleValue = totalFairMarketValues * 0.8;
                   updated.ForcedSaleValue = forcedSaleValue.toFixed(2);
                 } else {
                   updated.ForcedSaleValue = '';
                 }
               }
         
               return updated;
             });
           };
         
           const handleFileChange = (e) => {
             const { name } = e.target;
             const file = e.target.files?.[0];
             if (file) {
               // Convert file to base64 data URL
               const reader = new FileReader();
               reader.onloadend = () => {
                 setFormData((prev) => ({ ...prev, [name]: reader.result }));
               };
               reader.readAsDataURL(file);
             }
           };
         
           const handleDeletePhoto = (photoName) => {
             setFormData((prev) => ({ ...prev, [photoName]: null }));
           };
         
         
           // Extract values from formData
           const nameOfvaluationAgency = formData.nameOfvaluationAgency || '';
           const dateOfTechnicalInitiation = formData.dateOfTechnicalInitiation || '';
           const applicantsName = formData.applicantsName || '';
           const dateOfSiteVisit = formData.dateOfSiteVisit || '';
           const requestFrom = formData.requestFrom || '';
           const dateOfReportRelease = formData.dateOfReportRelease || '';
           const proposalIdApplicationNo = formData.proposalIdApplicationNo || '';
           const transactionType = formData.transactionType || '';
           const requestedFrom = formData.requestedFrom || '';
           const currentOwnerSellerName = formData.currentOwnerSellerName || '';
           const personMetAtSiteName = formData.personMetAtSiteName || '';
           const contactNoForPersonMet = formData.contactNoForPersonMet || '';
           const addressAsPerTRF = formData.addressAsPerTRF || '';
           const addressAsPerLegalDocuments = formData.addressAsPerLegalDocuments || '';
           const addressAsPerActualSite = formData.addressAsPerActualSite || '';
           const documentsProvided = formData.documentsProvided || '';
           const statusHolding = formData.statusHolding || '';
           const deliveryAgency = formData.deliveryAgency || '';
           const typeOfProperty = formData.typeOfProperty || '';
           const stateName = formData.stateName || '';
           const mainLocality = formData.mainLocality || '';
           const subLocality = formData.subLocality || '';
           const Streetonwhichpropertyislocated = formData.Streetonwhichpropertyislocated || '';
           const NearestLandmark = formData.NearestLandmark || '';
           const Pincode = formData.Pincode || '';
           const OccupationStatus = formData.OccupationStatus || '';
           const PropertyUsage = formData.PropertyUsage || '';
           const PropertyIdentifiable = formData.PropertyIdentifiable || '';
           const PropertyDemarcatedSeparatly = formData.PropertyDemarcatedSeparatly || '';
           const PropertyIdentifiedThrough = formData.PropertyIdentifiedThrough || '';
           const CityTownVillage = formData.CityTownVillage || '';
           const RoofConstruction = formData.RoofConstruction || '';
           const TypeOfStructure = formData.TypeOfStructure || '';
           const NoOfFloors = formData.NoOfFloors || '';
           const LocatedOnFloor = formData.LocatedOnFloor || '';
           const ExternalFinishing = formData.ExternalFinishing || '';
           const TypesOfFlooring = formData.TypesOfFlooring || '';
           const PresentAge = formData.PresentAge || '';
           const FuturePhysicalLife = formData.FuturePhysicalLife || '';
           const Latitude = formData.Latitude || '';
           const Longitude = formData.Longitude || '';
           const InfrastructureInArea = formData.InfrastructureInArea || '';
           const ClassOfLocality = formData.ClassOfLocality || '';
           const TypeOfRoad = formData.TypeOfRoad || '';
           const WidthOfRoad = formData.WidthOfRoad || '';
           const Propertyareaiscommunitydominatedare = formData.Propertyareaiscommunitydominatedare || '';
          
           const DistanceFromBusStop = formData.DistanceFromBusStop || '';
           const DistanceFromMainMarket = formData.DistanceFromMainMarket || '';
           const DistanceFromRailwayStation = formData.DistanceFromRailwayStation || '';
           const PropertyFallsUnderSeismicZone = formData.PropertyFallsUnderSeismicZone || '';
           const PropertyFallsUnderFloodZone = formData.PropertyFallsUnderFloodZone || '';
           const PropertyfallsunderfloodZone = formData.PropertyfallsunderfloodZone || '';
           const PropertyFallsUnderCycloneZone = formData.PropertyFallsUnderCycloneZone || '';
           const PropertyFallsInCRZone = formData.PropertyFallsInCRZone || '';
           const DegreeOfRiskAssociated = formData.DegreeOfRiskAssociated || '';
           const AnyRiskOfDemolition = formData.AnyRiskOfDemolition || '';
           const BoundariesMatching = formData.BoundariesMatching || '';
           const ReasonForNonMatching = formData.ReasonForNonMatching || '';
           const LegalAreaEast = formData.LegalAreaEast || '';
           const LegalAreaWest = formData.LegalAreaWest || '';
           const LegalAreaNorth = formData.LegalAreaNorth || '';
           const LegalAreaSouth = formData.LegalAreaSouth || '';
           const LegalTotalArea = formData.LegalTotalArea || '';
           const ActualAreaEast = formData.ActualAreaEast || '';
           const ActualAreaWest = formData.ActualAreaWest || '';
           const ActualAreaNorth = formData.ActualAreaNorth || '';
           const ActualAreaSouth = formData.ActualAreaSouth || '';
           const ActualTotalArea = formData.ActualTotalArea || '';
           const Floor = formData.Floor || '';
           const Accommodation = formData.Accommodation || '';
           const CarpetAreaSanctioned = formData.CarpetAreaSanctioned || '';
           const CarpetAreaSite = formData.CarpetAreaSite || '';
           const PermissibleArea = formData.PermissibleArea || '';
           const AdoptedArea = formData.AdoptedArea || '';
           const LayoutplanDetails = formData.LayoutplanDetails || '';
           const BuildingSanctionApprovedPlanDetails = formData.BuildingSanctionApprovedPlanDetails || '';
           const CommencementCertificate = formData.CommencementCertificate || '';
           const CompletionCertificate = formData.CompletionCertificate || '';
           const OtherDocuments = formData.OtherDocuments || '';
           const OwnershipDocuments = formData.OwnershipDocuments || '';
           const PropertyOwner = formData.PropertyOwner || '';
           const IfPlansNotAvailable = formData.IfPlansNotAvailable || '';
           const LandPlotArea = formData.LandPlotArea || '';
           const AdoptableBuiltUpArea = formData.AdoptableBuiltUpArea || '';
           const ConstructionCost = formData.ConstructionCost || '';
           const RecommendedRate = formData.RecommendedRate || '';
           const Totalvalue = formData.Totalvalue || '';
           const TotalConstructionValue = formData.TotalConstructionValue || '';
           const SpecialAmenities = formData.SpecialAmenities || '';
           const SpecialsAmenities = formData.SpecialsAmenities || '';
           const AdditionalCosts = formData.AdditionalCosts || '';
           const AdditionalsCost = formData.AdditionalsCost || '';
           const TotalLandValue = formData.TotalLandValue || '';
           const TotalFairMarketValue = formData.TotalFairMarketValue || '';
           const TotalFairMarketValues = formData.TotalFairMarketValues || '';
           const TotalFairMarketValuePresent = formData.TotalFairMarketValuePresent || '';
           const TotalRealizableValue = formData.TotalRealizableValue || '';
           const TotalForcedDistressedValue = formData.TotalForcedDistressedValue || '';
           const TotalForcedDistressedValuePresent = formData.TotalForcedDistressedValuePresent || '';
           const TotalForcedDistressedValuePresents = formData.TotalForcedDistressedValuePresents || '';
           const TotalForcedDistressedValuecomplete = formData.TotalForcedDistressedValuecomplete || '';
         
           
           const SBUA = formData.SBUA || '';
           const AdoptedRate = formData.AdoptedRate || '';
           const TotalValue = formData.TotalValue || '';
           
           const TotalForcedDistressedValuecompletes = formData.TotalForcedDistressedValuecompletes || '';
           const TotalRealizableValuePresents = formData.TotalRealizableValuePresents || '';
           const TotalRealizableValuePresent = formData.TotalRealizableValuePresent || '';
           
           const PercentageCompletion = formData.PercentageCompletion || '';
           const RecommendedConstructionValue = formData.RecommendedConstructionValue || '';
           const GovernmentGuidelineLand = formData.GovernmentGuidelineLand || '';
           const LandValue = formData.LandValue || '';
           const GovernmentGuidelineFlat = formData.GovernmentGuidelineFlat || '';
           const FlatValue = formData.FlatValue || '';
           const ForcedSaleValue = formData.ForcedSaleValue || '';
           const AverageRental = formData.AverageRental || '';
           const RealizableValue = formData.RealizableValue || '';
           const remark1 = formData.remark1 || '';
           const remark2 = formData.remark2 || '';
           const remark3 = formData.remark3 || '';
           const remark4 = formData.remark4 || '';
           const remark5 = formData.remark5 || '';
         
           return (
             <div className={styles.container}>
               {/* Debug Info */}
               {Object.keys(formData).length === 0 && (
                 <div style={{
                   backgroundColor: '#fff3cd',
                   border: '2px solid #ffc107',
                   padding: '20px',
                   margin: '20px 0',
                   borderRadius: '8px',
                   color: '#856404'
                 }}>
                   <h2 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ No Form Data Received</h2>
                   <p style={{ margin: '5px 0', color: '#856404' }}>
                     The form was submitted without any data. Please go back and fill out the form before submitting.
                   </p>
                   <p style={{ margin: '5px 0', fontSize: '14px', color: '#856404' }}>
                     Debug: formData has {Object.keys(formData).length} fields
                   </p>
                 </div>
               )}
               
               <div className={styles.downloadSection}>
                 <button
                   onClick={handleSaveReport}
                   disabled={isSaving}
                   className={styles.saveBtn}
                   style={{
                     marginRight: '10px',
                     backgroundColor: '#28a745',
                     color: 'white',
                     padding: '12px 24px',
                     border: 'none',
                     borderRadius: '6px',
                     fontSize: '16px',
                     fontWeight: '600',
                     cursor: isSaving ? 'not-allowed' : 'pointer',
                     opacity: isSaving ? 0.6 : 1
                   }}
                 >
                   {isSaving ? 'Saving...' : savedReportId ? 'Update Report' : 'Save Final Report Draft'}
                 </button>
                 <button
                   onClick={handleDownloadPdf}
                   disabled={isDownloadingPdf}
                   className={styles.downloadBtn}
                 >
                   {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
                 </button>
               </div>
               <div
                 ref={reportRef}
                 data-pdf-root="ausmallfinance"
                 style={{
                   position: 'relative',
                   ...(formData.firmBackgroundLogo && {
                     backgroundImage: `url(${formData.firmBackgroundLogo})`,
                     backgroundPosition: 'center center',
                     backgroundRepeat: 'no-repeat',
                     backgroundSize: '50%',
                     backgroundAttachment: 'fixed'
                   })
                 }}
               >
                 {formData.firmBackgroundLogo && (
                   <div style={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     width: '100%',
                     height: '100%',
                     zIndex: 0,
                     pointerEvents: 'none',
                     overflow: 'hidden',
                     backgroundImage: `url(${formData.firmBackgroundLogo})`,
                     backgroundPosition: 'center center',
                     backgroundRepeat: 'no-repeat',
                     backgroundSize: '50%',
                     opacity: 0.15,
                     filter: 'blur(3px)'
                   }} />
                 )}
                 <table>
                   <caption style={{
                     backgroundColor: 'white',
                     padding: '0',
                     border: '1px'
                   }}>
                     {/* Double Border Frame - Outer */}
                     <div style={{
                       border: '2px solid black',
                       padding: '8px',
                       backgroundColor: 'white'
                     }}>
                       {/* Double Border Frame - Inner */}
                       <div style={{
                         border: '4px solid black',
                         padding: '20px',
                         backgroundColor: 'white'
                       }}>
                         <div style={{
                           padding: '20px 20px',
                           background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                           borderRadius: '8px',
                           marginBottom: '15px',
                           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                         }}>
                          <div style={{ textAlign: 'right', marginTop: '-40px' }}>
                           <h1 style={{
                             textAlign:'right',
                             color: '#024606',
                             padding:'3px 20px',
                             margin: '0 0 5px 0',
                             fontSize: '84px',
                             fontWeight: 'bold',
                             letterSpacing: '2px',
                             textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                             fontFamily: 'Georgia, serif',
                             textTransform: 'uppercase',
                             verticalAlign: 'top',
                             textDecoration: 'none'
                           }}>SHRIKRISHNA</h1>
                    
                          </div>
                                 <img
                             src={logopng}
                             alt="Logo"
                             style={{
                               marginTop: '-170px',
         
                               float: 'left',
                               top: '0',
                               left: 'auto',
                               right: '20px',
                               width: '350px',
                               height: '390px',
                               objectFit: 'contain',
                               border: 'none',
                               outline: 'none',
                               display: 'block',
                               zIndex: '1',
         
                             }}
                           />
                          <div style={{ textAlign: 'right',marginTop:'-5px', marginBottom: '10px' }}>
                           <h2 style={{
                             color: '#024606',
                             margin: '4px 0',
                             fontSize: '84px',
                             fontWeight: 'normal',
                             letterSpacing: '2px',
                             textTransform: 'uppercase',
                             display: 'inline-block',
                             padding: '3px 30px',
                             borderRadius: '4px',
                             verticalAlign: 'bottom',
                             textDecoration: 'none'
                           }}>CONSULTANCY</h2>
                          </div>
                         </div>
                         <div style={{ textAlign: 'right', marginTop: '-2px', lineHeight: '1.6' }}>
                           <name style={{
                             color: 'green',
                             display: 'block',
                             margin: '7px 0',
                             fontSize:'25px',
                             padding:'3px 30px',
                             textDecoration: 'none'
                           }}>ENGG.PANKAJ SUDAM BAGUL B.E.CIVIL</name>
                           <name style={{
                             color: 'green',
                             display: 'block',
                             margin: '5px 0',
                             fontSize:'25px',
                             padding:'3px 30px',
                             textDecoration: 'none'
                           }}>REG.NO.NSK/CCT/34AB/PSB/337/42/CT-|/2020-2021</name>
                           <name style={{
                             color: 'green',
                             display: 'block',
                             margin: '5px 0',
                             fontSize:'22px',
                             padding:'3px 30px',
                             textDecoration: 'none',
                             textTransform: 'uppercase',
                             whiteSpace: 'nowrap'
                           }}>E-MAIL-SHRIKRISHNACONSULTANCY210@GMAIL.COM</name>
                           <name style={{
                             color: 'green',
                             display: 'block',
                             margin: '5px 0',
                             fontSize:'25px',
                             padding:'3px 30px',
                             textDecoration: 'none'
                           }}>MB.NO.7276113770</name>
                         </div>
                        
                         
                       </div>
                     </div>
                   </caption>
                   <tr><th> <label for="nameOfvaluationAgency">Name of valuation Agency :</label></th>
                     <th colSpan="2"><input list="Name of valuation Agency" name='nameOfvaluationAgency' id='nameOfvaluationAgency' value={nameOfvaluationAgency} onChange={handleChange} />
                       <datalist id="Name of valuation Agency">
                         <option value="Vishal">Vishal</option>
                         <option value="Vivek">Vivek</option>
                       </datalist> </th>
                     <th><label for='dateOfTechnicalInitiation'>Date of Technical Initiation :</label></th>
                     <th colSpan="2"><input type='text' name='dateOfTechnicalInitiation' id='dateOfTechnicalInitiation' value={dateOfTechnicalInitiation} onChange={handleChange}></input></th></tr>
         
                   <tr> <th><label for='applicantsName'>Applicant/s Name/s :</label></th>
                     <th colSpan="2"><input type='text' name='applicantsName' id='applicantsName' value={applicantsName} onChange={handleChange}></input></th>
                     <th><label for='dateOfSiteVisit'>Date of Site Visit :</label></th>
                     <th colSpan="2"><input type='text' name='dateOfSiteVisit' id='dateOfSiteVisit' value={dateOfSiteVisit} onChange={handleChange}></input></th></tr>
         
                   <tr> <th ><label for='requestFrom'>Request from :</label></th>
                     <th colSpan="2"><input type='text' name='requestFrom' id='requestFrom' value={requestFrom} onChange={handleChange}></input></th>
         
                     <th ><label for='dateOfReportRelease'>Date of Report release :</label></th>
                     <th colSpan="2"><input type='text' name='dateOfReportRelease' id='dateOfReportRelease' value={dateOfReportRelease} onChange={handleChange}></input></th></tr>
         
                   <tr> <th ><label for='proposalIdApplicationNo'>Proposal ID/Application No :</label></th>
                     <th colSpan="2"><input type='text' name='proposalIdApplicationNo' id='proposalIdApplicationNo' value={proposalIdApplicationNo} onChange={handleChange}></input></th>
                     <th><label for='transactionType'>Transaction type :</label></th>
         
                     <th colSpan="2"><input type='text' name='transactionType' id='transactionType' value={transactionType} onChange={handleChange}></input><br></br></th></tr>
         
                   <tr> <th><label for='branchNameId'>Branch name/ID :</label></th>
                     <th colSpan="2"><input type='text' name='branchNameId' id='branchNameId' value={formData.branchNameId ?? ''} onChange={handleChange}></input></th>
                     <th><label for='requestedFrom'>Requested From :</label></th>
                     <th colSpan="2"><input type='text' name='requestedFrom' id='requestedFrom' value={requestedFrom} onChange={handleChange}></input><br></br></th></tr>
         
         
                   <tr> <th><label for='currentOwnerSellerName'>Name of Current Owner/Seller :</label></th>
                     <th colSpan="2"><input type='text' name='currentOwnerSellerName' id='currentOwnerSellerName' value={currentOwnerSellerName} onChange={handleChange}></input></th>
                     <th><label for='personMetAtSiteName'>Name of the person met at a site :</label></th>
                     <th colSpan="2"><input type='text' name='personMetAtSiteName' id='personMetAtSiteName' value={personMetAtSiteName} onChange={handleChange}></input><br></br></th>
                   </tr>
         
         
                   <th><label for='contactNoForPersonMet'>Contact No for person met :</label></th>
                   <th colSpan="5"><input type='number' name='contactNoForPersonMet' id='contactNoForPersonMet' value={contactNoForPersonMet} onChange={handleChange}></input></th>
         
                   <tr>
                     <th colSpan="6"><name>BASIC DEATAILS :</name></th>
                   </tr>
         
                   <tr>
                     <th colSpan="6"><name>Adress of the property being appraised :</name></th>
                   </tr>
         
                   <tr>
                     <th ><label for='addressAsPerTRF'>Address As per TRF :</label></th>
                     <th colSpan="5"><input type='text' name='addressAsPerTRF' id='addressAsPerTRF' value={addressAsPerTRF} onChange={handleChange}></input><br></br></th>
                   </tr>
         
                   <tr>
                     <th> <label for='addressAsPerLegalDocuments'>Address as per Legal documenst :</label></th>
                     <th colSpan="5"> <input type='text' name='addressAsPerLegalDocuments' id='addressAsPerLegalDocuments' value={addressAsPerLegalDocuments} onChange={handleChange}></input><br></br></th></tr>
         
                   <tr>
                     <th ><label for='addressAsPerActualSite'>Address as per actual at site :</label></th>
                     <th colSpan="5"><input type='text' name='addressAsPerActualSite' id='addressAsPerActualSite' value={addressAsPerActualSite} onChange={handleChange}></input></th>
                   </tr>
         
                   <tr>
                     <th><label for='documentsProvided'>Documents as Provided :</label></th>
                     <th colSpan="5"><input type='text' name='documentsProvided' id='documentsProvided' value={documentsProvided} onChange={handleChange}></input><br></br></th></tr>
      
         
                   <tr>
         
                     <th><label for="Status Holding">Status Holding :</label></th>
                     <th colSpan="2"><input list="Status Holding" name='statusHolding' id='statusHolding' value={statusHolding} onChange={handleChange} />
                       <datalist id="Status Holding">
                         <option value="Free Hold"></option>
                         <option value="Lease Holding"></option>
                       </datalist></th>
         
                     <th><label for='deliveryAgency'>Delivery Agency :</label></th>
                     <th colSpan="2"><input type='text' name='deliveryAgency' id='deliveryAgency' value={deliveryAgency} onChange={handleChange}></input><br></br></th>
                   </tr>
                     
                    
                    <tr > 
                     <th><label for='TypeofProperty'>Type of Property :                                                         </label></th>
                     <th colSpan="2"><input list="TypeofProperty" name='typeOfProperty' id='typeOfProperty' value={typeOfProperty} onChange={handleChange} />
                       <datalist id='TypeofProperty'>
                         <option value="Flat"></option>
                         <option value="Bungalow"></option>
                         <option value="Row House"></option>
                         <option value="Duplex"></option>
                         <option value="Shop"></option>
                         <option value="Godown"></option>
                         <option value="Office"></option>
                         <option value="Industrial"></option>
                         <option value="Plot"></option>
                         <option value="Under-Construction"></option>
                       </datalist></th>
         
                     <th><label for="stateName">Name of the state :</label></th>
                     <th colSpan="2"><input list="State" name='stateName' id='stateName' value={stateName} onChange={handleChange} />
                       <datalist id="StateName">
                         <option value="Maharashtra"></option>
                       </datalist><br></br></th>
                   </tr>
                   
                    <tr style={{height:120}} className={styles.noBorder} > <td></td></tr>
         
                   <tr>
         
                     <th><label for="mainLocality">Main Locality :</label></th>
                     <th colSpan="2"><input list="Locality" name='mainLocality' id='mainLocality' value={mainLocality} onChange={handleChange} />
                       <datalist id="Locality">
                         <option value="Nashik"></option>
                       </datalist></th>
         
                     <th><label for='subLocality'>Sub-Locality :</label></th>
                     <th colSpan="2"><input list="Sub-Locality" name='subLocality' id='subLocality' value={subLocality} onChange={handleChange} />
                       <datalist id="Sub-Locality">
                         <option value="Nashik"></option>
                       </datalist><br></br></th></tr>
         
                       
         
                   <tr><th><label for='Streetonwhichpropertyislocated'>Street on which property is located :</label></th>
                     <th colSpan="2"><input type='text' name='Streetonwhichpropertyislocated' id='Streetonwhichpropertyislocated' value={Streetonwhichpropertyislocated} onChange={handleChange}></input></th>
                     <th><label for='NearestLandmark'>Nearest Landmark :</label></th>
                     <th colSpan="2"><input type='text' name='NearestLandmark' id='NearestLandmark' value={NearestLandmark} onChange={handleChange}></input></th></tr>
                   
                   <tr><th><label for='Pincode'>Pincode :</label></th>
                     <th colSpan="2"><input type='number' name='Pincode' id='Pincode' value={Pincode} onChange={handleChange}></input></th>
         
                     <th><label for='OccupationStatus'>Occupation Status :</label></th>
                     <th colSpan="2"><input list="Occupation Status" name='OccupationStatus' id='OccupationStatus' value={OccupationStatus} onChange={handleChange} />
                       <datalist id='Occupation Status'>
                         <option value='Fully'></option>
                         <option value='Partly'></option>
                         <option value='Vacant'></option>
                         <option value='Under-Construction'></option>
                       </datalist></th></tr>
         
                   <tr><th><label for='Locality/zoningtypeasperLatestDevelopmentMasterPlan'>Locality/zoning type as per Latest Development Master Plan :</label></th>
                     <th colSpan="2"><input list="Locality/zoning type as per Latest Development Master Plan" name='Locality/zoning typeasperLatestDevelopmentMasterPlan' id='Locality/zoningtypeasperLatestDevelopmentMasterPlan' value={formData['Locality/zoning typeasperLatestDevelopmentMasterPlan'] ?? formData.LocalityzoningtypeasperLatestDevelopmentMasterPlan ?? ''} onChange={handleChange} />
                       <datalist id="Locality/zoning type as per Latest Development Master Plan">
                         <option value="Residential"></option>
                         <option value="Industrial"></option>
                         <option value="Commercial"></option>
                         <option value="Agriculture"></option>
                       </datalist></th>
         
                     <th><label htmlFor="PropertyUsage">Property Usage :</label></th>
                     <th colSpan="2">
                       <input list="PropertyUsageList" name='PropertyUsage' id='PropertyUsage' value={PropertyUsage} onChange={handleChange} />
                       <datalist id="PropertyUsageList">
                         <option value="Residential">Residential</option>
                         <option value="Shop">Shop</option>
                         <option value="Gowdown">Gowdown</option>
                         <option value="Office">Office</option>
                         <option value="Industrial">Industrial</option>
                         <option value="Plot">Plot</option>
                         <option value="Commercial">Commercial</option>
                       </datalist>
                     </th></tr>
         
                   <tr><th><label htmlFor='PropertyIdentifiable'>Property Identifiable :</label></th>
                     <th colSpan="2">
                       <input list="PropertyIdentifiableList" name='PropertyIdentifiable' id='PropertyIdentifiable' value={PropertyIdentifiable} onChange={handleChange} />
                       <datalist id="PropertyIdentifiableList">
                         <option value='Yes'>Yes</option>
                         <option value='No'>No</option>
                       </datalist>
                     </th>
         
                     <th><label htmlFor='PropertyDemarcatedSeparatly'>Property Demarcated Separatly :</label></th>
                     <th colSpan="2">
                       <input list="PropertyDemarcatedSeparatlyList" name='PropertyDemarcatedSeparatly' id='PropertyDemarcatedSeparatly' value={PropertyDemarcatedSeparatly} onChange={handleChange} />
                       <datalist id="PropertyDemarcatedSeparatlyList">
                         <option value="Yes">Yes</option>
                         <option value="No">No</option>
                       </datalist>
                       <br></br>
                     </th></tr>
         
                   <tr><th><label for='PropertyIdentifiedThrough'>Property Identified through :</label></th>
                     <th colSpan="2"><input list='Property Identified Through' name='PropertyIdentifiedThrough' id='PropertyIdentifiedThrough' value={PropertyIdentifiedThrough} onChange={handleChange}/>
                       <datalist id='Property Identified Through'>
                         <option value='Person met at Site'></option>
                       </datalist></th>
         
                     <th><label for='name'>Name of City/Town/Village :</label></th>
                     <th colSpan="2"><input type='text' name='CityTownVillage' id='CityTownVillage' value={CityTownVillage} onChange={handleChange}></input><br></br></th>
                   </tr>
         
                   <tr><th> <label for="Roof Construction">Roof Construction :</label></th>
                     <th colSpan="2"><input list="Roof Construction" name='RoofConstruction' id='RoofConstruction' value={RoofConstruction} onChange={handleChange}/>
                       <datalist id="Roof Construction">
                         <option value="RCC"></option>
                         <option value="Load Bearing"></option>
                         <option value="Under-Construction"></option>
                       </datalist></th>
         
                     <th><label for="Type of Structure">Type of Structure :</label></th>
                     <th colSpan="2"><input list="Type of Structure" name='TypeOfStructure' id='TypeOfStructure' value={TypeOfStructure} onChange={handleChange} />
                       <datalist id="Type of Structure">
                         <option value="RCC"></option>
                         <option value="Load Bearing"></option>
                         <option value="Steel Structure with bricks wall And AC Sheet roofing"></option>
                       </datalist><br></br></th></tr>
         
                   <tr><th><label htmlFor="NoOfFloors">No.of Floors in the Building :</label></th>
                     <th colSpan="2">
                       <input list='NoOfFloors' name='NoOfFloors' id='NoOfFloors' value={NoOfFloors} onChange={handleChange}/>
                         <datalist id="NoOfFloors">
                         <option value="Ground + one">Ground + one</option>
                         <option value="Ground + two">Ground + two</option>
                         <option value="Ground + Three">Ground + Three</option>
         
                       </datalist></th>
         
                     <th><label htmlFor='LocatedOnFloor'>Located on Floor No. :</label></th>
                     <th colSpan="2"><input type='number' name='LocatedOnFloor' id='LocatedOnFloor' value={LocatedOnFloor} onChange={handleChange}></input><br></br></th></tr>
         
         
                   <tr><th><label htmlFor="ExternalFinishing">External Finishing :</label></th>
                     <th colSpan="2">
                       <input list="ExternalFinishingList" name='ExternalFinishing' id='ExternalFinishing' value={ExternalFinishing} onChange={handleChange} />
                       <datalist id="ExternalFinishingList">
                         <option value="Average">Average</option>
                         <option value="Fair">Fair</option>
                         <option value="Good">Good</option>
                         <option value="Very Good">Very Good</option>
                         <option value="Under-Construction">Under-Construction</option>
                       </datalist>
                     </th>
         
         
                     <th><label htmlFor="TypesOfFlooring">Types of flooring :</label></th>
                     <th colSpan="2">
                       <input list="TypesOfFlooringList" name='TypesOfFlooring' id='TypesOfFlooring' value={TypesOfFlooring} onChange={handleChange} />
                       <datalist id="TypesOfFlooringList">
                         <option value="Vitrified">Vitrified</option>
                         <option value="Granite">Granite</option>
                         <option value="Marble">Marble</option>
                         <option value="Italian Marble Flooring">Italian Marble Flooring</option>
                         <option value="Mosaic tile">Mosaic tile</option>
                         <option value="Kota">Kota</option>
                       </datalist>
                       <br></br>
                     </th></tr>
         
                   <tr><th><label htmlFor='PresentAge'>Present Age of the property in yrs :</label></th>
                     <th colSpan="2"><input type='number' name='PresentAge' id='PresentAge' value={PresentAge} onChange={handleChange}></input></th>
         
                     <th><label htmlFor='FuturePhysicalLife'>Future Physical Life of property in yrs :</label></th>
                     <th colSpan="2"><input type='number' name='FuturePhysicalLife' id='FuturePhysicalLife' value={FuturePhysicalLife} onChange={handleChange}></input><br></br></th></tr>
         
                   <tr><th><label for='name'>Latitude :</label></th>
                     <th colSpan="2"><input type='text' name='Latitude' id='Latitude' value={Latitude} onChange={handleChange}></input></th>
         
                     <th><label for='name'>Longitude :</label></th>
                     <th colSpan="2"><input type='text' name='Longitude' id='Longitude' value={Longitude} onChange={handleChange}></input><br></br></th></tr>
         
                   <tr><th><label for="Infrastructureinthearea">Infrastructure in the area :</label></th>
                     <th colSpan="2"><input list="Infrastructure in the area" name='InfrastructureInArea' id='InfrastructureInthearea' value={InfrastructureInArea} onChange={handleChange} />
                       <datalist id="Infrastructure in the area">
                         <option value="Average"></option>
                         <option value="Fair"></option>
                         <option value="Good"></option>
                         <option value="Very Good"></option>
                         <option value="Under Developed"></option>
                       </datalist></th>
         
                     <th><label for="ClassofLocality">Class of Locality :</label></th>
                     <th colSpan="2"><input list="Class of Locality" name='ClassOfLocality' id='ClassOfLocality' value={ClassOfLocality} onChange={handleChange} />
                       <datalist id="Class of Locality">
                         <option value="High-end Class"></option>
                         <option value="Upper-Mid-end Class"></option>
                         <option value="Mid-end Class"></option>
                         <option value="Lower Class"></option>
                       </datalist><br></br></th></tr>
         
                   <tr><th><label for="TypeofRoad">Type of Road :</label></th>
                     <th colSpan="2"><input list="Type of Road" name='TypeOfRoad' id='TypeOfRoad' value={TypeOfRoad} onChange={handleChange}/>
                       <datalist id="Type of Road">
                         <option value="Cocreat"></option>
                         <option value="Tar"></option>
                         <option value="WBM"></option>
                         <option value="Pandhan Road"></option>
                       </datalist></th>
         
                     <th><label for="Width of Road(Fit)">Width of Road :(Fit)</label></th>
                     <th colSpan="2"><input list="Width of Road(Fit)" name='WidthOfRoad' id='WidthOfRoad' value={WidthOfRoad} onChange={handleChange} />
                       <datalist id="Width of Road(Fit)">
                         <option value="5 feet"></option>
                         <option value="10 Feet"></option>
                         <option value="15 fett"></option>
                         <option value="20 feet"></option>
                       </datalist><br></br></th></tr>
      
         
                   <tr><th><label htmlFor="Propertyareaiscommunitydominatedare">Property Area is community dominated are:</label></th>
                     <th colSpan="2">
                       <input list="PropertyareaiscommunitydominatedareList" name='Propertyareaiscommunitydominatedare' id='Propertyareaiscommunitydominatedare' value={Propertyareaiscommunitydominatedare} onChange={handleChange} />
                       <datalist id="PropertyareaiscommunitydominatedareList">
                         <option value="Yes">Yes</option>
                         <option value="No">No</option>
                       </datalist>
                     </th>
         
                     <th><label htmlFor='DistanceFromBusStop'>Distance from Bus Stop(KM) :</label></th>
                     <th colSpan="2"><input type='text' name='DistanceFromBusStop' id='DistanceFromBusStop' value={DistanceFromBusStop} onChange={handleChange}></input><br></br></th>
                   </tr>
         
                   <tr><th><label for='name'>Distance from Main Market(KM) :</label></th>
                     <th colSpan="2"><input type='text' name='DistanceFromMainMarket' id='DistanceFromMainMarket' value={DistanceFromMainMarket}onChange={handleChange}></input></th>
         
                     <th><label for='name'>Distance from Railway Station(KM) :</label></th>
                     <th colSpan="2"> <input type='text' name='DistanceFromRailwayStation' id='DistanceFromRailwayStation' value={DistanceFromRailwayStation}onChange={handleChange}></input><br></br></th></tr>
         
                   <tr><th><label for="PropertyfallsunderSeismicZone:">Property falls under Seismic Zone :    </label></th>
                     <th colSpan="2"><input list="Property falls under Seismic Zone:" name='PropertyFallsUnderSeismicZone' id='PropertyFallsUnderSeismicZone' value={PropertyFallsUnderSeismicZone} onChange={handleChange}/>
                       <datalist id="Property falls under Seismic Zone:">
                         <option value="Zone III"></option>
                       </datalist></th>
         
                     <th><label for="PropertyFallsUnderFloodZone">Property falls Under Flood Zone :</label></th>
                     <th colSpan="2"><input list="Property falls Under Flood Zone" name='PropertyFallsUnderFloodZone' id='PropertyFallsUnderFloodZone' value={PropertyFallsUnderFloodZone} onChange={handleChange}/>
                       <datalist id="Property falls Under Flood Zone">
                         <option value="Yes"></option>
                         <option value="No"></option>
                       </datalist></th>
                   </tr>
                  
                   <tr><th><label for='PropertyFallsUnderCycloneZone'>Property falls under Cyclone Zone :
                   </label></th><th colSpan="2"><input list='Property Falls Under Cyclone Zone' name='PropertyFallsUnderCycloneZone' id='PropertyFallsUnderCycloneZone' value={PropertyFallsUnderCycloneZone} onChange={handleChange} />
                       <datalist id="Property falls Under Cyclone Zone">
                         <option value="Yes"></option>
                         <option value="No"></option>
                       </datalist></th>
         
                     <th><label for='PropertyFallsInCRZone'>Property falls in CR Zone :</label></th>
                     <th colSpan="2"><input list='Property Falls In CR Zone' name='PropertyFallsInCRZone' id='PropertyFallsInCRZone' value={PropertyFallsInCRZone} onChange={handleChange}/>
                       <datalist id="Property falls Under CR Zone">
                         <option value="Yes"></option>
                         <option value="No"></option>
                       </datalist></th>
                   </tr>
      
                     <tr style={{height:150}} className={styles.noBorder} > <td></td></tr>  
         
                   <tr><th><label for="Degree of Risk Associated">Degree of Risk Associated :</label></th>
                     <th colSpan="2"><input list="Degree of Risk Associated" name='DegreeOfRiskAssociated' id='DegreeOfRiskAssociated' value={DegreeOfRiskAssociated} onChange={handleChange} />
                       <datalist id="Degree of Risk Associated">
                         <option value="Low"></option>
                         <option value="High"></option>
                       </datalist></th>
         
                     <th><label for="AnyriskofDemolition">Any risk of Demolition :</label></th>
                     <th colSpan="2"><input list="Any risk of Demolition" name='AnyRiskOfDemolition' id='AnyRiskOfDemolition' value={AnyRiskOfDemolition} onChange={handleChange} />
                       <datalist id="Any risk of Demolition">
                         <option value="Low"></option>
                         <option value="High"></option>
                       </datalist><br></br></th></tr>
         
                       
                   <tr><th colSpan="6"><name>BOUNDARIES :</name></th></tr>
                   <tr><th colSpan="6"><name>Boundaries of Building/Apartment :</name></th></tr>
                   
                   <tr className={styles.colwidth} ><th><name>Direction</name></th>
                     <th ><name>East</name></th>
                     <th ><name>West</name></th>
                     <th ><name>North</name></th>
                     <th colSpan='2' ><name>South</name></th></tr>
         
                   <tr> <th><name>As per Documents/Plan : </name></th>
                     <td ><input for='East' type="text" placeholder='' id='East' className={styles.input} /></td>
                     <td > <input type="text" placeholder='' className={styles.input} /></td>
                     <td ><input type="text" placeholder='' className={styles.input} /></td>
                     <td colSpan='2'><input type="text" placeholder='' className={styles.input} /></td></tr>
         
                   <tr><th><name>Actual at site :</name></th>
                     <td ><input type="text" placeholder='' className={styles.input} /></td>
                     <td ><input type="text" placeholder='' className={styles.input} /></td>
                     <td ><input type="text" placeholder='' className={styles.input} /></td>
                     <td colSpan='2'><input type="text" placeholder='' className={styles.input} /></td></tr>
         
                     
         
                   <tr><td> <label htmlFor='BoundariesMatching'>Boundaries Matching :</label></td>
                     <th colSpan="1"><input list='Boundaries Matching' type='text' name='BoundariesMatching' id='BoundariesMatching' value={BoundariesMatching} onChange={handleChange} />
                       <datalist id="Boundaries Matching">
                         <option value="Yes"></option>
                         <option value="No"></option>
                       </datalist></th>
         
                     <td><label htmlFor='ReasonForNonMatching'>If No,then reason theron :</label></td>
                     <th colSpan="3"> <input type='text' name='ReasonForNonMatching' id='ReasonForNonMatching' value={ReasonForNonMatching} onChange={handleChange}></input></th></tr>
         
         
                   <tr><td colSpan="6"><name>Plot dimension details (In Ft) for Independent Built up :</name></td></tr>
         
                   <tr> <th><name>Direction :</name></th>
                     <th><name>East</name></th>
                     <th><name>West</name></th>
                     <th><name>North</name></th>
                     <th><name>South</name></th>
                     <th><name>Total Area in Sqft</name></th></tr>
         
                   <tr>
                     <th><name>Legal Area as per Docs in Sfqt :</name></th>
                     <td><input type="text" name='LegalAreaEast' id='LegalAreaEast' value={LegalAreaEast} placeholder='' className={styles.input} onChange={handleChange} /></td>
                     <td><input type="text" name='LegalAreaWest' id='LegalAreaWest' value={LegalAreaWest} placeholder='' className={styles.input} onChange={handleChange} /></td>
                     <td><input type="text" name='LegalAreaNorth' id='LegalAreaNorth' value={LegalAreaNorth} placeholder='' className={styles.input} onChange={handleChange}/></td>
         
                     <td><input type="text" name='LegalAreaSouth' id='LegalAreaSouth' value={LegalAreaSouth} placeholder='' className={styles.input}  onChange={handleChange} /></td>
                     <td><input type="text" name='LegalTotalArea' id='LegalTotalArea' value={LegalTotalArea} placeholder='' className={styles.input}  onChange={handleChange}/></td>
                   </tr>
         
         
                   <tr> <th><name>Actual Area at site in Sqft :</name></th>
                     <td><input type="text" name='ActualAreaEast' id='ActualAreaEast' value={ActualAreaEast} placeholder='' className={styles.input}  onChange={handleChange}/></td>
                     <td><input type="text" name='ActualAreaWest' id='ActualAreaWest' value={ActualAreaWest} placeholder='' className={styles.input} onChange={handleChange} /></td>
                     <td><input type="text" name='ActualAreaNorth' id='ActualAreaNorth' value={ActualAreaNorth} placeholder='' className={styles.input}  onChange={handleChange} /></td>
                     <td><input type="text" name='ActualAreaSouth' id='ActualAreaSouth' value={ActualAreaSouth} placeholder='' className={styles.input}  onChange={handleChange}/></td>
                     <td><input type="text" name='ActualTotalArea' id='ActualTotalArea' value={ActualTotalArea} placeholder='' className={styles.input}  onChange={handleChange} /></td>
                   </tr>
                   
                   <tr><td colSpan="6"><name>Area & Accommodation Details :</name></td></tr>
         
                   <tr>
                     <th style={{width: '200px'}}> <name>Floor</name></th>
                     <th style={{width: '200px'}}> <name>Accommodation</name></th>
                     <th style={{width: '200px'}}><name>Carpet Area in sq.ft.As per Sanctioned Plan</name></th>
                     <th style={{width: '200px'}}><name>Carpet Area in sq.ft.As per Site Measurements</name></th>
                     <th style={{width: '200px'}}>  <name>Permissible/plan Area in sq.ft.</name></th>
                     <th style={{width: '200px'}}> <name>Adopted Area in sq.ft.</name></th>
                   </tr>
                   <tr>
                     <th> <input type="text" name='FloorGround' id='FloorGround' value={formData.FloorGround ?? ''} onChange={handleChange} placeholder='Ground Floor' className={styles.input} /></th>
                     <th> <input type="text" name='AccommodationGround' id='AccommodationGround' value={formData.AccommodationGround ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></th>
                     <td> <input type="text" name='CarpetAreaSanctionedGround' id='CarpetAreaSanctionedGround' placeholder='' value={formData.CarpetAreaSanctionedGround ?? ''} onChange={handleChange} className={styles.input} /></td>
                     <td> <input type="text" name='CarpetAreaSiteGround' id='CarpetAreaSiteGround' placeholder='' value={formData.CarpetAreaSiteGround ?? ''} onChange={handleChange} className={styles.input} /></td>
                     <td> <input type="text" name='PermissibleAreaGround' id='PermissibleAreaGround' placeholder='' value={formData.PermissibleAreaGround ?? ''} onChange={handleChange} className={styles.input} /></td>
                     <td> <input type="text" name='AdoptedAreaGround' id='AdoptedAreaGround' value={formData.AdoptedAreaGround ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                   </tr>
         
                   <tr>
                     <td><input type="text" name='FloorFirst' id='FloorFirst' value={formData.FloorFirst ?? ''} onChange={handleChange} placeholder='First Floor' className={styles.input} /></td>
                     <td><input type="text" name='AccommodationFirst' id='AccommodationFirst' value={formData.AccommodationFirst ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='CarpetAreaSanctionedFirst' id='CarpetAreaSanctionedFirst' value={formData.CarpetAreaSanctionedFirst ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='CarpetAreaSiteFirst' id='CarpetAreaSiteFirst' value={formData.CarpetAreaSiteFirst ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='PermissibleAreaFirst' id='PermissibleAreaFirst' value={formData.PermissibleAreaFirst ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='AdoptedAreaFirst' id='AdoptedAreaFirst' value={formData.AdoptedAreaFirst ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                   </tr>
         
                   <tr>
                     <td><input type="text" name='FloorSecond' id='FloorSecond' value={formData.FloorSecond ?? ''} onChange={handleChange} placeholder='Second Floor' className={styles.input} /></td>
                     <td><input type="text" name='AccommodationSecond' id='AccommodationSecond' value={formData.AccommodationSecond ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='CarpetAreaSanctionedSecond' id='CarpetAreaSanctionedSecond' value={formData.CarpetAreaSanctionedSecond ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='CarpetAreaSiteSecond' id='CarpetAreaSiteSecond' value={formData.CarpetAreaSiteSecond ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='PermissibleAreaSecond' id='PermissibleAreaSecond' value={formData.PermissibleAreaSecond ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='AdoptedAreaSecond' id='AdoptedAreaSecond' value={formData.AdoptedAreaSecond ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                   </tr>
                   <tr>
                     <td><input type="text" name='FloorThird' id='FloorThird' value={formData.FloorThird ?? ''} onChange={handleChange} placeholder='Third Floor' className={styles.input} /></td>
                     <td><input type="text" name='AccommodationThird' id='AccommodationThird' value={formData.AccommodationThird ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='CarpetAreaSanctionedThird' id='CarpetAreaSanctionedThird' value={formData.CarpetAreaSanctionedThird ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='CarpetAreaSiteThird' id='CarpetAreaSiteThird' value={formData.CarpetAreaSiteThird ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='PermissibleAreaThird' id='PermissibleAreaThird' value={formData.PermissibleAreaThird ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='AdoptedAreaThird' id='AdoptedAreaThird' value={formData.AdoptedAreaThird ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                   </tr>
         
                   <tr>
                     <td><input type="text" name='FloorFourth' id='FloorFourth' value={formData.FloorFourth ?? ''} onChange={handleChange} placeholder='Fourth Floor' className={styles.input} /></td>
                     <td><input type="text" name='AccommodationFourth' id='AccommodationFourth' value={formData.AccommodationFourth ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='CarpetAreaSanctionedFourth' id='CarpetAreaSanctionedFourth' value={formData.CarpetAreaSanctionedFourth ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='CarpetAreaSiteFourth' id='CarpetAreaSiteFourth' value={formData.CarpetAreaSiteFourth ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='PermissibleAreaFourth' id='PermissibleAreaFourth' value={formData.PermissibleAreaFourth ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                     <td><input type="text" name='AdoptedAreaFourth' id='AdoptedAreaFourth' value={formData.AdoptedAreaFourth ?? ''} onChange={handleChange} placeholder='' className={styles.input} /></td>
                   </tr>
         
                   <tr><td ><label htmlFor='Total-Loading%onCarpetArea+BalconyArea+DryBalconey'>Total-Loading % on Carpet Area +Balcony Area+Dry Balconey :</label></td>
                     <td colSpan="2"><input type='text' name='Total-Loading%onCarpetArea+BalconyArea+DryBalconey' id='Total-Loading%onCarpetArea+BalconyArea+DryBalconey' value={formData['Total-Loading%onCarpetArea+BalconyArea+DryBalconey'] ?? ''} onChange={handleChange}></input></td>
         
                     <td ><label htmlFor='TotalAreaWithLoading'>Total Area with Loading (Sq/ft) :</label></td>
                     <td colSpan="2"><input type='text' name='TotalAreaWithLoading' id='TotalAreaWithLoading' value={formData.TotalAreaWithLoading ?? ''} onChange={handleChange}></input></td>
                   </tr>
                   
         
                   <tr><th colSpan="6"><name>Building Approvals & Related Documents :</name></th></tr>
         
                   <tr><td><name>Documents Name :</name></td>
                     <td colSpan="5"><name>Document Value :</name></td></tr>
         
                   <tr><td> <label htmlFor='LayoutplanDetails'>Layout plan Details :</label></td>
                     <td colSpan="5"><input type='text' name='LayoutplanDetails' id='LayoutplanDetails' value={LayoutplanDetails} onChange={handleChange}></input><br></br></td></tr>
         
                     
         
                   <tr><th><label htmlFor='BuildingSanctionApprovedPlanDetails'>Building sanction/Approved Plan Details :</label></th>
                     <th colSpan="5"><input type='text' name='BuildingSanctionApprovedPlanDetails' id='BuildingSanctionApprovedPlanDetails' value={BuildingSanctionApprovedPlanDetails} onChange={handleChange}></input><br></br></th></tr>
      
                      <tr style={{height:90}} className={styles.noBorder} > <td></td></tr>
         
                   <tr><th > <label htmlFor='CommencementCertificate'>Commencement Certificate :</label></th>
                     <th colSpan="5"><input type='text' name='CommencementCertificate' id='CommencementCertificate' value={CommencementCertificate} onChange={handleChange}></input></th></tr>
         
                   
         
                   <tr><th><label htmlFor='CompletionCertificate'>Completion Certificate/Occupation Certificate No./BCC :</label></th>
                     <th colSpan="5"><input type='text' name='CompletionCertificate' id='CompletionCertificate' value={CompletionCertificate} onChange={handleChange}></input><br></br></th></tr>
         
                   <tr><th><label htmlFor='OtherDocuments'>Other Documents :</label></th>
                     <th colSpan="5"><input type='text' name='OtherDocuments' id='OtherDocuments' value={OtherDocuments} onChange={handleChange}></input><br></br></th></tr>
         
                   <tr> <td><label htmlFor='OwnershipDocuments'>Ownership Documents :</label></td>
                     <td colSpan="5"><input type='text' name='OwnershipDocuments' id='OwnershipDocuments' value={OwnershipDocuments} onChange={handleChange}></input><br></br></td></tr>
         
                   <tr><th><label htmlFor='PropertyOwner'>Property Owner as per Document :</label></th>
                     <th colSpan="5"> <input type='text' name='PropertyOwner' id='PropertyOwner' value={PropertyOwner} onChange={handleChange}></input><br></br></th></tr>
                     
         
                   <tr><th><label for="isthepropertywithinmunicipalLimit">is the property within municipal Limit'</label></th>
                     <th colSpan="5"><input list="is the property within municipal Limit" name='isthepropertywithinmunicipalLimit' id='isthepropertywithinmunicipalLimit' value={formData.isthepropertywithinmunicipalLimit ?? ''} onChange={handleChange} />
                       <datalist id="is the property within municipal Limit">
                         <option value="">Yes</option>
                         <option value="">No</option>
                       </datalist><br></br></th></tr>
         
                   <tr><th> <label htmlFor='IfPlansNotAvailable'>if plans not available whether the structure confirming to the local byelaws :</label></th>
                     <th colSpan="5"><input type='text' name='IfPlansNotAvailable' id='IfPlansNotAvailable' value={IfPlansNotAvailable} onChange={handleChange}></input><br></br></th></tr>
         
         
                   <tr><th colSpan="6"><name> Property Valuation :</name></th></tr>
                   <tr><th colSpan="6"><name>Valuation of independent House/Bungalow</name></th></tr>
         
                   <tr><th><label htmlFor='LandPlotArea'>Land/plot Area(in Sq.ft.) :</label></th>
                     <th colSpan="2"> <input type='text' name='LandPlotArea' id='LandPlotArea' value={LandPlotArea} onChange={handleChange}></input></th>
         
                     <th><label htmlFor='AdoptableBuiltUpArea'>Adoptable Built-up Area(in Sq.ft.) :</label></th>
                     <th colSpan="2"><input type='text' name='AdoptableBuiltUpArea' id='AdoptableBuiltUpArea' value={AdoptableBuiltUpArea} onChange={handleChange}></input><br></br></th></tr>
         
                   <tr><th><label htmlFor='RateRangeofinthelocality(RSpersq.ft.)'>Rate Range of in the locality(RS per sq.ft.) :</label></th>
                     <th colSpan="2"><input type='text' name='RateRangeofinthelocality(RSpersq.ft.)' id='RateRangeofinthelocality(RSpersq.ft.)' value={formData['RateRangeofinthelocality(RSpersq.ft.)'] ?? formData.RateRangeofinthelocality ?? ''} onChange={handleChange}></input></th>
         
                     <th><label htmlFor='ConstructionCost'>Construction Cost (per sq.ft) :</label></th>
                     <th colSpan="2"><input type='text' name='ConstructionCost' id='ConstructionCost' value={ConstructionCost} onChange={handleChange}></input><br></br></th></tr>
         
         
         
                   <tr><th><label htmlFor='RecommendedRate'>Recommended Rate Rate of Lade(per sq.ft) :</label></th>
                     <td colSpan="2"><input type='text' name='RecommendedRate' id='RecommendedRate' value={RecommendedRate} onChange={handleChange}></input></td>
                     <td><label htmlFor='Totalvalue'>Total Construction Value for 100% complete building (in Rs)  :</label></td>
                     <td colSpan="2"> <input type='text' name='Totalvalue' id='Totalvalue' value={Totalvalue} onChange={handleChange}></input><br></br></td></tr>
         
                   <tr><th><label htmlFor='SpecialAmenities'>pls specify if any Special Amenities Provided(in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='SpecialAmenities' id='SpecialAmenities' value={SpecialAmenities} onChange={handleChange}/></th>
                     
                     <th><label htmlFor='AdditionalCosts'>Additional Cost incurred for Amenities Charges(in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='AdditionalCosts' id='AdditionalCosts' value={AdditionalCosts} onChange={handleChange}></input><br></br></th></tr>
         
         
                   <tr><th><label for='name'>Total Land Value(in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='TotalLandValue' id='TotalLandValue' value={TotalLandValue}  onChange={handleChange}></input></th>
                     <th><label for='name'>Total Construction Value at present construction stage(in Rs) :</label></th>
                     <th colSpan="2"><input type='text' name='TotalConstructionValue' id='TotalConstructionValue' value={TotalConstructionValue} onChange={handleChange}></input><br></br></th></tr>
      
         
                   <tr><th><label for='TotalFairMarketValues'>Total fair Market Value at 100% completions(in Rs) :</label></th>
                     <th colSpan="2"><input type='text' name='TotalFairMarketValues' id='TotalFairMarketValues' value={TotalFairMarketValues} onChange={handleChange}></input></th>
      
                      
                     <th><label for='name'>Total Realizable Value on present completion stage(in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='TotalRealizableValue' id='TotalRealizableValue' value={TotalRealizableValue} onChange={handleChange}></input><br></br></th></tr>
         
                    <tr style={{height:90}} className={styles.noBorder} > <td></td></tr>               
         
                   <tr><th><label for='name'>Total Forced/Distressed Value at 100% completion(in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='TotalForcedDistressedValue' id='TotalForcedDistressedValue' value={TotalForcedDistressedValue}onChange={handleChange}></input></th>
                     <th><label for='name'>Total Forced/Distressed Value on present completion stage(in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='TotalForcedDistressedValuePresent' id='TotalForcedDistressedValuePresent' value={TotalForcedDistressedValuePresent}onChange={handleChange}></input><br></br></th></tr>
         
                     
         
                   <tr><th colSpan="6"><name>Valuvation of flat/shop/office/industrial/other unit etc :</name></th></tr>
                   <tr><td><label htmlFor='SBUA'>SBUA(SFT) :</label></td>
                     <td colSpan="2"><input type='text' name='SBUA' id='SBUA' value={SBUA} onChange={handleChange}></input></td>
                     <td><label htmlFor='AdoptedRate'>Adopted rate(in per sq.ft) :</label></td>
                     <td colSpan="2"> <input type='text' name='AdoptedRate' id='AdoptedRate' value={AdoptedRate} onChange={handleChange}></input><br></br></td></tr>
         
                   <tr><th><label for='name'>Total Value of flat/shop/flat/office on 100% Complete(in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='TotalValue' id='TotalValue' value={TotalValue} onChange={handleChange}></input></th>
                     
                     <th><label for='name'>Additional Cost incurred for amenities(in Rs) :</label></th>
                     <th colSpan="2"><input type='text' name='AdditionalsCost' id='AdditionalCost' value={AdditionalsCost} onChange={handleChange}></input></th></tr>
         
                    <tr> <th><label for='name'>Total fair Market Value at 100% completion (in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='TotalFairMarketValue' id='TotalFairMarketValue' value={TotalFairMarketValue} onChange={handleChange}></input><br></br></th>
                     <th><label htmlFor='TotalFairMarketValuePresent'>Total Fair Market Value on present completion stage (in Rs) (SFT) :</label></th>
                     <th colSpan="2"><input type='text' name='TotalFairMarketValuePresent' id='TotalFairMarketValuePresent' value={TotalFairMarketValuePresent} onChange={handleChange}></input><br></br></th></tr>
                     
         
                   <tr><th> <label for='name'>Total Realizable Value at 100% completion stage(in Rs) :</label></th>
                     <th colSpan="2"><input type='text' name='TotalRealizableValuePresents' id='TotalRealizableValuePresents' value={TotalRealizableValuePresents}onChange={handleChange}></input></th>
                      <th><label for='name'>Total Realizable Value on present completion stage(in Rs) :</label></th>
                     <th colSpan="2"><input type='text' name='TotalRealizableValuePresent' id='TotalRealizableValuePresent' value={TotalRealizableValuePresent}onChange={handleChange}></input><br></br></th>
                     </tr>
         
                   <tr><th><label for='TotalForcedDistressedValuecomplete'>Total Forced/Distressed Value at 100%  completion stage(in Rs) :</label></th>
                     <th colSpan="2"> <input type='text' name='TotalForcedDistressedValuecomplete' id='TotalForcedDistressedValuecomplete' value={TotalForcedDistressedValuecomplete}onChange={handleChange}></input></th>
         
                     <th><label for='name'>Total Forced/Distressed Value on present completion stage(in Rs) :</label></th>
                     <th colSpan="2"><input type='text' name='TotalForcedDistressedValuePresents' id='TotalForcedDistressedValuePresents' value={TotalForcedDistressedValuePresents}onChange={handleChange}></input><br></br></th>
                     </tr>
                     
                   <tr><th colSpan="6"><name>Stage of Construction :</name></th></tr>
         
                   <tr><th><label for='name'>% Completion :</label></th>
                     <th colSpan="2"> <input type='text' name='PercentageCompletion' id='PercentageCompletion' value={PercentageCompletion}onChange={handleChange}></input></th>
                     <th><label for='name'>Recommended Construction Value :</label></th>
                     <th colSpan="2"><input type='text' name='RecommendedConstructionValue' id='RecommendedConstructionValue' value={RecommendedConstructionValue}onChange={handleChange}></input><br></br></th></tr>
         
                   <tr><th colSpan="6"><name>Guideline & Distress/Forced sale Value :</name></th></tr>
                   <tr colSpan="2"> <th><label for='name'>government Guideline/ Circle rate for Land ( Rate in sq ft.only) :</label></th>
                     <th colSpan="2"> <input type='text' name='GovernmentGuidelineLand' id='GovernmentGuidelineLand' value={GovernmentGuidelineLand}onChange={handleChange}></input></th>
                     <th><label for='name'>Land Value as per Goverment Rate(Rs) :</label></th>
                     <th colSpan="2"><input type='text' name='LandValue' id='LandValue' value={LandValue} onChange={handleChange}></input><br></br></th></tr>
         
                    
         
                   <tr><th><label for='name'>government Guideline/ Circle rate for flate/unit/Built Up(RS) ( Rate in sq ft.only) :</label></th>
                     <th colSpan="2"> <input type='text' name='GovernmentGuidelineFlat' id='GovernmentGuidelineFlat' value={GovernmentGuidelineFlat}onChange={handleChange}></input></th>
                     <th><label for='name'>Flat/Unit/Built up Value as per Goverment Rate (Rs per sq.ft.) :</label></th>
                     <th colSpan="2"><input type='text' name='FlatValue' id='FlatValue' value={FlatValue}onChange={handleChange}></input><br></br></th></tr>
         
         
                   <tr><th><label for='name'>Forced Sale Value(In Rs)(80%) :</label></th>
                     <th colSpan="2"> <input type='text' name='ForcedSaleValue' id='ForcedSaleValue' value={ForcedSaleValue}onChange={handleChange}></input></th>
                     <th><label for='name'>Avg Rental per sqft(in Rs) :</label ></th>
                     <th colSpan="2"> <input type='text' name='AverageRental' id='AverageRental' value={AverageRental} onChange={handleChange}></input><br></br></th></tr>
         
         
                   <tr><th> <label for='name'>Realizable value(in Rs) :</label></th>
                     <th colSpan="5"> <input type='text' name='RealizableValue' id='RealizableValue' value={RealizableValue}onChange={handleChange}></input></th></tr>
                     
                     <tr style={{height:100}} className={styles.noBorder} > <td></td></tr>
         
                   <tr><th colSpan="6"><name>Remarks/Observation :</name></th></tr>
                   <tr>
                     <th><label htmlFor="Remark1">Remark 1 :</label></th>
                     <th colSpan={5}>
                       <input
                         type="text"
                         id="Remark1"
                         name="remark1"
                         list="Remark1List"
                         value={remark1}
                         onChange={handleChange}
                       />
                       <datalist id="Remark1List">
                         <option value="Subjected property 2BHK Residential flat in floor No 2" />
                         <option value="Address - " />
                         <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                         <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                         <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                       </datalist>
                       <br />
                     </th>
                   </tr>
                   <tr>
                     <th><label htmlFor="Remark2">Remark 2 :</label></th>
                     <th colSpan={5}>
                       <input
                         type="text"
                         id="Remark2"
                         name="remark2"
                         list="Remark2List"
                         value={remark2}
                         onChange={handleChange}
                       />
                       <datalist id="Remark2List">
                         <option value="Subjected property 2BHK Residential flat in floor No 2" />
                         <option value="Address - " />
                         <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                         <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                         <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                       </datalist>
                       <br />
                     </th>
                   </tr>
                   <tr>
                     <th><label htmlFor="Remark3">Remark 3 :</label></th>
                     <th colSpan={5}>
                       <input
                         type="text"
                         id="Remark3"
                         name="remark3"
                         list="Remark3List"
                         value={remark3}
                         onChange={handleChange}
                       />
                       <datalist id="Remark3List">
                         <option value="Subjected property 2BHK Residential flat in floor No 2" />
                         <option value="Address - " />
                         <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                         <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                         <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                       </datalist>
                       <br />
                     </th>
                   </tr>
                   <tr>
                     <th><label htmlFor="Remark4">Remark 4 :</label></th>
                     <th colSpan={5}>
                       <input
                         type="text"
                         id="Remark4"
                         name="remark4"
                         list="Remark4List"
                         value={remark4}
                         onChange={handleChange}
                       />
                       <datalist id="Remark4List">
                         <option value="Subjected property 2BHK Residential flat in floor No 2" />
                         <option value="Address - " />
                         <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                         <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                         <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                       </datalist>
                       <br />
                     </th>
                   </tr>
                   <tr>
                     <th><label htmlFor="Remark5">Remark 5 :</label></th>
                     <th colSpan={5}>
                       <input
                         type="text"
                         id="Remark5"
                         name="remark5"
                         list="Remark5List"
                         value={remark5}
                         onChange={handleChange}
                       />
                       <datalist id="Remark5List">
                         <option value="Subjected property 2BHK Residential flat in floor No 2" />
                         <option value="Address - " />
                         <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                         <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                         <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                       </datalist>
                       <br />
                     </th>
                   </tr>
         
         
                   <tr><td> <name>Declartion :</name></td>
                     <td colSpan="5"><p>i/We hereby declare that Our Representive Mr.Vishal Jadhav Physically Inspected the  property.
                       We have no direct or indirect interest in the unit valued.
                       the information furnished above is true and correct to the best of our Knowledge and belif and takes into account information and our document submitted or shown to us by the client.the client is free to obtain other independant opninons on the same.
                       No Responsibility Is taken for any False Statement,Misrepresentation or Submission Made in the Documents Submitted or for Fraudulent Documents Submitted bye the borrower/representative/developer/institute.
                       Market Value/Fair Market Value is derived In this Report by considering All Attributes In the Locality Which adeversely affects the Markeability.
                       of the property and value is Derived Basis on Banks/FI Policies and Norms.
                       This report is released soley for intended Banks/FI,and the content of this report is confidential in the nature and for internal use only.The recipient of this report should not
                       disclose this report to any external party and should be strictly used for lending/investing purposes.
                       Legal aspects are beyond the scope of this valuation exercise.
                       Valuation Approach:Market Approach of valuation has been adopted for finding out the fair market value of the subject property.
                     </p><br></br></td></tr>
         
                   <tr><td><name>Disclaimer :</name></td>
                     <td colSpan="5"><p>This report is prepared for based on the documents furnished and/or the condition of the property as prevailed at the time of our visit for Yes Bank. The report provides an indicative market value of the property in our opinion which may not necessarily reflect the guideline value. Cost of construction is estimated based on our opinion on prevailing market rates at the time of our visit. Builtup area considered for valuation in this report at presumed FSI basis revised allowable FSI Limits considered by NIDO Home Finance. Quality of construction is assessed based on the visual and corroborative evidence obtained at site during our visit. Measurement of the property is made to the extent reasonably possible considering the limitations at site. This report does not certify the ownership of the property. The ownership details shall be referred from the legal due diligence report.
                       Report isvalidfor 90 days from the date of visit or report.
                     </p> </td></tr>
                    
                    <tr style={{height:720}} className={styles.noBorder} > <td></td></tr>
         
                   <tr>
                    
                     <td colSpan="6">
                       <name>{formData.Uploadphotosatelitemap_label || 'Satellite Map'}:</name>
                       {formData.Uploadphotosatelitemap ? (
                         <div>
                           <img
                             src={formData.Uploadphotosatelitemap}
                             alt={formData.Uploadphotosatelitemap_label || 'Satellite Map'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('Uploadphotosatelitemap')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='Uploadphotosatelitemap'>Upload photo satelite map:</label>
                           <input type='file' name='Uploadphotosatelitemap' id='Uploadphotosatelitemap' onChange={handleFileChange} />
                         </>
                       )}
                       <br />
                     </td>
                     
                   </tr>
                 
                 <tr style={{height:250}} className={styles.noBorder} > <td></td></tr>
         
                   <tr><td colSpan="6"><name>PHOTOGRAPHS OF PROPERTY:</name></td></tr>
         
                   <tr>
                     <td colSpan="3">
                       <name>{formData.UploadphotoHall_label || 'Hall'}:</name>
                       {formData.UploadphotoHall ? (
                         <div>
                           <img
                             src={formData.UploadphotoHall}
                             alt={formData.UploadphotoHall_label || 'Hall'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoHall')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoHall'>Upload photo Hall:</label>
                           <input type='file' name='UploadphotoHall' id='UploadphotoHall' onChange={handleFileChange} />
                         </>
                       )}
                     </td>
                     <td colSpan="3">
                       <name>{formData.UploadphotoKichen_label || 'Kitchen'}:</name>
                       {formData.UploadphotoKichen ? (
                         <div>
                           <img
                             src={formData.UploadphotoKichen}
                             alt={formData.UploadphotoKichen_label || 'Kitchen'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoKichen')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoKichen'>Upload photo Kitchen:</label>
                           <input type='file' name='UploadphotoKichen' id='UploadphotoKichen' onChange={handleFileChange} />
                         </>
                       )}
                     </td>
                   </tr>
         
                   <tr>
                     <td colSpan="3">
                       <name>{formData.UploadphotoBedroom_label || 'Bedroom'}:</name>
                       {formData.UploadphotoBedroom ? (
                         <div>
                           <img
                             src={formData.UploadphotoBedroom}
                             alt={formData.UploadphotoBedroom_label || 'Bedroom'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoBedroom')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoBedroom'>Upload photo Bedroom:</label>
                           <input type='file' name='UploadphotoBedroom' id='UploadphotoBedroom' onChange={handleFileChange} />
                         </>
                       )}
                     </td>
                     <td colSpan="3">
                       <name>{formData.UploadphotoOtherRoom_label || 'Other Room'}:</name>
                       {formData.UploadphotoOtherRoom ? (
                         <div>
                           <img
                             src={formData.UploadphotoOtherRoom}
                             alt={formData.UploadphotoOtherRoom_label || 'Other Room'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoOtherRoom')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoOtherRoom'>Upload photo other room:</label>
                           <input type='file' name='UploadphotoOtherRoom' id='UploadphotoOtherRoom' onChange={handleFileChange} />
                         </>
                       )}
                     </td>
                   </tr>
                   
                   <tr style={{height:750}} className={styles.noBorder} > <td></td></tr>
         
                   <tr>
                     <th colSpan="3">
                       <name>{formData.UploadphotoOtherPhoto_label || 'Other Photo'}:</name>
                       {formData.UploadphotoOtherPhoto ? (
                         <div>
                           <img
                             src={formData.UploadphotoOtherPhoto}
                             alt={formData.UploadphotoOtherPhoto_label || 'Other Photo'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoOtherPhoto')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoOtherPhoto'>Upload photo other photo:</label>
                           <input type='file' name='UploadphotoOtherPhoto' id='UploadphotoOtherPhoto' onChange={handleFileChange} />
                         </>
                       )}
                     </th>
         
                     <th colSpan="3">
                       <name>{formData.UploadphotoExternalPhoto_label || 'External Photo'}:</name>
                       {formData.UploadphotoExternalPhoto ? (
                         <div>
                           <img
                             src={formData.UploadphotoExternalPhoto}
                             alt={formData.UploadphotoExternalPhoto_label || 'External Photo'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoExternalPhoto')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoExternalPhoto'>Upload photo external photo:</label>
                           <input type='file' name='UploadphotoExternalPhoto' id='UploadphotoExternalPhoto' onChange={handleFileChange} />
                         </>
                       )}
                     </th>
                   </tr>
         
                   <tr>
                     <th colSpan="3">
                       <name>{formData.UploadphotoFrontSite_label || 'Front Site'}:</name>
                       {formData.UploadphotoFrontSite ? (
                         <div>
                           <img
                             src={formData.UploadphotoFrontSite}
                             alt={formData.UploadphotoFrontSite_label || 'Front Site'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoFrontSite')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoFrontSite'>Upload photo front site:</label>
                           <input type='file' name='UploadphotoFrontSite' id='UploadphotoFrontSite' onChange={handleFileChange} />
                         </>
                       )}
                     </th>
                     
                      
                     <th colSpan="3">
                       <name>{formData.UploadphotoRoadSite_label || 'Road Site'}:</name>
                       {formData.UploadphotoRoadSite ? (
                         <div>
                           <img
                             src={formData.UploadphotoRoadSite}
                             alt={formData.UploadphotoRoadSite_label || 'Road Site'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoRoadSite')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoRoadSite'>Upload photo road site:</label>
                           <input type='file' name='UploadphotoRoadSite' id='UploadphotoRoadSite' onChange={handleFileChange} />
                         </>
                       )}
                     </th>
                   </tr>
                   
                  <tr style={{height:850}} className={styles.noBorder} > <td></td></tr>
         
                   <tr>
                     <th colSpan="3">
                       <name>{formData.UploadphotoSelfieWithProperty_label || 'Selfie with Property'}:</name>
                       {formData.UploadphotoSelfieWithProperty ? (
                         <div>
                           <img
                             src={formData.UploadphotoSelfieWithProperty}
                             alt={formData.UploadphotoSelfieWithProperty_label || 'Selfie with Property'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoSelfieWithProperty')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoSelfieWithProperty'>Upload photo selfie with property:</label>
                           <input type='file' name='UploadphotoSelfieWithProperty' id='UploadphotoSelfieWithProperty' onChange={handleFileChange} />
                         </>
                       )}
                     </th>
                     <th colSpan="3">
                       <name>{formData.UploadphotoSelfieWithPerson_label || 'Selfie with Person'}:</name>
                       {formData.UploadphotoSelfieWithPerson ? (
                         <div>
                           <img
                             src={formData.UploadphotoSelfieWithPerson}
                             alt={formData.UploadphotoSelfieWithPerson_label || 'Selfie with Person'}
                             style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                           />
                           <button
                             type="button"
                             onClick={() => handleDeletePhoto('UploadphotoSelfieWithPerson')}
                             className={styles.deletePhotoButton}
                           >
                             Delete Photo
                           </button>
                         </div>
                       ) : (
                         <>
                           <label htmlFor='UploadphotoSelfieWithPerson'>Upload photo selfie with person met at property:</label>
                           <input type='file' name='UploadphotoSelfieWithPerson' id='UploadphotoSelfieWithPerson' onChange={handleFileChange} />
                         </>
                       )}
                     </th>
                   </tr>
         
                 </table>
               </div>
             </div>
           )
        }