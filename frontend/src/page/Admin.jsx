import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import { Edit, Trash2, X, Upload } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from '../components/sidebar.jsx';
import trashclear from '../assets/trashclear.png';

function AdminProductManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [products, setProducts] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editProductId, setEditProductId] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    condition: '',
    price: '',
    image: null
    })

  const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token')

  const fetchCartCount = useCallback(async () => {
    const token = getToken()
    if (!token) return
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.count)
      }
    } catch (err) {
      console.error('Failed to fetch cart count:', err)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
  const token = getToken()
  if (!token) return
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/product`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      console.error('❌ Failed to fetch products:', response.status)
      return
    }
    const data = await response.json()
    const allProducts = [...(data.software || []), ...(data.hardware || [])]
    setProducts(allProducts)
  } catch (err) {
    console.error('Failed to fetch products:', err)
  }
}, [])

  useEffect(() => {
    fetchCartCount()
    fetchProducts()
  }, [fetchCartCount, fetchProducts])

 const handleAddProduct = async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token) return;

  const formData = new FormData();
  formData.append('id', editProductId);
  formData.append('title', newProduct.title);
  formData.append('description', newProduct.description);
  formData.append('category_id', newProduct.category);
  formData.append('quantity', newProduct.quantity);
  formData.append('condition', newProduct.condition || '');

 if (Number(newProduct.category) === 1) {
  formData.append('price_yearly', newProduct.price);
} else {
  formData.append('price', newProduct.price);
}

  if (newProduct.image) {
    formData.append('image', newProduct.image);
  }

  try {
   const isEdit = !!editProductId;

   const url = isEdit
   ? `${import.meta.env.VITE_API_BASE_URL}/api/update/product`
   : `${import.meta.env.VITE_API_BASE_URL}/api/add/product`;

   const method = isEdit ? 'PUT' : 'POST';
   const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`
  },
  body: formData,
});

    if (response.ok) {
      setShowAddModal(false);
      setShowEditModal(false);
      toast.success(isEdit ? 'แก้ไขสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ');
      setNewProduct({
        title: '',
        description: '',
        condition: '',
        category: '',
        quantity: '',
        price: '',
        image: null,
      });
      fetchProducts();
    } else {
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  } catch (err) {
    console.error('Failed to submit product:', err);
    toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
  }
};


  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewProduct(prev => ({
        ...prev,
        image: file
      }))
    }
  }

const handleEditClick = (product) => {
  setNewProduct({
    title: product.title || '',
    description: product.description || '',
    category: product.category_id || '',
    quantity: product.quantity || '',
    condition: product.condition || '',
    price: product.price_yearly || product.price || '',
    image: product.image || null,
  })
  setEditProductId(product.id)
  setShowAddModal(true)
}

const handleDeleteClick = (id) => {
  setDeleteProductId(id);
  setShowConfirmDelete(true);
};

  const confirmDelete = async () => {
  const token = getToken();
  if (!token) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete/product`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: deleteProductId }),
    });

    if (response.ok) {
      toast.success('ลบสินค้าสำเร็จ');
      fetchProducts();
    } else {
      const data = await response.json();
      toast.error(data.message || 'ลบสินค้าไม่สำเร็จ');
    }
  } catch (error) {
    console.error('Failed to delete product:', error);
    toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
  } finally {
    setShowConfirmDelete(false);
    setDeleteProductId(null);
  }
};

const fetchCategories = useCallback(async () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/category`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error('❌ Failed to fetch categories:', response.status);
      return;
    }
    const data = await response.json();
    setCategories(data);
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
}, []);

useEffect(() => {
  fetchCategories();
}, [fetchCategories]);

