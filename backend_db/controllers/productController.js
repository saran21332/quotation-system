const db = require('../db');
require('dotenv').config();

exports.getAllProducts = async (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.title,
      p.description,
      p.product_condition,
      p.image,
      c.name AS category,
      c.parent_id,
      parent.name AS parent_category,
      p.category_id,
      p.price,
      p.price_yearly,
      p.quantity,
      p.created_at,
      p.updated_at
    FROM product p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN categories parent ON c.parent_id = parent.id
    ORDER BY p.created_at DESC
  `;

  try {
    const [results] = await db.query(sql);

    const hardware = [];
    const software = [];

    const BASE_URL = process.env.BASE_URL;

    results.forEach(product => {
      product.image = product.image
        ? `${BASE_URL}/uploads/${product.image}`
        : null;
    

      delete product.price_monthly;

      const isSoftware = product.category_id === 1;

      if (isSoftware) {
        software.push(product);
      } else {
        hardware.push(product);
      }
    });

    res.status(200).json({ software, hardware });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load product list' });
  }
};


exports.Addproduct = async (req, res) => {
  try {
    const {
      title,
      description,
      condition,
      category_id,
      quantity,
      price,
      price_yearly
    } = req.body;

    const image = req.file?.filename || null;

    const [result] = await db.execute(
      `INSERT INTO product 
        (title, description, product_condition, category_id, image, quantity, price, created_at, updated_at, price_yearly) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        title,
        description,
        condition,
        category_id,
        image,
        quantity,
        price || null,
        price_yearly || null
      ]
    );

    res.status(201).json({ message: 'Product created', productId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateProduct = async (req, res) => {
  const {
    id,
    title,
    description,
    condition,
    category_id,
    quantity,
    price,
    price_yearly
  } = req.body;

  const image = req.file?.filename;

  if (!id) {
    return res.status(400).json({ message: 'Product id is required' });
  }

  try {
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
     if (condition !== undefined) {
      fields.push('product_condition = ?');
      values.push(condition);
    }
    if (category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(category_id);
    }
    if (image !== undefined) {
      fields.push('image = ?');
      values.push(image);
    }
    if (quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(quantity);
    }
    if (price !== undefined) {
      fields.push('price = ?');
      values.push(price);
    }
    if (price_yearly !== undefined) {
      fields.push('price_yearly = ?');
      values.push(price_yearly);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    fields.push('updated_at = NOW()');

    const sql = `UPDATE product SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const [result] = await db.execute(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.deleteProduct = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Product ID is required in the body' });
  }

  try {
    const [result] = await db.execute('DELETE FROM product WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT id, name, parent_id FROM categories');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuotationLogs = async (req, res) => {
  try {
    const [logs] = await db.execute(`
      SELECT 
        ql.id,
        ql.quotation_id,
        ql.user_id,
        ql.user_name,
        ql.action,
        ql.created_at,
        ql.pdf_filename,
        q.customer_name,
        q.customer_tel
      FROM quotation_logs ql
      LEFT JOIN quotation q ON ql.quotation_id = q.id
      ORDER BY ql.created_at DESC
    `);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quotation logs' });
  }
};

exports.deleteQuotationLog = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Missing id in body' });
    }

    const [result] = await db.execute(
      'DELETE FROM quotation_logs WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json({ message: 'Quotation log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete quotation log' });
  }
};