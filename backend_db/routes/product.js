const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartControllers')
const quotation = require('../controllers/quotationController')
const { authorizeAdmin } = require('../middleware/authadmin'); 
const authensession = require('../middleware/authensession');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/createuser',userController.createUser);
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.post('/request/otp', userController.requestOtp)
router.post('/resend/otp', userController.resendOtp)
router.post('/verify/otp', userController.verifyOtp)

router.get('/product', authensession.authMiddleware, productController.getAllProducts); 
router.post('/add/product', upload.single('image'),  authorizeAdmin, productController.Addproduct);
router.put('/update/product', upload.single('image'),  authorizeAdmin, productController.updateProduct);
router.delete('/delete/product',  authorizeAdmin, productController.deleteProduct); 
router.post('/quotation', authensession.authMiddleware, quotation.createQuotationFromCart);
router.get('/category', authensession.authMiddleware, productController.getCategories)
router.get('/quotation/logs', authensession.authMiddleware, authorizeAdmin, productController.getQuotationLogs);
router.delete('/quotation/logs/delete', authensession.authMiddleware, authorizeAdmin, productController.deleteQuotationLog);

router.post('/cart/add', authensession.authMiddleware, cartController.addToCart)
router.get('/cart',  authensession.authMiddleware, cartController.getCart)
router.delete('/cart/delete', authensession.authMiddleware, cartController.removeCartItem)
router.get('/cart/count', authensession.authMiddleware, cartController.getCartCount)
router.delete('/cart/clear', authensession.authMiddleware, cartController.clearCart)
router.put('/cart/updateQuantity', authensession.authMiddleware, cartController.updateQuantity)
module.exports = router;
