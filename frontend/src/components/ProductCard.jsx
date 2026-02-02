import { useState, useEffect } from 'react'
import Infomation from '../assets/info.png'
import cartImage from '../assets/cart.png'

const getAuthToken = () => {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#009DB7] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{product.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <img
                src={product.image}
                alt={product.title}
                className="w-80 h-48 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-80 h-48 bg-gray-100 rounded-lg items-center justify-center text-gray-400 hidden">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed kanit-regular">
              {product.description || 'ไม่มีรายละเอียด'}
            </p>
          </div>

          <div className="mb-4">
            <div className="text-md font-semibold text-[#009DB7] bg-cyan-50 px-3 py-1 rounded kanit-regular inline-block">
              condition: {product.product_condition}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-sm text-gray-500 kanit-regular">
              หมวดหมู่: {product.category === 'software' ? 'Software' : 'Hardware'}
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              {product.category === 'software' && product.price_yearly && (
                <div className="text-lg font-bold text-cyan-600 kanit-regular">
                  รายปี: ฿{parseFloat(product.price_yearly).toLocaleString()}
                </div>
              )}
              {product.category === 'device' && product.price && (
                <div className="text-xl font-bold text-cyan-600 kanit-regular">
                  ฿{parseFloat(product.price).toLocaleString()}
                </div>
              )}
            </div>
            <CompactQuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                onAddToCart(product, quantity)
                onClose()
              }}
              className="bg-[#009DB7] hover:bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center gap-2 kanit-regular cursor-pointer"
            >
              <img src={cartImage} alt="Cart" className="w-5 h-5 filter brightness-0 invert" />
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactQuantitySelector = ({ quantity, onQuantityChange, minQuantity = 1, maxQuantity = 99 }) => {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1)
    }
  }

  return (
    <div className="flex items-center border-2 border-cyan-600 rounded-md overflow-hidden bg-white">
      <button
        onClick={handleDecrease}
        disabled={quantity <= minQuantity}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 transition-colors border-r border-[#009DB7] cursor-pointer"
      >
        <span className="text-sm font-medium cursor-pointer">−</span>
      </button>
      <div className="w-10 h-8 flex items-center justify-center text-sm font-medium text-gray-800 bg-white">
        {quantity}
      </div>
      <button
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity}
        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 transition-colors border-l border-[#009DB7] cursor-pointer"
      >
        <span className="text-sm font-medium cursor-pointer">+</span>
      </button>
    </div>
  )
}

const ProductCard = ({ product, onViewDetail,  onAddToCart }) => {
  const [imageError, setImageError] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const renderPrice = () => {
    const isSoftware = product.category === 'software'

    const label = isSoftware ? 'License / ปี' : '\u00A0'
    const price = isSoftware
      ? product.price_yearly
        ? `฿${parseFloat(product.price_yearly).toLocaleString()}`
        : 'ติดต่อสอบถาม'
      : product.price && parseFloat(product.price) > 0
        ? `฿${parseFloat(product.price).toLocaleString()}`
        : 'ติดต่อสอบถาม'

    return (
      <div className="min-h-[3.5rem] flex flex-col justify-start space-y-0.5">
        <div className="text-sm text-gray-600 kanit-regular">
          {label}
        </div>
        <div
          className={`text-xl font-bold ${
            price === 'ติดต่อสอบถาม' ? 'text-gray-500' : 'text-cyan-600'
          } kanit-regular`}
        >
          {price}
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    setQuantity(1)
  }

  return (
    <div className="bg-white rounded-xl border border-white shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col justify-between">
      <div>
        <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
          {!imageError && product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 kanit-regular">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-3 min-h-[7rem]">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 kanit-regular flex-1 min-h-[3.5rem]">
              {product.title}
            </h3>
            <button
              onClick={() => onViewDetail(product)}
              className="hover:opacity-80 transition-opacity ml-2 cursor-pointer"
              title="ดูรายละเอียด"
            >
              <img
                src={Infomation}
                alt="ดูรายละเอียด"
                className="h-6 w-6 object-contain"
              />
            </button>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex-1">
              {renderPrice()}
            </div>
            <div className="ml-3">
              <CompactQuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 mt-4">
        <button
          onClick={handleAddToCart}
          className="w-full bg-[#009DB7] text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-cyan-600 transition-colors kanit-regular cursor-pointer"
        >
          ใส่ตะกร้า
        </button>
      </div>
    </div>
  )
}

const ProductGrid = ({ products, onViewDetail, onSelectPricing, onAddToCart }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onViewDetail={onViewDetail}
          onSelectPricing={onSelectPricing}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}

export default function Productcart({ searchTerm = '' , setCartCount }) {
  const [activeTab, setActiveTab] = useState('all')
  const [subCategoryFilter, setSubCategoryFilter] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/product`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const allProducts = [
        ...(data?.software || []).map(p => ({ ...p, category: 'software', price: p.price_yearly })),
        ...(data?.hardware || []).map(p => ({ ...p, category: 'device' }))
      ];

      setProducts(allProducts);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setSubCategoryFilter(null)
  }, [activeTab])

  const handleViewDetail = (product) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
  }

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      const token = getAuthToken();

      if (!token) {
        alert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า')
        return
      }
      console.log('Adding to cart:', { product_id: product.id, quantity })

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id, quantity }),
      })

      const data = await response.json()
      console.log('Response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart')
      }

      const countResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!countResponse.ok) throw new Error('Failed to fetch cart count')
      const countData = await countResponse.json()
      setCartCount(countData.count)
    } catch (err) {
      console.error('Error adding to cart:', err)
      alert('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchCategory = activeTab === 'all' || product.category === activeTab
    const matchSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchSubCategory =
      activeTab === 'device'
        ? subCategoryFilter === null || product.category_id === subCategoryFilter
        : true
    return matchCategory && matchSearch && matchSubCategory
  })

  if (loading) {
    return (
      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <span className="ml-3 text-gray-600 kanit-regular">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4 kanit-regular">กรุณาล็อกอินหรือขอรหัสผ่านชั่วคราวอีกครั้ง</div>
            <div className="text-gray-600 mb-4 kanit-regular">{error}</div>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-[#009DB7] text-white rounded-lg hover:bg-cyan-600 transition-colors kanit-regular"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex rounded-r-4xl flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 kanit-regular">
              Product Highlight
            </h2>
            <div className="flex gap-2">
              {[{ id: 'all', label: 'ทั้งหมด' }, { id: 'software', label: 'Software' }, { id: 'device', label: 'Hardware' }].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors kanit-regular cursor-pointer ${
                    activeTab === tab.id ? 'bg-[#009DB7] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} (
                  {tab.id === 'all'
                    ? products.length
                    : products.filter((p) => p.category === tab.id).length}
                  )
                </button>
              ))}
            </div>
            {activeTab === 'device' && (
              <div className="mt-4 border-2 border-cyan-600 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 kanit-regular">หมวดหมู่ Hardware</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: null, label: 'ทั้งหมด' },
                    { id: 3, label: 'Sensor' },
                    { id: 4, label: 'CCTV' },
                    { id: 5, label: 'Computer' },
                    { id: 6, label: 'Wi-Fi' },
                  ].map((sub) => (
                    <button
                      key={sub.id ?? 'all'}
                      onClick={() => setSubCategoryFilter(sub.id)}
                      className={`px-4 py-2 rounded-md text-sm kanit-regular transition ${
                        subCategoryFilter === sub.id
                          ? 'bg-[#009DB7] text-white cursor-pointer'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ProductGrid 
            products={filteredProducts} 
            onViewDetail={handleViewDetail}
            onAddToCart={handleAddToCart}
          />

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12 kanit-regular">
              <div className="text-gray-400 text-lg kanit-regular">ไม่พบสินค้าในหมวดหมู่นี้</div>
            </div>
          )}
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  )
}
