import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportStandardPdf = (title, headers, dataRows, fileName, startDate, endDate) => {
  const doc = new jsPDF()
  const periodStr = `${startDate || 'All Time'} to ${endDate || 'Present'}`

  // 1. 统一标题
  doc.setFont("Helvetica", "bold")
  doc.setFontSize(16)
  doc.text("SMK OFFICIAL MMI REPORT", 14, 15)
  doc.setFontSize(14)
  doc.setTextColor(79, 70, 229)
  doc.text(title, 14, 23)

  // 2. 统一副标题
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Report Period: ${periodStr}`, 14, 30)
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 35)

  // 🛡️ 核心防错：确保 dataRows 是合法的二维数组，避免 map 报错
  const safeBody = Array.isArray(dataRows) ? dataRows.map(row => 
    Array.isArray(row) ? row : [row]
  ) : []

  // 3. 统一表格样式
  autoTable(doc, {
    startY: 40,
    head: [headers],
    body: safeBody, // 使用加固后的安全数组
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10)
    }
  })
  
  doc.save(`${fileName}.pdf`)
}