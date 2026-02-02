import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/sidebar.jsx';

function Quotationedit() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [discount_percent, setdiscount_percent] = useState(0)
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerTel, setCustomerTel] = useState('');
  const [customerFax, setCustomerFax] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [description, setDescription] = useState('');
  const [validity, setValidity] = useState('');
  const [remark, setRemark] = useState('');
  const [signLeftName, setSignLeftName] = useState('');
  const [signLeftTitle, setSignLeftTitle] = useState('');
  const [approvedByName, setApprovedByName] = useState('');
  const [approvedByTitle, setApprovedByTitle] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

  const fetchCartCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) return alert('กรุณาเข้าสู่ระบบ');

    const payload = {
      customer_name: customerName,
      customer_company: customerCompany,
      customer_address: customerAddress,
      customer_tel: customerTel,
      customer_fax: customerFax,
      customer_email: customerEmail,
      discount_percent: Number(discount_percent),
      remark,
      validity_days: Number(validity),
      use_default_remark: false,
      use_default_validity: false,
      use_default_sign: false,
      sign_left_name: signLeftName,
      sign_left_title: signLeftTitle,
      approved_by_name: approvedByName,
      approved_by_title: approvedByTitle,
      confirmed_by_title: 'confirmed to purchase',
      product_descriptions: {
        1: description,
      },
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

      if (!res.ok) throw new Error('ไม่สามารถสร้างใบเสนอราคาได้');

      const result = await res.json();
      if (result.pdf_url) {
        window.open(`${result.pdf_url}`, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการสร้างใบเสนอราคา');
    }
  };

    const fetchCartProducts = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        if (!response.ok) throw new Error('Failed to fetch cart products');

        const data = await response.json();
        if (!Array.isArray(data.cart)) {
        throw new Error('API response cart is not an array');
        }

        const mappedProducts = data.cart.map(item => ({
        id: item.product_id,
        name: item.product_name.trim(),
        }));

        setProducts(mappedProducts);
    } catch (error) {
        console.error('Error fetching cart products:', error);
    }
    }, []);

    useEffect(() => {
    fetchCartProducts();
    }, [fetchCartProducts]);

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
        <div className="flex-1 p-6 mt-23 overflow-auto">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-5 w-full">
                <h1 className="text-lg font-normal text-gray-700 kanit-regular mb-6 kanit-regular ">แก้ไขใบเสนอราคา</h1>
                <hr className="border-gray-300 mb-6" />
                <div>
                <label className="block text-sm text-gray-600 mb-2 kanit-regular ">ชื่อบริษัท</label>

                <input 
                    placeholder="กรอกชื่อบริษัท" 
                    value={customerCompany} 
                    onChange={(e) => setCustomerCompany(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular "
                />
                </div>

                <div>
                <label className="block text-sm text-gray-600 mb-2 kanit-regular ">ที่อยู่</label>
                <textarea 
                    placeholder="123 ถนน สุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110" 
                    value={customerAddress} 
                    onChange={(e) => setCustomerAddress(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent resize-none kanit-regular " 
                    rows="3"
                />
                </div>

                <div>
                <label className="block text-sm text-gray-600 mb-2 kanit-regular ">ชื่อผู้ลูกค้า <span className="text-red-500">*</span></label>
                <input 
                    required 
                    placeholder="กรอกชื่อลูกค้า" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular "
                />
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular ">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                    <input 
                    required 
                    placeholder="02-123-4567" 
                    value={customerTel} 
                    onChange={(e) => setCustomerTel(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular "
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular ">โทรสาร (FAX)</label>
                    <input 
                    placeholder="02-123-4568" 
                    value={customerFax} 
                    onChange={(e) => setCustomerFax(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular "
                    />
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular">อีเมล <span className="text-red-500">*</span></label>
                    <input
                    required
                    type="email"
                    placeholder="example@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular">ส่วนลด (%)</label>
                    <input
                    type="number"
                    placeholder="10"
                    value={discount_percent}
                    onChange={(e) => setdiscount_percent(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                    />
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular">เลือก Product ที่จะแก้ชื่อ</label>
                    <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                    >
                    <option value="">-- เลือกสินค้า --</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                        {p.name}
                        </option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular">ชื่อใหม่ของ Product</label>
                    <input
                    placeholder="เช่น Smart City Platform"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                    />
                </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular ">Validity</label>
                    <input 
                    placeholder="30 Day" 
                    value={validity} 
                    onChange={(e) => setValidity(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular "
                    />
                </div>
                </div>

                <div>
                <label className="block text-sm text-gray-600 mb-2 kanit-regular ">Remark</label>
                <textarea 
                    placeholder="All prices are in Thai Baht. Exclude VAT. Prices are for software licenses only. Delivery via download (if applicable). Not include installation, customization, training, or on-site service. If You received support as per vendor policy." 
                    value={remark} 
                    onChange={(e) => setRemark(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent resize-none kanit-regular " 
                    rows="4"
                />
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular ">Name</label>
                    <input 
                    placeholder="Chatikarn Sumas" 
                    value={signLeftName} 
                    onChange={(e) => setSignLeftName(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular "
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular ">Marketing Specialist (Job Title)</label>
                    <input 
                    placeholder="Marketing Specialist" 
                    value={signLeftTitle} 
                    onChange={(e) => setSignLeftTitle(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular "
                    />
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular ">Approved By</label>
                    <input 
                    placeholder="Weerapha Wannachaem" 
                    value={approvedByName} 
                    onChange={(e) => setApprovedByName(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular "
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-2 kanit-regular ">Approver (Job Title)</label>
                    <input 
                    placeholder="Chief Operations Officer" 
                    value={approvedByTitle} 
                    onChange={(e) => setApprovedByTitle(e.target.value)} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular"
                    />
                </div>
                </div>

                <button 
                type="submit" 
                className="w-full bg-[#009DB7] text-white py-2.5 px-4 rounded-md hover:bg-cyan-600 transition-colors duration-200 text-sm font-medium mt-6 kanit-regular cursor-pointer"
                >
                พิมพ์ใบเสนอราคา
                </button>
            </form>
            </div>
      </div>
    </div>
  );
}

export default Quotationedit;