import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Generate PDF Invoice for an order
export const generateInvoicePdf = async (order) => {
  const doc = new jsPDF();

  const formatCurrency = (num) =>
    Number(num) % 1 === 0 ? Number(num).toString() : Number(num).toFixed(2);

  // Load and add logo
  const logoUrl = "/Logo-2.png"; // from public folder
  const logoImage = await loadImageAsBase64(logoUrl);
  doc.addImage(logoImage, "PNG", 14, 10, 30, 20); // x, y, width, height

  // Title
  doc.setFontSize(18);
  doc.setTextColor("#1976d2");
  doc.text("Order Invoice", 105, 20, { align: "center" });

  // Order Info
  doc.setFontSize(12);
  doc.setTextColor("#000000");
  const startY = 35;

  doc.text(`Order ID: ${order._id}`, 14, startY);
  doc.text(`Customer: ${order.user?.name || "N/A"}`, 14, startY + 8);
  doc.text(`Status: ${order.status}`, 14, startY + 16);

  // Table Rows
  const productRows = order.products.map((item, i) => [
    `${i + 1}`,
    item.name,
    `${item.quantity}`,
    formatCurrency(item.pricePerUnit),
    formatCurrency(item.subtotal),
  ]);

  // Add table with footer for total
  autoTable(doc, {
    startY: startY + 28,
    head: [["#", "Product", "Qty", "Price", "Subtotal"]],
    body: productRows,
    foot: [["", "", "", "Total:", formatCurrency(order.totalAmount)]],
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: "#ffffff",
      fontSize: 11,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 10,
      textColor: "#000000",
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: "#000000",
      fontStyle: "bold",
      fontSize: 11,
    },
    styles: {
      cellPadding: 3,
    },
    columnStyles: {
      2: { halign: "center" }, // Qty
      3: { halign: "center" }, // Price
      4: { halign: "center" }, // Subtotal (and also footer total)
    },
  });

  // Save
  doc.save(`invoice-${order._id}.pdf`);
};

// Utility: Convert image from public folder to base64
async function loadImageAsBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
