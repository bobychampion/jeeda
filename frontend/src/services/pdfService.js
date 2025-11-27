// Client-side PDF generation using jsPDF
// Install: npm install jspdf

let jsPDF;
let loaded = false;

const loadJsPDF = async () => {
  if (loaded) return;
  
  try {
    const module = await import('jspdf');
    jsPDF = module.default;
    loaded = true;
  } catch (error) {
    console.error('Error loading jsPDF:', error);
    throw new Error('PDF library not available');
  }
};

/**
 * Generate order instructions PDF
 * @param {Object} order - Order object
 */
export const generateInstructionsPDF = async (order) => {
  await loadJsPDF();
  
  const doc = new jsPDF();
  
  // Add content
  doc.setFontSize(20);
  doc.text('Assembly Instructions', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Order ID: ${order.orderId || order.id}`, 20, 40);
  
  let yPosition = 60;
  
  order.items?.forEach((item, index) => {
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${item.name || 'Item'}`, 20, yPosition);
    yPosition += 10;
    
    if (item.color) {
      doc.setFontSize(10);
      doc.text(`   Color: ${item.color}`, 25, yPosition);
      yPosition += 8;
    }
    
    if (item.material) {
      doc.setFontSize(10);
      doc.text(`   Material: ${item.material}`, 25, yPosition);
      yPosition += 8;
    }
    
    yPosition += 5;
    
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  doc.setFontSize(10);
  doc.text('Please follow the included assembly instructions carefully.', 20, yPosition + 10);
  doc.text('If you have any questions, please contact our support team.', 20, yPosition + 20);
  
  // Save PDF
  doc.save(`order-${order.id || order.orderId}-instructions.pdf`);
};

