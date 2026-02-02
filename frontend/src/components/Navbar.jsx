import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';
import cartImage from '../assets/cart.png';
import trash from '../assets/trash.png';
import logout from '../assets/logout.png';
import { useNavigate } from 'react-router-dom';
import profiles from '../assets/profiles.png';
import trashclear from '../assets/trashclear.png';


export default function Navbar({ searchTerm, onSearchChange, cartCount, onCartUpdate }) {
  const [animate, setAnimate] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerTel, setCustomerTel] = useState('');
  const [customerFax, setCustomerFax] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const getToken = () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  };

  useEffect(() => {
  const token = getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setRole(payload.role || '');
    } catch (err) {
      console.log(err)
    }
  }
}, []);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    const fetchCart = async () => {
      const token = getToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCartItems(data.cart || []);
        
        const totalAmount = (data.cart || []).reduce(
          (sum, item) => sum + (item.total_price || 0),
          0
        );
        setTotal(totalAmount);
      } catch (err) {
        console.log(err)
      }
    };

    if (isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen]);

  useEffect(() => {
    const newTotal = cartItems.reduce(
      (sum, item) =>
        sum + item.product_quantity * parseFloat(item.unit_price || 0),
      0
    );
    setTotal(newTotal);
  }, [cartItems]);

  const handleToggleCart = () => setIsCartOpen(!isCartOpen);

  const handleIncrease = async (cartId, currentQuantity) => {
  const newQuantity = currentQuantity + 1;

  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/updateQuantity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ cart_id: cartId, product_quantity: newQuantity }),
    });

    if (!response.ok) throw new Error('Failed to update quantity');

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cart_id === cartId
          ? {
              ...item,
              product_quantity: newQuantity,
              total_price: newQuantity * parseFloat(item.unit_price),
            }
          : item
      )
    );
    onCartUpdate?.();
  } catch (error) {
    console.log(err)
  }
};

const handleDecrease = async (cartId, currentQuantity) => {
  if (currentQuantity <= 1) return;
  const newQuantity = currentQuantity - 1;

  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/updateQuantity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ cart_id: cartId, product_quantity: newQuantity }),
    });

    if (!response.ok) throw new Error('Failed to update quantity');

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cart_id === cartId
          ? {
              ...item,
              product_quantity: newQuantity,
              total_price: newQuantity * parseFloat(item.unit_price),
            }
          : item
      )
    );
    onCartUpdate?.();
  } catch (error) {
    console.log(err)
  }
};


  const handleRemove = async (cartId, productId) => {
    const token = getToken();
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนลบสินค้า');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/delete`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ product_id: productId }),
      });

      if (!response.ok) {
        throw new Error(`ลบสินค้าไม่สำเร็จ: ${response.status}`);
      }

      setCartItems((prevItems) => prevItems.filter((item) => item.cart_id !== cartId));
      onCartUpdate?.();
    } catch (error) {
      console.log(err)
    }
  };

  const handleClearCart = async () => {
    const token = getToken();
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนล้างตะกร้า');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถล้างตะกร้าได้');
      }

      setCartItems([]);
      setTotal(0);
      onCartUpdate?.();
    } catch (err) {
      console.error('❌ ล้างตะกร้าล้มเหลว:', err.message);
    }
  };

  const handleCheckout = () => {
    setIsQuotationModalOpen(true);
  };

  const handleSubmitQuotation = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) return alert('กรุณาเข้าสู่ระบบ');

  const payload = {
    customer_name: customerName,
    customer_company: customerCompany,
    customer_address: customerAddress,
    customer_tel: customerTel,
    customer_fax: customerFax,
    customer_email: customerEmail,
  };

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quotation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('สร้างใบเสนอราคาไม่สำเร็จ');

    const result = await res.json();
    setIsQuotationModalOpen(false);

    if (result.pdf_url) {
      const pdfUrl = `${result.pdf_url}`;
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาดในการสร้างใบเสนอราคา');
  }
};

const handleLogout = async () => {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Logout failed');

    sessionStorage.removeItem('token');
    localStorage.removeItem('token');

    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error.message);
    alert('ออกจากระบบไม่สำเร็จ');
  }
};

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
              <div className="mx-auto my-5 max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                  <div className="flex shrink-0 items-center">
                    <button 
                    onClick={() => navigate("/Home")}
                    >
                    <img alt="Company" src={logo} className="h-9 sm:h-15 w-auto cursor-pointer" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-4 justify-end w-full sm:w-auto">
                    <div className="relative w-full max-w-xs sm:max-w-[180px] md:max-w-[288px] lg:max-w-[384px]">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full pl-10 pr-3 py-1 border-2 border-gray-300 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none text-sm kanit-regular"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleCart}
                      className="relative rounded-full p-1.5 focus:outline-none flex-shrink-0"
                    >
                      <span className="sr-only">View cart</span>
                      <div className="bg-white p-1.5 rounded-full cursor-pointer">
                        <img src={cartImage} alt="Cart" className="h-7 w-7 object-contain" />
                      </div>
                      {cartCount > 0 && (
                        <span
                          className={`absolute -top-0.5 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-xs font-bold text-white ${
                            animate ? 'animate-bounce' : ''
                          }`}
                        >
                          {cartCount}
                        </span>
                      )}
                    </button>

                    {role === 'user' && (
                      <button
                        onClick={() => setShowConfirmLogout(true)}
                        className="relative mb-1 rounded-full p-1 -ml-3 focus:outline-none flex-shrink-0"
                        title="Logout"
                      >
                        <div className="bg-white p-1 rounded-full cursor-pointer">
                          <img src={logout} alt="Logout" className="h-6 w-6 object-contain" />
                        </div>
                      </button>
                    )}

                    {role === 'admin' && (
                    <button
                      onClick={() => navigate('/Admin')}
                      className="relative mb-1 rounded-full -ml-3 focus:outline-none flex-shrink-0"
                      title="Admin Dashboard"
                    >
                      <img
                        src={profiles}
                        alt="Admin Profile"
                        className="h-7 w-7 rounded-full object-cover cursor-pointer"
                      />
                    </button>
                    )}
                  </div>
                </div>
              </div>
            </nav>

            {showConfirmLogout && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg text-center kanit-regular">
              <div className="flex items-center justify-center mx-auto mb-4 bg-cyan-100/50 rounded-full w-25 h-25">
                <img src={logout} className="h-12 w-12 object-contain block" />
              </div>
              <p className="mb-1 text-xl font-semibold text-gray-800 kanit-regular">
                ออกจากระบบ
              </p>
              <p className="mb-3 text-l font-semibold text-gray-600 kanit-regular">
                คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
              </p>
                <div className="flex flex-col justify-center gap-2">
                                <button
                  onClick={() => {
                    handleLogout();
                    setShowConfirmLogout(false);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-cyan-600 bg-[#009DB7] text-white hover:bg-cyan-600 transition kanit-regular cursor-pointer"
                >
                  ยืนยันการออกจากระบบ
                </button>
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="w-full px-4 py-2 rounded-lg border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition kanit-regular cursor-pointer"
                >
                  กลับไปที่หน้าหลัก
                </button>
              </div>
            </div>
          </div>
        )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-6">
          <div className="bg-white w-full max-w-[700px] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="flex justify-between items-center p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 kanit-regular truncate">
                ตะกร้าสินค้า
              </h2>
              <button
                onClick={handleToggleCart}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors p-1 cursor-pointer"
                aria-label="Close cart modal"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <img
                    src={cartImage}
                    alt="ตะกร้าสินค้าว่าง"
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4"
                  />
                  <p className="text-gray-500 kanit-regular text-sm sm:text-base">
                    ตะกร้าสินค้าว่างเปล่า
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.cart_id}
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                    >
                      <div className="sm:hidden">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name}
                                    className="w-10 h-10 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm">📦</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2 flex-shrink-0">
                            <div className="text-sm font-bold text-cyan-600 kanit-regular">
                              ฿{item.total_price.toLocaleString()}
                            </div>
                            <button
                              onClick={() => handleRemove(item.cart_id, item.product_id)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded-md transition-colors"
                              title="ลบออกจากตะกร้า"
                            >
                              <img src={trash} alt="ลบ" className="w-4 h-4 object-contain" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border-2 border-cyan-600 rounded-md overflow-hidden bg-white">
                            <button
                              onClick={() => handleDecrease(item.cart_id, item.product_quantity)}
                              disabled={item.product_quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 transition-colors text-sm"
                            >
                              −
                            </button>
                            <div className="w-10 h-8 flex items-center justify-center text-sm font-medium text-gray-800 bg-white border-x border-cyan-600">
                              {item.product_quantity}
                            </div>
                            <button
                              onClick={() => handleIncrease(item.cart_id, item.product_quantity)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-between space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">📦</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 kanit-regular truncate">
                            {item.product_name}
                          </h3>
                          <p className="text-xs text-gray-500 kanit-regular">
                            ฿{parseFloat(item.unit_price).toLocaleString()} x {item.product_quantity}
                          </p>
                        </div>

                        <div className="text-sm font-bold text-cyan-600 kanit-regular flex-shrink-0">
                          ฿{item.total_price.toLocaleString()}
                        </div>

                        <div className="flex items-center border-2 border-cyan-600 rounded-md overflow-hidden bg-white">
                          <button
                            onClick={() => handleDecrease(item.cart_id, item.product_quantity)}
                            disabled={item.product_quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 transition-colors text-sm cursor-pointer"
                          >
                            −
                          </button>
                          <div className="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-800 bg-white border-x border-cyan-600">
                            {item.product_quantity}
                          </div>
                          <button
                            onClick={() => handleIncrease(item.cart_id, item.product_quantity)}
                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item.cart_id, item.product_id)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="ลบออกจากตะกร้า"
                        >
                          <img src={trash} alt="ลบ" className="w-5 h-5 object-contain" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base sm:text-lg font-medium text-gray-700 kanit-regular">
                    รวมทั้งสิ้น:
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-cyan-600 kanit-regular">
                    ฿{total.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 kanit-regular">
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="w-full sm:flex-1 py-3 px-4 border-2 border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-medium cursor-pointer"
                  >
                    ล้างตะกร้า
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="w-full sm:flex-1 py-3 px-4 bg-[#009DB7] text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium cursor-pointer"
                  >
                    ดูใบเสนอราคา
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirmClear && (
      <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg text-center kanit-regular">
        <div className="flex items-center justify-center mx-auto mb-4 bg-cyan-100/50 rounded-full w-25 h-25">
        <img src={trashclear} className="h-12 w-12 object-contain block" />
        </div>
        <p className="mb-1 text-xl font-semibold text-gray-800 kanit-regular">
          ยืนยันการล้างตะกร้าสินค้า
        </p>
        <p className="mb-3 text-l font-semibold text-gray-600 kanit-regular">
          คุณแน่ใจหรือไม่ว่าต้องการล้างตะกร้าสินค้า?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowConfirmClear(false)}
            className="px-6 py-2 rounded-lg border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition kanit-regular cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              handleClearCart();
              setShowConfirmClear(false);
            }}
            className="px-6 py-2 rounded-lg border border-cyan-600 bg-[#009DB7] text-white hover:bg-cyan-600 transition kanit-regular cursor-pointer"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
      )}

        {isQuotationModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/45 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-xl relative">

              <button 
                onClick={() => setIsQuotationModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl cursor-pointer"
              >
                ×
              </button>
              
              <h2 className="text-lg font-semibold mb-6 text-gray-800 kanit-regular">ข้อมูลบริษัทของท่าน</h2>

              <form className="space-y-4" onSubmit={handleSubmitQuotation}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                    ชื่อบริษัท
                  </label>
                  <input 
                    type="text"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    placeholder="บริษัท ของท่าน จำกัด"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                    ที่อยู่
                  </label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="157 ซอย รามอินทรา ท่าแร้ง เขตบางเขน กรุงเทพมหานคร 10230"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                    rows="3"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                    ชื่อลูกค้า<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="คุณ สมชาย ใจดี"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                  />
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      value={customerTel}
                      onChange={(e) => setCustomerTel(e.target.value)}
                      placeholder="02-123-4567"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent kanit-regular"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                      โทรสาร (FAX)
                    </label>
                    <input 
                      type="text"
                      value={customerFax}
                      onChange={(e) => setCustomerFax(e.target.value)}
                      placeholder="02-123-4568"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#009DB7] text-white px-4 py-3 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 font-medium flex items-center justify-center gap-2 kanit-regular cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    พิมพ์ใบเสนอราคา
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