const filteredProducts = products.filter((p) => {
  const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
  if (!matchSearch) return false;

  if (selectedCategory === 'all') return true;

  const selectedCat = categories.find(cat => cat.id.toString() === selectedCategory);

  if (!selectedCat) return false;

  if (selectedCat.parent_id === null) {
    if (selectedCat.name === 'software') {
      return p.category_id === selectedCat.id;
    }

    if (selectedCat.name === 'device') {
      const productCategory = categories.find(cat => cat.id === p.category_id);
      if (!productCategory) return false;

      return productCategory.id === selectedCat.id || productCategory.parent_id === selectedCat.id;
    }
  } else {
    return p.category_id === selectedCat.id;
  }

  return false;
});


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
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 kanit-regular">
                รายการสินค้าทั้งหมด
              </h1>
              <p className="text-xs md:text-sm text-gray-500 kanit-regular">
                จัดการสินค้าทั้งหมดของคุณได้ที่นี่
              </p>
            </div>
            <button
              className="w-full md:w-auto bg-[#009DB7] text-white px-4 py-2 rounded hover:bg-cyan-600 kanit-regular cursor-pointer text-sm md:text-base"
              onClick={() => {
                setShowAddModal(true)
                setEditProductId(null)
                setNewProduct({
                  title: '',
                  description: '',
                  condition: '',
                  category: '',
                  quantity: '',
                  price: '',
                  image: null,
                })
              }}
            >
              + เพิ่มสินค้าใหม่
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 kanit-regular text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded px-2 py-2 kanit-regular cursor-pointer text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">หมวดหมู่ทั้งหมด</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-6 gap-4 py-3 px-3 bg-[#009DB7] rounded-t-lg font-medium text-white text-sm kanit-regular">
              <div className="pl-12">รูปภาพ</div>
              <div>ชื่อสินค้า</div>
              <div>หมวดหมู่</div>
              <div>ราคา</div>
              <div>วันที่อัปเดต</div>
              <div>จัดการ</div>
            </div>

            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-6 gap-4 py-4 px-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex justify-center">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-16 w-16 object-contain rounded"
                    />
                  </div>
                  <div className="flex items-center">
                    <div className="font-medium text-gray-700 leading-tight kanit-regular text-left">
                      {product.title}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700 kanit-regular">
                    {product.parent_category === 'device'
                      ? product.category
                      : product.category === 'software'
                      ? 'Software'
                      : 'อื่นๆ'}
                  </div>
                  <div className="flex items-center text-gray-700 kanit-regular">
                    ฿
                    {parseFloat(product.price_yearly || product.price || 0).toLocaleString('en-US')}{' '}
                    {product.price_yearly ? '(License/ปี)' : ''}
                  </div>
                  <div className="flex items-center text-gray-700 kanit-regular">
                    {product.updated_at
                      ? new Date(product.updated_at).toLocaleDateString('th-TH')
                      : '-'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-[#009DB7] hover:text-cyan-600 cursor-pointer"
                      onClick={() => handleEditClick(product)}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-700 hover:text-red-800 cursor-pointer"
                      onClick={() => handleDeleteClick(product.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 kanit-regular">
                <p>ยังไม่มีสินค้าในระบบ</p>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-6 gap-4 py-3 px-3 bg-[#009DB7] rounded-t-lg font-medium text-white text-xs kanit-regular">
                  <div className="pl-4">รูปภาพ</div>
                  <div>ชื่อสินค้า</div>
                  <div>หมวดหมู่</div>
                  <div>ราคา</div>
                  <div>อัปเดต</div>
                  <div>จัดการ</div>
                </div>

                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-6 gap-4 py-3 px-3 border-b border-gray-100 hover:bg-gray-50 text-xs"
                    >
                      <div className="flex justify-center">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-12 w-12 object-contain rounded"
                        />
                      </div>
                      <div className="flex items-center">
                        <div className="font-medium text-gray-700 leading-tight kanit-regular text-left">
                          {product.title}
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700 kanit-regular">
                        {product.parent_category === 'device'
                          ? product.category
                          : product.category === 'software'
                          ? 'Software'
                          : 'อื่นๆ'}
                      </div>
                      <div className="flex items-center text-gray-700 kanit-regular">
                        ฿{parseFloat(product.price_yearly || product.price || 0).toLocaleString('en-US')}
                        {product.price_yearly && <div className="text-xs">(License/ปี)</div>}
                      </div>
                      <div className="flex items-center text-gray-700 kanit-regular">
                        {product.updated_at
                          ? new Date(product.updated_at).toLocaleDateString('th-TH', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })
                          : '-'}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          className="text-[#009DB7] hover:text-cyan-600 cursor-pointer"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-700 hover:text-red-800 cursor-pointer"
                          onClick={() => handleDeleteClick(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500 kanit-regular">
                    <p>ยังไม่มีสินค้าในระบบ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showConfirmDelete && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg text-center kanit-regular">
            <div className="flex items-center justify-center mx-auto mb-4 bg-cyan-100/50 rounded-full w-25 h-25">
            <img src={trashclear} className="h-12 w-12 object-contain block" />
            </div>
            <p className="mb-1 text-xl font-semibold text-gray-800 kanit-regular">
              ยืนยันการลบสินค้า
            </p>
            <p className="mb-3 text-l font-semibold text-gray-600 kanit-regular">
              คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>setShowConfirmDelete(false)}
                className="px-6 py-2 rounded-lg border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition kanit-regular cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 rounded-lg border border-cyan-600 bg-[#009DB7] text-white hover:bg-cyan-600 transition kanit-regular cursor-pointer"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/45 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 kanit-regular">
                {editProductId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditProductId(null)
                  setNewProduct({
                    title: '',
                    description: '',
                    condition: '',
                    category: '',
                    quantity: '',
                    price: '',
                    image: null,
                  })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-4 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {newProduct.image ? (
                    <img
                      src={
                        typeof newProduct.image === 'string'
                          ? newProduct.image
                          : URL.createObjectURL(newProduct.image)
                      }
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="text-sm text-gray-500 kanit-regular mb-1">อัปโหลดรูปภาพ</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 kanit-regular text-sm"
                >
                  เลือกไฟล์
                </label>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                      ชื่อสินค้า <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ระบุชื่อสินค้า"
                      value={newProduct.title}
                      onChange={(e) =>
                        setNewProduct((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 kanit-regular"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                      จำนวนสินค้า <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ระบุจำนวนสินค้า"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        setNewProduct((prev) => ({ ...prev, quantity: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 kanit-regular"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                      หมวดหมู่ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 kanit-regular"
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      <option value="1">Software</option>
                      <option value="3">Sensor</option>
                      <option value="4">CCTV</option>
                      <option value="5">Computer</option>
                      <option value="6">Wifi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                      ราคา (บาท) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct((prev) => ({ ...prev, price: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 kanit-regular"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                    รายละเอียดสินค้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุรายละเอียดสินค้า"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 kanit-regular"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 kanit-regular">
                    เงื่อนไข
                  </label>
                  <input
                    type="text"
                    placeholder="ระบุเงื่อนไข"
                    value={newProduct.condition}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, condition: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 kanit-regular"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditProductId(null)
                    setNewProduct({
                      title: '',
                      description: '',
                      condition: '',
                      category: '',
                      quantity: '',
                      price: '',
                      image: null,
                    })
                  }}
                  className="flex-1 px-4 py-2 border border-[#009DB7] text-[#009DB7] rounded-lg hover:bg-cyan-50 kanit-regular text-sm cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#009DB7] text-white rounded-lg hover:bg-cyan-600 kanit-regular text-sm cursor-pointer"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
  </div>
)
}

export default AdminProductManagement