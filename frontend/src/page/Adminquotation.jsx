import { useState, useEffect, useCallback, useMemo } from 'react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/sidebar.jsx'
import { useNavigate } from 'react-router-dom'
import trash from '../assets/trash.png';
import Search from '../assets/search.png';
import Add from '../assets/add.png';


function AdminQuotation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [cartItems, setCartItems] = useState([])
  const [token, setToken] = useState('')
  const [editType, setEditType] = useState('edit')
  const navigate = useNavigate()
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [addQuantities, setAddQuantities] = useState({});
  const [totalCartPrice, setTotalCartPrice] = useState(0)

  const getToken = () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token')
  }

  const fetchCart = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setCartItems(data.cart || [])
      setTotalCartPrice(data.total_cart_price); 
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }, [token])

  const fetchCartCount = useCallback(async () => {
    const tk = getToken()
    if (!tk) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/count`, {
        headers: {
          Authorization: `Bearer ${tk}`,
        },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setCartCount(data.count || 0)
    } catch (err) {
      console.error('Failed to fetch cart count:', err)
    }
  }, [])

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.unit_price) * item.product_quantity,
      0
    )
  }, [cartItems])

  const vat = useMemo(() => subtotal * 0.07, [subtotal])

  const grandTotal = useMemo(() => subtotal + vat, [subtotal, vat])

  const handleSubmit = () => {
    if (editType === 'auto') {
      navigate('/Admin/quotation/default')
    } else if (editType === 'edit') {
      navigate('/Admin/quotation/edit')
    }
  }

  const fetchAllProducts = useCallback(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/product`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    const combined = [
      ...(data.software || []).map(p => ({ ...p, category: 'software' })),
      ...(data.hardware || []).map(p => ({ ...p, category: 'device' })),
    ];
    setAllProducts(combined);
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}, [token])

const decreaseQuantity = async (item) => {
  if (item.product_quantity > 1) {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/updateQuantity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cart_id: item.cart_id,
        product_quantity: item.product_quantity - 1,
      }),
    });
    fetchCart();
    fetchCartCount();
  }
}

