export const downloadOrderReceipt = async (order) => {
  if (!order) return

  const { jsPDF } = await import('jspdf')
  const shortOrderId = order._id.substring(order._id.length - 8).toUpperCase()
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const primaryColor = [235, 94, 40] // #eb5e28 (Flame)
  const darkColor = [37, 36, 34]    // #252422 (Obsidian)
  const greyColor = [64, 61, 57]    // #403d39 (Charcoal)

  // Header Band
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2])
  doc.rect(0, 0, 210, 45, 'F')

  // Brand Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('STAT', 20, 26)

  doc.setFontSize(22)
  doc.setTextColor(255, 252, 242)
  doc.text('SURGICAL SUPPLIES', 48, 26)

  // Subtitle
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(204, 197, 185)
  doc.text('CLINICAL INVENTORY SYSTEM & OFFICIAL PURCHASE RECEIPT', 20, 36)

  // Accent Line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setLineWidth(1)
  doc.line(0, 45, 210, 45)

  // Title
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('TAX INVOICE / PURCHASE RECEIPT', 20, 60)

  // General Metadata
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])
  doc.text(`Order Reference: #${shortOrderId}`, 20, 68)
  doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}`, 20, 74)
  doc.text(`Payment: ${order.paymentMethod === 'cod' ? 'COD' : 'RAZORPAY'} (${order.paymentStatus?.toUpperCase()})`, 130, 68)
  doc.text(`Delivery Status: ${order.shippingStatus?.toUpperCase()}`, 130, 74)

  // Horizontal Divider
  doc.setDrawColor(204, 197, 185)
  doc.setLineWidth(0.2)
  doc.line(20, 80, 190, 80)

  // 1. Client & Delivery Details Section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('CLIENT & SHIPPING DETAILS', 20, 89)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text('Client Name:', 20, 96)
  doc.setFont('helvetica', 'bold')
  doc.text((order.user?.name || 'Guest Customer').toUpperCase(), 68, 96)

  doc.setFont('helvetica', 'normal')
  doc.text('Email Address:', 20, 102)
  doc.setFont('helvetica', 'bold')
  doc.text((order.user?.email || 'N/A').toLowerCase(), 68, 102)

  doc.setFont('helvetica', 'normal')
  doc.text('Shipping Address:', 20, 108)
  doc.setFont('helvetica', 'bold')
  
  const addr = order.shippingAddress
  let addressLine1 = ''
  let addressLine2 = ''
  if (addr && addr.doorNumber) {
    addressLine1 = `${addr.doorNumber}, ${addr.secondLine || ''}`.trim()
    addressLine2 = `${addr.landmark ? `Landmark: ${addr.landmark}, ` : ''}${addr.city}, ${addr.state} - ${addr.pincode}`
  } else {
    addressLine1 = 'No shipping address recorded.'
  }
  
  doc.text(addressLine1.toUpperCase(), 68, 108)
  if (addressLine2) {
    doc.text(addressLine2.toUpperCase(), 68, 114)
  }

  // Divider
  const itemsStartHeaderY = addressLine2 ? 122 : 116
  doc.setDrawColor(204, 197, 185)
  doc.line(20, itemsStartHeaderY, 190, itemsStartHeaderY)

  // 2. Order Items Table
  let currentY = itemsStartHeaderY + 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('ORDERED MEDICAL SUPPLIES', 20, currentY)

  currentY += 6
  // Table Headers
  doc.setFillColor(245, 242, 235)
  doc.rect(20, currentY, 170, 7, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text('ITEM DESCRIPTION', 22, currentY + 5)
  doc.text('SKU', 100, currentY + 5)
  doc.text('PRICE', 130, currentY + 5)
  doc.text('QTY', 155, currentY + 5)
  doc.text('TOTAL', 172, currentY + 5)

  currentY += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])

  if (order.items && order.items.length > 0) {
    order.items.forEach((item) => {
      const pName = item.product?.name || 'STAT Surgical Tool'
      const pSku = item.product?.sku || 'N/A'
      const pPrice = item.priceAtPurchase || item.product?.price || 0
      const pQty = item.quantity || 1
      const pTotal = pPrice * pQty

      // Draw table row border
      doc.setDrawColor(230, 225, 215)
      doc.line(20, currentY + 6, 190, currentY + 6)

      // Print texts
      const truncatedName = pName.length > 40 ? pName.substring(0, 37) + '...' : pName
      doc.text(truncatedName.toUpperCase(), 22, currentY + 4)
      doc.text(pSku.toUpperCase(), 100, currentY + 4)
      doc.text(`INR ${pPrice.toLocaleString()}`, 130, currentY + 4)
      doc.text(pQty.toString(), 155, currentY + 4)
      doc.text(`INR ${pTotal.toLocaleString()}`, 172, currentY + 4)

      currentY += 6
    })
  }

  // Draw table bottom border
  doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2])
  doc.line(20, currentY, 190, currentY)

  currentY += 5

  // Subtotal & Totals calculations
  const totalAmount = order.totalAmount || 0
  const discountAmount = order.discountAmount || 0
  
  // Re-calculate subtotal
  let calculatedSubtotal = 0
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      calculatedSubtotal += (item.priceAtPurchase || item.product?.price || 0) * item.quantity
    })
  }

  // Draw Summary block to the right
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text('SUBTOTAL:', 130, currentY + 4)
  doc.setFont('helvetica', 'bold')
  doc.text(`INR ${calculatedSubtotal.toLocaleString()}`, 172, currentY + 4)

  currentY += 5
  if (discountAmount > 0) {
    doc.setFont('helvetica', 'normal')
    doc.text(`DISCOUNT (${order.couponCode || 'PROMO'}):`, 130, currentY + 4)
    doc.setFont('helvetica', 'bold')
    doc.text(`- INR ${discountAmount.toLocaleString()}`, 172, currentY + 4)
    currentY += 5
  }

  doc.setFont('helvetica', 'normal')
  doc.text('SHIPPING & PACKAGING:', 130, currentY + 4)
  doc.setFont('helvetica', 'bold')
  doc.text('FREE', 172, currentY + 4)

  currentY += 5
  doc.line(130, currentY, 190, currentY)

  currentY += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('TOTAL INVOICE AMOUNT:', 110, currentY + 4)
  doc.text(`INR ${totalAmount.toLocaleString()}`, 172, currentY + 4)

  // Footer Section at the bottom of the page
  let footerY = 240
  
  // Divider
  doc.setDrawColor(204, 197, 185)
  doc.setLineWidth(0.2)
  doc.line(20, footerY - 5, 190, footerY - 5)

  // Store compliance details
  doc.setFillColor(255, 252, 242)
  doc.rect(20, footerY, 170, 22, 'F')
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setLineWidth(0.4)
  doc.rect(20, footerY, 170, 22, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('STAT CLINICAL STERILITY GUARANTEE & SUPPORT', 24, footerY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text('1. All surgical equipment packages undergo triple-chamber ethylene oxide (EO) sterilization before dispatch.', 24, footerY + 10)
  doc.text('2. For inquiries, technical assistance, or returns, reach us at +91 86086 78828 or statsurgicalsupplies@gmail.com.', 24, footerY + 15)

  // Save PDF
  doc.save(`STAT_Invoice_${shortOrderId}.pdf`)
}
