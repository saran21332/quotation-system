const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const db = require('../db');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

exports.createQuotationFromCart = async (req, res) => {
  const {
    reference, customer_name, customer_address, customer_tel, customer_fax, customer_code, quotation_no,
    customer_company,
    customer_email,
    discount_percent = 0, vat_percent = 7,
    remark, validity_days,
    use_default_remark = true,
    use_default_validity = true,
    use_default_sign = true,
    sign_left_name,
    sign_left_title,
    approved_by_name,
    approved_by_title,
    confirmed_by_title,
    product_descriptions = {}
  } = req.body;

  const user_id = req.user.id;
  const user_role = req.user.role;

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized: user_id is required' });
  }

  const isRegularUser = (user_role === 'user');

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();


    const [cartItems] = await connection.query(`
      SELECT 
        c.product_id, 
        p.title AS product_name, 
        p.price AS product_price,
        p.category_id, 
        cat.parent_id,
        c.quantity,
        c.unit_price, 
        c.contract_type, 
        c.contract_duration
      FROM carts c
      JOIN product p ON c.product_id = p.id
      JOIN categories cat ON p.category_id = cat.id
      WHERE c.user_id = ? AND c.device_id IS NULL
    `, [user_id]);

    if (cartItems.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = cartItems.map((row, index) => {
      const isSoftware = row.category_id === 1;
      let netPrice = row.unit_price * row.quantity;
      if (isSoftware && row.contract_type && row.contract_duration) {
        netPrice *= row.contract_duration;
      }

      return {
        product_description: product_descriptions[index + 1] || row.product_name,
        quantity: row.quantity,
        unit_price: row.unit_price,
        net_price: netPrice,
        category_id: row.category_id,
        parent_id: row.parent_id || null,
        contract_type: row.contract_type || ''
      };
    });

    const total_amount = items.reduce((sum, item) => sum + item.net_price, 0);
    const discount_amount = (total_amount * discount_percent) / 100;
    const after_discount = total_amount - discount_amount;
    const vat_amount = (after_discount * vat_percent) / 100;
    const grand_total = after_discount + vat_amount;

    const final_use_default_remark = isRegularUser ? true : use_default_remark;
    const final_use_default_validity = isRegularUser ? true : use_default_validity;
    const final_use_default_sign = isRegularUser ? true : use_default_sign;

    const final_remark = final_use_default_remark ? null : remark;
    const final_validity_days = final_use_default_validity ? DEFAULTS.validity_days : validity_days;
    const final_sign_left_name = final_use_default_sign ? DEFAULTS.sign_left_name : (sign_left_name || DEFAULTS.sign_left_name);
    const final_sign_left_title = final_use_default_sign ? DEFAULTS.sign_left_title : (sign_left_title || DEFAULTS.sign_left_title);
    const final_approved_by_name = final_use_default_sign ? DEFAULTS.approved_by_name : (approved_by_name || DEFAULTS.approved_by_name);
    const final_approved_by_title = final_use_default_sign ? DEFAULTS.approved_by_title : (approved_by_title || DEFAULTS.approved_by_title);
    const final_confirmed_by_title = final_use_default_sign ? DEFAULTS.confirmed_by_title : (confirmed_by_title || DEFAULTS.confirmed_by_title);

    const [quotationResult] = await connection.query(`
      INSERT INTO quotation 
        (quotation_no, quotation_date, reference,
        customer_name, customer_company, customer_address, customer_email,
        customer_tel, customer_fax, customer_code,
        discount_percent, vat_percent, total_amount, vat_amount, grand_total,
        remark, validity_days, created_at, updated_at, user_id)
      VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
    `, [
      quotation_no,
      reference,
      customer_name,
      customer_company,
      customer_address,
      customer_email,
      customer_tel,
      customer_fax,
      customer_code,
      discount_percent,
      vat_percent,
      after_discount,
      vat_amount,
      grand_total,
      final_remark,
      final_validity_days,
      user_id
    ]);

    const quotationId = quotationResult.insertId;

    const [userRows] = await connection.query(
      `SELECT username FROM users WHERE id = ? LIMIT 1`,
      [user_id]
    );
    const userName = userRows.length > 0 ? userRows[0].username : 'Unknown';

    const pdfDir = path.join(__dirname, '../public/pdfs');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    dayjs.extend(utc);
    dayjs.extend(timezone);
    const quotation_date = dayjs().tz('Asia/Bangkok').format('DD-MMM-YYYY-HH-mm-ss');
    const quotation_date_head = dayjs().format('DD-MMM-YYYY');
    const filename = `${customer_tel}-${quotation_date}.pdf`;
    const pdfPath = path.join(pdfDir, filename);


    await connection.query(`
      INSERT INTO quotation_logs (quotation_id, user_id, user_name, action, created_at, pdf_filename)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [quotationId, user_id, userName, 'created', new Date(), filename]);

    for (const item of items) {
      await connection.query(`
        INSERT INTO quotation_item
          (quotation_id, product_description, quantity, unit_price, net_price)
        VALUES (?, ?, ?, ?, ?)
      `, [quotationId, item.product_description, item.quantity, item.unit_price, item.net_price]);
    }

    await generateQuotationPDF({
      quotation_no,
      quotation_date,
      quotation_date_head,
      reference,
      customer_name,
      customer_address,
      customer_company,
      customer_email,
      customer_tel,
      customer_fax,
      customer_code,
      items,
      discount_amount,
      discount_percent,
      vat_percent,
      total_amount: after_discount,
      vat_amount,
      grand_total,
      remark: final_remark,
      validity_days: final_validity_days,
      sign_left_name: final_sign_left_name,
      sign_left_title: final_sign_left_title,
      approved_by_name: final_approved_by_name,
      approved_by_title: final_approved_by_title,
      confirmed_by_title: final_confirmed_by_title,
      use_default_remark: final_use_default_remark,
      use_default_sign: final_use_default_sign
    }, pdfPath);

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Quotation created from cart',
      quotation_no,
      pdf_url: `${process.env.BASE_URL}/pdfs/${filename}`
    });

  } catch (err) {
    console.error('Error creating quotation:', err);
    if (connection) {
      try {
        await connection.rollback();
        connection.release();
      } catch (rollbackErr) {
        console.error('Rollback error:', rollbackErr);
      }
    }
    res.status(500).json({ message: 'Failed to create quotation', error: err.message });
  }
};

function generateQuotationPDF(data, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const boldPath = path.join(__dirname, '../fonts/THSarabun-Bold.ttf');
    const fontPath = path.join(__dirname, '../fonts/THSarabunNew.ttf');
    doc.registerFont('THSarabun-Bold', boldPath);
    doc.registerFont('THSarabun', fontPath);
    doc.font('THSarabun').fontSize(12);

    const pages = [
      {
        title: 'Software Only (No VAT)',
        items: data.items.filter(i => i.parent_id !== 2),
        showVat: false,
        pageNote: 'Software Subscription Only'
      },
      {
        title: 'Devices Only (No VAT)',
        items: data.items.filter(i => i.parent_id === 2),
        showVat: false,
        pageNote: 'Device Quotation Only'
      },
      {
        title: 'Full Quotation (Include VAT)',
        items: data.items,
        showVat: true,
        pageNote: 'Full Quotation Summary'
      }
    ];

    pages.forEach((page, index) => {
      if (index > 0) doc.addPage();
      generatePage(page.items, page.title, page.showVat, page.pageNote);
    });

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);

    function generatePage(items, title, showVat, pageNote) {
      const logoPath = path.join(__dirname, '../uploads/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 100 });
      }

      doc.fontSize(18).text(`Quotation / ใบเสนอราคา`, 0, 20, { align: 'center' });

      let companyY = 50;
      doc.fontSize(10);
      doc.text('PlanetCloud Co.,Ltd.', 495, companyY);
      doc.text('157 Soi Ramindra 34, Ramindra Road, Tarang,', 425);
      doc.text('Bangkhen, Bangkok 10230, Thailand', 450);
      doc.text('Bangkok Office-Tel : +66 2792-2300 / Fax : +66 2792-2499', 385);
      doc.text('E-mail: sales@planetcloud.cloud', 460);

      const boxX = 50;
      const boxY = 120;
      const boxWidth = 520;
      const boxHeight = 90;
      const splitX = 360;
      doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
      doc.moveTo(splitX, boxY).lineTo(splitX, boxY + boxHeight).stroke();

      let leftX = boxX + 10;
      let currentY = boxY + 5;
      doc.fontSize(10);
      doc.text(`To: ${data.customer_name}  ${data.customer_company || ''}`, leftX, currentY);
      doc.text(`${data.customer_address}`, leftX);
      doc.text(`Tel: ${data.customer_tel || '-'}     Fax: ${data.customer_fax || '-'}`, leftX);
      doc.text(`Email: ${data.customer_email}`, leftX);
      doc.text(`Customer Code: ${data.customer_code || '-'}`, leftX);

      let rightX = splitX + 10;
      currentY = boxY + 5;
      doc.text(`Quotation No.: ${data.quotation_no || '-'}`, rightX, currentY);
      doc.text(`Date: ${data.quotation_date_head}`, rightX);
      doc.text(`Reference: ${data.reference || '-'}`, rightX);
      doc.text(`Prices: Landed`, rightX);
      doc.text(`Currency: THB`, rightX);

      doc.moveDown(2);
      doc.fontSize(11).text('Thank you four inquiry, we are pleased to propose our quotation as per following detail.',  50, doc.y,
        { align: 'left' })
      doc.fontSize(11).text(
        `Page Type: ${pageNote}`,
        50, doc.y,
        { align: 'left' }
      );
      doc.moveDown();

      const tableTop = doc.y + 5;
      let itemCols, headers;

      if (title === 'Full Quotation (Include VAT)') {
        itemCols = [50, 80, 120, 240, 380, 460, 520];
        headers = ['Item', 'Qty', 'Product Code', 'Product Description', 'Unit Price', 'Contract Type', 'Net Price'];
      } else {
        itemCols = [50, 80, 120, 240, 400, 520];
        const unitPriceHeader = title.includes('Software') ? 'Contract Type' : 'Unit Price';
        headers = ['Item', 'Qty', 'Product Code', 'Product Description', unitPriceHeader, 'Net Price'];
      }

      doc.moveTo(50, tableTop - 5).lineTo(550, tableTop - 5).stroke();
      doc.font('THSarabun');
      headers.forEach((header, i) => {
        doc.text(header, itemCols[i], tableTop);
      });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 20;
      items.forEach((item, index) => {
        doc.text(`${index + 1}`, itemCols[0], y);
        doc.text(item.quantity, itemCols[1], y);
        doc.text('-', itemCols[2], y);

        const descWidth = itemCols[4] - itemCols[3] - 5;
        const descOptions = {
          width: descWidth,
          lineBreak: true,
        };
        doc.text(`${item.product_description || ''}`, itemCols[3], y, {
          width: descWidth,
          lineBreak: true
        });

        const descriptionHeight = doc.heightOfString(item.product_description || '', descOptions);
        const lineHeight = 18;
        const linesUsed = Math.ceil(descriptionHeight / lineHeight);
        const newY = y;

        if (title === 'Full Quotation (Include VAT)') {
          doc.text(formatNumber(item.unit_price), itemCols[4], newY);
          let contractTypeText = '-';
          if (item.parent_id !== 2) {
            contractTypeText = item.contract_type === 'yearly' ? 'yearly' : '-';
          }
          doc.text(contractTypeText, itemCols[5], newY);
          doc.text(formatNumber(item.net_price), itemCols[6], newY);
        } else if (title === 'Software Only (No VAT)') {
          const contractTypeText = item.contract_type === 'yearly' ? 'yearly' : '-';
          doc.text(contractTypeText, itemCols[4], newY);
          doc.text(formatNumber(item.net_price), itemCols[5], newY);
        } else {
          doc.text(formatNumber(item.unit_price), itemCols[4], newY);
          doc.text(formatNumber(item.net_price), itemCols[5], newY);
        }

        y += linesUsed * lineHeight;
      });

      const spaceNeededForSummary = 100;
      const availableSpacee = doc.page.height - y - doc.page.margins.bottom;

      if (availableSpacee < spaceNeededForSummary) {
        doc.addPage();
        doc.font('THSarabun');
        y = doc.y;
      }

      if (showVat) {
        doc.fillColor('red').text(`Discount ${data.discount_percent}%`, itemCols[itemCols.length - 3], y + 15);
        doc.fillColor('black').text('Total Amount', itemCols[itemCols.length - 3], y + 30);

        doc.fillColor('red').text(formatNumber(data.discount_amount), itemCols[itemCols.length - 1], y + 15,);
        doc.fillColor('blue').text(formatNumber(data.total_amount), itemCols[itemCols.length - 1], y + 30,);

        doc.fillColor('black');
        doc.text(`VAT ${data.vat_percent}%`, itemCols[itemCols.length - 3], y + 45);
        doc.text('Grand Total Amount with VAT', itemCols[itemCols.length - 3], y + 60);

        doc.fillColor('blue');
        doc.text(formatNumber(data.vat_amount), itemCols[itemCols.length - 1], y + 45,);
        doc.text(formatNumber(data.grand_total), itemCols[itemCols.length - 1], y + 60,);

        y += 70;
      } else {
        y += 40;
      }

      const spaceNeeded = 260;
      const availableSpace = doc.page.height - doc.y - doc.page.margins.bottom;
      if (availableSpace < spaceNeeded) {
        doc.addPage();
        doc.font('THSarabun');
      }

      doc.moveDown(2);
      doc.fillColor('black');
      doc.font('THSarabun-Bold').fontSize(12).text('Remark:', 50);
      doc.font('THSarabun').fontSize(12);

      let remarkText = '';
      if (data.use_default_remark) {
        if (title === 'Software Only (No VAT)') {
          doc.text(DEFAULTS.remark_software);
        } else if (title === 'Devices Only (No VAT)') {
          doc.text(DEFAULTS.remark_device);
        } else {
          doc.text(DEFAULTS.remark_full(data.vat_percent));
        }
      } else {
        doc.text(data.remark || '-');
      }

      remarkText = remarkText.replace(/\n\s+/g, '\n');

      doc.text(remarkText);
      doc.font('THSarabun-Bold').text(`Validity: ${data.validity_days || DEFAULTS.validity_days} Days`);
      doc.font('THSarabun').text(`We look forward to serve your requirements.`);
      doc.text(`Best Regards`);

      const baseY = doc.y + 70;

      doc.font('THSarabun-Bold').fontSize(12);
      doc.text(data.sign_left_name || DEFAULTS.sign_left_name, 50, baseY);
      doc.font('THSarabun').fontSize(12);
      doc.text(data.sign_left_title || DEFAULTS.sign_left_title, 50, baseY + 15);
      doc.text('PlanetCloud Company Limited', 50, baseY + 30);

      doc.text('Approved By:', 250, baseY);
      doc.font('THSarabun-Bold').fontSize(12);
      doc.text(data.approved_by_name || DEFAULTS.approved_by_name, 250, baseY + 15);
      doc.font('THSarabun').fontSize(12);
      doc.text(data.approved_by_title || DEFAULTS.approved_by_title, 250, baseY + 30);
      doc.text('Date: ............../............../............', 250, baseY + 45);

      doc.text(data.confirmed_by_title || DEFAULTS.confirmed_by_title, 450, baseY);
      doc.text('Date: ............../............../............', 450, baseY + 15);
    }
  });
}

function formatNumber(number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(number));
}

const DEFAULTS = {
  remark_software: `All prices are in Thai Baht. Exclude VAT. Prices are for software licenses only. Delivery via download (if applicable).
Not include installation, customization, training, or onsite service.
1 Year standard support as per vendor policy.`,

  remark_device: `All prices are in Thai Baht. Exclude VAT. Prices are landed prices Bangkok, Thailand.
Include freight, insurance, imports tax and transportation.
Not include Onsite service. 1 Year Warranty for hardware.`,

  remark_full: (vat_percent) => `All prices are in Thai Baht. Include VAT ${vat_percent}%. Prices are landed prices Bangkok, Thailand.
Inclusive of freight, insurance, imports tax and transportation.
Not include Onsite service. 1 Year Warranty for hardware or support as specified.`,

  validity_days: 30,
  sign_left_name: 'Chatkwan Susiwa',
  sign_left_title: 'Marketing Specialist',
  approved_by_name: 'Wannapha Weeracharoen',
  approved_by_title: 'Chief Operation Officer',
  confirmed_by_title: 'Confirmed to Purchase'
};