const increaseQuantity = async (item) => {
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/updateQuantity`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cart_id: item.cart_id,
      product_quantity: item.product_quantity + 1,
    }),
  });
  fetchCart();
  fetchCartCount();
}

const deleteCartItem = async (product_id) => {
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id }),
  });
  fetchCart();
  fetchCartCount();
}

const addToCart = async (product_id, quantity) => {
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product_id,
      quantity,
    }),
  });
  fetchCart();
  fetchCartCount();
}

useEffect(() => {
  if (showAddProductModal) {
    fetchAllProducts();
  }
}, [showAddProductModal, fetchAllProducts]);

useEffect(() => {
  if (showAddProductModal && allProducts.length > 0 && cartItems.length > 0) {
    const initialQuantities = {};
    cartItems.forEach(item => {
      initialQuantities[item.product_id] = item.product_quantity;
    });
  }
}, [showAddProductModal, allProducts, cartItems]);

useEffect(() => {
  const tk = getToken()
  if (tk) {
    setToken(tk)
  }
}, [])

useEffect(() => {
  if (token) {
    fetchCart()
    fetchCartCount()
  }
}, [token, fetchCart, fetchCartCount])

useEffect(() => {
  const initQuantities = {}
  cartItems.forEach(item => {
    initQuantities[item.product_id] = item.product_quantity
  })
}, [cartItems])


useEffect(() => {
  if (showAddProductModal) {
    fetchAllProducts()
  }
}, [showAddProductModal, fetchAllProducts])


  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          cartCount={cartCount}
          onCartUpdate={fetchCartCount}
        />
        <div className="flex-1 p-3 md:p-6 mt-26 overflow-auto">
          <div className="bg-white p-3 md:p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <h1 className="text-lg md:text-xl font-medium text-gray-800 kanit-regular">แก้ไขใบเสนอราคา</h1>
            </div>
            <hr className="border-gray-200 mb-4 md:-mb-15" />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4 md:mt-20 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-3 md:px-6 py-4 border-b border-gray-200 gap-3">
                <h2 className="text-base md:text-lg font-medium text-gray-900 kanit-regular">รายการสินค้า</h2>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="w-full md:w-auto bg-[#009DB7] hover:bg-[#009DB7] text-white px-4 py-2 rounded-md text-sm font-medium kanit-regular cursor-pointer"
                >
                 + เพิ่มสินค้า
                </button>
              </div>

              <div className="hidden md:block">
                <div className="grid grid-cols-5 gap-4 py-3 px-4 bg-[#009DB7] font-medium text-white text-sm kanit-regular">
                  <div>ลำดับ</div>
                  <div>รายการ</div>
                  <div className="text-center">จำนวน</div>
                  <div className="text-right">ราคาต่อหน่วย</div>
                  <div className="text-right">รวม</div>
                </div>

                {cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <div
                      key={item.cart_id || index}
                      className="grid grid-cols-5 gap-4 py-4 px-4 border-b border-gray-100 hover:bg-gray-50"
                    >
                      <div className="flex items-center text-gray-700 kanit-regular">{index + 1}</div>
                      <div className="flex items-center text-gray-700 kanit-regular">{item.product_name}</div>
                      <div className="flex items-center justify-center text-gray-700 kanit-regular">{item.product_quantity}</div>
                      <div className="flex items-center justify-end text-gray-700 kanit-regular">
                        ฿{Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center justify-end text-gray-700 font-medium kanit-regular">
                        ฿{(Number(item.unit_price) * item.product_quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 kanit-regular">
                    ไม่มีรายการสินค้าในตะกร้า
                  </div>
                )}
              </div>

              <div className="md:hidden">
                {cartItems.length > 0 ? (
                  <div className="space-y-3 p-3">
                    {cartItems.map((item, index) => (
                      <div key={item.cart_id || index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 kanit-regular mb-1">
                              {index + 1}. {item.product_name}
                            </div>
                            <div className="text-xs text-gray-500 kanit-regular">
                              จำนวน: {item.product_quantity} | ราคา/หน่วย: ฿{Number(item.unit_price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-[#009DB7] kanit-regular">
                            รวม: ฿{(Number(item.unit_price) * item.product_quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 kanit-regular">
                    ไม่มีรายการสินค้าในตะกร้า
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 py-3 md:py-4 px-3 md:px-4 bg-gray-50 border-b border-gray-100">
                    <div className="md:col-span-4 flex justify-between md:justify-end text-gray-700 font-medium kanit-regular text-sm md:text-base">
                      <span className="md:hidden">รวมเป็นเงิน</span>
                      <span className="hidden md:inline">รวมเป็นเงิน</span>
                    </div>
                    <div className="flex justify-end text-gray-900 font-bold kanit-regular text-sm md:text-base">
                      ฿{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 py-3 md:py-4 px-3 md:px-4 bg-gray-50 border-b border-gray-100">
                    <div className="md:col-span-4 flex justify-between md:justify-end text-gray-700 font-medium kanit-regular text-sm md:text-base">
                      <span className="md:hidden">ภาษีมูลค่าเพิ่ม 7%</span>
                      <span className="hidden md:inline">ภาษีมูลค่าเพิ่ม 7%</span>
                    </div>
                    <div className="flex justify-end text-gray-900 font-bold kanit-regular text-sm md:text-base">
                      ฿{vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 py-3 md:py-4 px-3 md:px-4 bg-gray-50">
                    <div className="md:col-span-4 flex justify-between md:justify-end text-gray-700 font-medium kanit-regular text-sm md:text-base">
                      <span className="md:hidden">ยอดรวมทั้งสิ้น</span>
                      <span className="hidden md:inline">ยอดรวมทั้งสิ้น</span>
                    </div>
                    <div className="flex justify-end text-base md:text-lg font-bold text-[#009DB7] kanit-regular">
                      ฿{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-3 md:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-base md:text-lg font-medium text-gray-900 kanit-regular">เลือกรูปแบบการแก้ไข</h2>
                </div>
                <div className="px-3 md:px-6 py-6 space-y-4">
                  <label className="flex items-start md:items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="editType"
                      className="w-4 h-4 text-[#009DB7] border-gray-300 focus:ring-cyan-600 mt-0.5 md:mt-0"
                      value="auto"
                      checked={editType === 'auto'}
                      onChange={() => setEditType('auto')}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 kanit-regular">ใช้แบบเดิมอัตโนมัติ</div>
                      <div className="text-xs text-gray-500 kanit-regular">ใช้ข้อมูลเดิมแล้วส่งแบบอัตโนมัติให้ลูกค้า</div>
                    </div>
                  </label>
                  <label className="flex items-start md:items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="editType"
                      className="w-4 h-4 text-[#009DB7] border-gray-300 focus:ring-cyan-600 mt-0.5 md:mt-0"
                      value="edit"
                      checked={editType === 'edit'}
                      onChange={() => setEditType('edit')}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 kanit-regular">แก้ไขใบเสนอราคา</div>
                      <div className="text-xs text-gray-500 kanit-regular">สามารถแก้ไขจำนวนหรือราคาก่อนส่งลูกค้า</div>
                    </div>
                  </label>
                </div>
                <div className="px-3 md:px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      className="w-full md:w-auto bg-[#009DB7] hover:bg-cyan-600 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center justify-center md:justify-start space-x-2 kanit-regular cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>แก้ไขใบเสนอราคา</span>
                    </button>
                  </div>
                </div>
              </div>

              {showAddProductModal && (
                <div className="fixed inset-0 bg-black/45 z-50 flex justify-center items-center p-4">
                  <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-hidden">
                    <div className="bg-[#009DB7] text-white px-4 md:px-6 py-4 relative">
                      <h2 className="text-lg md:text-xl font-semibold kanit-regular">เพิ่มสินค้า</h2>
                      <button
                        className="absolute top-1.5 right-4 text-white hover:text-gray-200 text-4xl font-light mr-1 md:mr-5 cursor-pointer"
                        onClick={() => setShowAddProductModal(false)}
                      >
                        ×
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                      <div className="p-3 md:p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                          <h3 className="text-base md:text-lg font-semibold kanit-regular text-gray-800">สินค้าในตะกร้า</h3>
                          <span className="bg-[#009DB7] text-white px-3 py-1 rounded-full text-sm font-medium kanit-regular">
                            {cartItems.length} รายการ
                          </span>
                        </div>
                        
                        {cartItems.length === 0 ? (
                          <div className="text-gray-500 kanit-regular py-8 text-center bg-gray-50 rounded-lg">
                            ไม่มีสินค้าในตะกร้า
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {cartItems.map(item => (
                              <div key={item.product_id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 rounded-lg p-3 shadow-sm gap-3">
                                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.product_name} className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg flex-shrink-0" />
                                  ) : (
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-teal-100 flex items-center justify-center rounded-lg flex-shrink-0">
                                      <div className="w-6 h-6 md:w-8 md:h-8 bg-teal-200 rounded"></div>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold kanit-regular text-gray-800 text-sm md:text-base truncate">{item.product_name}</div>
                                    <div className="text-xs md:text-sm text-gray-500 kanit-regular">
                                      ฿{Number(item.unit_price).toLocaleString()} x {item.product_quantity}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                                  <div className="text-[#009DB7] font-semibold kanit-regular text-sm md:text-base">
                                    ฿{Number(item.unit_price * item.product_quantity).toLocaleString()}.00
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center border-2 border-[#009DB7] rounded-md overflow-hidden bg-white">
                                      <button
                                        onClick={() => decreaseQuantity(item)}
                                        disabled={item.product_quantity <= 1}
                                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 transition-colors text-sm cursor-pointer"
                                      >
                                        −
                                      </button>
                                      <div className="w-8 h-6 flex items-center justify-center text-sm font-medium text-gray-800 bg-white border-x border-[#009DB7]">
                                        {item.product_quantity}
                                      </div>
                                      <button
                                        onClick={() => increaseQuantity(item)}
                                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                    
                                    <button
                                      onClick={() => deleteCartItem(item.product_id)}
                                      className="w-8 h-8 md:w-10 md:h-10 text-red-500 hover:text-red-700 rounded flex items-center justify-center cursor-pointer"
                                    >
                                      <img src={trash} alt="ลบสินค้า" className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-3 md:p-6">
                        <div className="border-2 border-[#009DB7] rounded-lg p-3 md:p-4">
                          <h3 className="text-base md:text-lg font-semibold kanit-regular text-gray-800 mb-4">สินค้าทั้งหมด</h3>
                          
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                placeholder="ค้นหาสินค้า"
                                className="border border-gray-300 rounded-3xl px-3 py-2 w-full kanit-regular text-sm pr-10"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                              />
                              <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                                <img src={Search} alt="ค้นหา" className="w-4 h-4" />
                              </div>
                            </div>
                            <select
                              value={categoryFilter}
                              onChange={(e) => setCategoryFilter(e.target.value)}
                              className="border border-gray-300 rounded-3xl px-3 py-2 text-sm kanit-regular bg-white w-full md:min-w-[130px] md:w-auto cursor-pointer"
                            >
                              <option value="all">ทั้งหมด</option>
                              <option value="1">Software</option>
                              <option value="3">Sensor</option>
                              <option value="4">CCTV</option>
                              <option value="5">Computer</option>
                              <option value="6">Wifi</option>
                            </select>
                          </div>

                          <div className="space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
                            {allProducts
                              .filter(p =>
                                p.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
                                (categoryFilter === 'all' || p.category_id === Number(categoryFilter))
                              )
                              .map(p => (
                                <div key={p.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 rounded-lg p-3 shadow-sm gap-3">
                                  <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                                    {p.image ? (
                                      <img
                                        src={p.image}
                                        alt={p.title}
                                        className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 md:w-14 md:h-14 bg-cyan-100 flex items-center justify-center rounded-lg flex-shrink-0">
                                        <div className="w-6 h-6 md:w-8 md:h-8 bg-cyan-200 rounded"></div>
                                      </div>
                                    )}

                                    <div className="flex flex-col flex-1 min-w-0">
                                      <div className="font-semibold text-gray-800 kanit-regular text-sm md:text-base truncate">{p.title}</div>
                                      <div className="text-gray-500 font-semibold kanit-regular text-xs md:text-sm">
                                        ฿{(parseFloat(p.price || p.price_yearly || 0)).toLocaleString()}
                                        {p.category === 'software' && <span className="text-xs text-gray-500 ml-1">/ปี</span>}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                                    <span className="text-[#009DB7] font-semibold kanit-regular text-sm md:text-base">
                                      ฿{(parseFloat(p.price || p.price_yearly || 0) * (addQuantities[p.id] || 1)).toLocaleString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center border-2 border-[#009DB7] rounded-md overflow-hidden bg-white">
                                        <button
                                          onClick={() =>
                                            setAddQuantities(prev => ({
                                              ...prev,
                                              [p.id]: Math.max(1, (prev[p.id] || 1) - 1),
                                            }))
                                          }
                                          disabled={(addQuantities[p.id] || 1) <= 1}
                                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 transition-colors text-sm cursor-pointer"
                                        >
                                          −
                                        </button>
                                        <div className="w-8 h-6 flex items-center justify-center text-sm font-medium text-gray-800 bg-white border-x border-[#009DB7]">
                                          {addQuantities[p.id] || 1}
                                        </div>
                                        <button
                                          onClick={() => 
                                                                                        setAddQuantities(prev => ({
                                              ...prev,
                                              [p.id]: (prev[p.id] || 1) + 1,
                                            }))
                                          }
                                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                                        >
                                          +
                                        </button>
                                      </div>
                                      
                                      <button
                                        onClick={() => addToCart(p.id, addQuantities[p.id] || 1)}
                                        className="px-2 md:px-3 py-2 rounded-lg text-md kanit-regular font-semibold flex items-center justify-center cursor-pointer"
                                        aria-label="เพิ่มสินค้า"
                                      >
                                        <img
                                          src={Add}
                                          alt="เพิ่มสินค้า"
                                          className="h-5 w-5 md:h-6 md:w-6"
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-base md:text-lg font-semibold text-gray-800 kanit-regular">รวมทั้งสิ้น:</span>
                              <span className="text-lg md:text-2xl font-bold text-[#009DB7] kanit-regular">
                                ฿{Number(totalCartPrice).toLocaleString()}.00
                              </span>
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-13 mt-6">
                              <button
                                className="w-full md:w-auto px-8 md:px-40 py-3 border-2 border-[#009DB7] rounded-xl text-[#009DB7] hover:bg-gray-100 kanit-regular font-semibold cursor-pointer"
                                onClick={() => setShowAddProductModal(false)}
                              >
                                ยกเลิก
                              </button>
                              <button
                                className="w-full md:w-auto px-8 md:px-40 py-3 bg-[#009DB7] text-white rounded-xl hover:bg-cyan-600 kanit-regular font-semibold cursor-pointer"
                                onClick={() => {
                                  setShowAddProductModal(false)
                                }}
                              >
                                ยืนยัน
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminQuotation