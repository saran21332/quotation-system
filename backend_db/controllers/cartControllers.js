const db = require('../db');

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    if (!product_id || !quantity || !user_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [productResults] = await db.query(
      'SELECT category_id, price_yearly, price FROM product WHERE id = ?',
      [product_id]
    );

    if (productResults.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResults[0];
    const SOFTWARE_CATEGORY_ID = 1;

    const contract_type = (product.category_id === SOFTWARE_CATEGORY_ID) ? 'yearly' : null;
    const contract_duration = (product.category_id === SOFTWARE_CATEGORY_ID) ? 1 : null;

    let unit_price = 0;
    if (product.category_id === SOFTWARE_CATEGORY_ID) {
      unit_price = product.price_yearly;
    } else {
      unit_price = product.price;
    }

    const [cartResults] = await db.query(
      `
      SELECT id, quantity FROM carts
      WHERE user_id = ? AND product_id = ? AND device_id IS NULL 
      AND contract_type <=> ? AND contract_duration <=> ?
      `,
      [user_id, product_id, contract_type, contract_duration]
    );


    if (cartResults.length > 0) {
      const newQty = cartResults[0].quantity + quantity;

      await db.query(
        `
        UPDATE carts
        SET quantity = ?, unit_price = ?, contract_duration = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [newQty, unit_price, contract_duration, cartResults[0].id]
      );
    } else {
      await db.query(
        `
        INSERT INTO carts 
        (user_id, product_id, quantity, unit_price, contract_type, contract_duration, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [user_id, product_id, quantity, unit_price, contract_type, contract_duration]
      );
    }

    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(400).json({ message: 'Unauthorized' });
    }

    const sql = `
      SELECT
        c.id AS cart_id,
        c.product_id,
        p.title AS product_name,
        p.image,
        p.category_id,
        c.quantity,
        c.unit_price
      FROM carts c
      JOIN product p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.product_id
    `;

    const [results] = await db.query(sql, [user_id]);

    const cartItems = [];
    let totalCartPrice = 0;
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3500';

    results.forEach(row => {
      const isSoftware = row.category_id === 1;
      const itemTotalPrice = row.unit_price * row.quantity;

      cartItems.push({
        cart_id: row.cart_id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_quantity: row.quantity,
        unit_price: row.unit_price,
        product_type: isSoftware ? 'software' : 'hardware',
        image_url: row.image ? `${BASE_URL}/uploads/${row.image}` : null,
        total_price: itemTotalPrice
      });

      totalCartPrice += itemTotalPrice;
    });

    res.status(200).json({
      cart: cartItems,
      total_cart_price: totalCartPrice
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.removeCartItem = async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!user_id || !product_id) {
      return res.status(400).json({ message: 'Missing data' });
    }

    const checkSql = `
      SELECT * FROM carts 
      WHERE user_id = ? AND product_id = ? AND device_id IS NULL
    `;

    const [results] = await db.query(checkSql, [user_id, product_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const deleteSql = `
      DELETE FROM carts 
      WHERE user_id = ? AND product_id = ? AND device_id IS NULL
    `;

    await db.query(deleteSql, [user_id, product_id]);

    res.status(200).json({ message: 'Product removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getCartCount = async (req, res) => {
  try {
    const user_id = req.user.id; // ดึง user id จาก token (middleware)

    const [rows] = await db.query(
      'SELECT SUM(quantity) AS count FROM carts WHERE user_id = ?',
      [user_id]
    );

    const count = rows[0].count || 0;

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ message: 'Missing user ID' });
    }

    const deleteSql = `DELETE FROM carts WHERE user_id = ?`;

    await db.query(deleteSql, [user_id]);

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateQuantity = async (req, res) => {
  const { cart_id, product_quantity } = req.body;

  if (!cart_id || !product_quantity || product_quantity < 1) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบหรือจำนวนไม่ถูกต้อง' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE carts SET quantity = ? WHERE id = ?',
      [product_quantity, cart_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบรายการในตะกร้า' });
    }

    res.json({ message: 'อัปเดตจำนวนสินค้าเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};
