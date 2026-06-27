import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatCurrencyDetailed } from './calculations';

export function generateQuotationPDF({
  formState,
  estimate,
  materials,
  clientView,
}) {
  const doc = new jsPDF();
  const company = materials.company;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(26, 35, 50);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(company.address, 14, 26);
  doc.text(`${company.phone}  |  ${company.email}`, 14, 32);
  doc.text(`GSTIN: ${company.gstin}`, 14, 38);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth - 14, 55, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const productLabel = formState.productType === 'wardrobe' ? 'Wardrobe' : 'Bed';
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 55);
  doc.text(`Product: ${productLabel}`, 14, 62);
  doc.text(
    `Dimensions: ${formState.width} × ${formState.height} × ${formState.depth} ${formState.dimensionUnit || 'inch'}`,
    14,
    69
  );
  if (formState.clientName) {
    doc.text(`Client: ${formState.clientName}`, 14, 76);
  }

  let yPos = 88;

  const materialRows = estimate.materialItems.map((item) => {
    const areaLabel = `${item.area.toFixed(2)} sq ft`;

    let componentLabel = item.name;
    if (item.dimensionNote) {
      componentLabel = `${item.name}\n${item.dimensionNote}`;
    } else if (!item.isFixed && !item.isWastage) {
      componentLabel = `${item.name} (${areaLabel} × ${formatCurrencyDetailed(item.rate)})`;
    } else if (item.isWastage) {
      componentLabel = `${item.name} (${item.area.toFixed(2)} sq ft × ${formatCurrencyDetailed(item.rate)})`;
    }

    return [
      componentLabel,
      item.isFixed ? '—' : item.area.toFixed(2),
      item.isFixed ? '—' : formatCurrencyDetailed(item.rate),
      item.isWastage || estimate.wastagePercent > 0 ? `${estimate.wastagePercent}%` : '—',
      formatCurrencyDetailed(item.cost),
    ];
  });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Material breakdown', 14, yPos);
  yPos += 4;

  autoTable(doc, {
    startY: yPos,
    head: [['Component', 'Area', 'Rate', 'Wastage %', 'Cost']],
    body: materialRows,
    foot: [[
      `Total material (${estimate.materialTotalArea.toFixed(2)} sq ft)`,
      '',
      '',
      estimate.wastagePercent > 0 ? `${estimate.wastagePercent}%` : '',
      formatCurrencyDetailed(estimate.materialCost),
    ]],
    theme: 'grid',
    headStyles: { fillColor: [26, 35, 50] },
    footStyles: { fillColor: [240, 240, 240], textColor: [30, 30, 30], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  if (!clientView) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Labor Breakdown (45% of Material)', 14, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [['Process', 'Percentage', 'Cost']],
      body: [
        ['Cutting', '15%', formatCurrency(estimate.labor.cutting)],
        ['Edge Banding', '15%', formatCurrency(estimate.labor.edgeBanding)],
        ['Assembling', '15%', formatCurrency(estimate.labor.assembling)],
      ],
      foot: [['', 'Labor Total', formatCurrency(estimate.labor.total)]],
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 50] },
      footStyles: { fillColor: [240, 240, 240], textColor: [30, 30, 30], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  if (estimate.hardwareItems.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Hardware', 14, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Qty', 'Unit Price', 'Cost']],
      body: estimate.hardwareItems.map((h) => [
        h.name,
        h.qty,
        formatCurrency(h.unitPrice),
        formatCurrency(h.cost),
      ]),
      foot: [['', '', 'Hardware Total', formatCurrency(estimate.hardwareCost)]],
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 50] },
      margin: { left: 14, right: 14 },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  const summaryRows = [
    ['Subtotal', formatCurrency(estimate.subtotal)],
  ];

  if (estimate.transportCost > 0) {
    summaryRows.push(['Transport', formatCurrency(estimate.transportCost)]);
  }
  if (estimate.installationCost > 0) {
    summaryRows.push(['Installation', formatCurrency(estimate.installationCost)]);
  }
  if (formState.applyGst) {
    summaryRows.push(['GST (18%)', formatCurrency(estimate.gstAmount)]);
  }
  if (formState.marginPercent && Number(formState.marginPercent) !== 0) {
    const label = Number(formState.marginPercent) > 0 ? 'Margin' : 'Discount';
    summaryRows.push([`${label} (${formState.marginPercent}%)`, formatCurrency(estimate.marginAmount)]);
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Price Summary', 14, yPos);
  yPos += 4;

  autoTable(doc, {
    startY: yPos,
    body: summaryRows,
    theme: 'plain',
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
  });

  yPos = doc.lastAutoTable.finalY + 8;

  doc.setFillColor(26, 35, 50);
  doc.rect(14, yPos, pageWidth - 28, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FINAL PRICE', 20, yPos + 9);
  doc.text(formatCurrency(estimate.finalPrice), pageWidth - 20, yPos + 9, { align: 'right' });

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'This quotation is valid for 15 days from the date of issue. Prices subject to change based on material availability.',
    14,
    doc.internal.pageSize.getHeight() - 10
  );

  const filename = `Quotation_${productLabel}_${formState.clientName || 'Draft'}_${Date.now()}.pdf`;
  doc.save(filename.replace(/\s+/g, '_'));
}
