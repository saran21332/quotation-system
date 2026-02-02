import { Home, Package, FileText, LogOut, Clock, Menu, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import logout from '../assets/logout.png';

export default function Sidebar() {
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()
  const [username, setUsername] = useState('Admin')
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUsername(decoded.username || decoded.name || 'Admin')
      } catch (error) {
        console.error('ไม่สามารถ decode token ได้:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="fixed bottom-5 right-4 z-[60] bg-[#009DB7] text-white p-3 rounded-full shadow-lg"
          style={{ zIndex: 60 }}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/25"
          style={{ zIndex: 55 }}
          onClick={closeMobileMenu}
        />
      )}

      <div className="hidden md:flex w-64 bg-white shadow-lg flex-col mt-26">
        <div className="bg-[#009DB7] text-white px-4 py-3">
          <div className="font-medium text-lg kanit-regular">Admin Dashboard</div>
        </div>
        <div className="p-6 text-center border-b border-gray-200">
          <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-[#009DB7] font-bold text-2xl kanit-regular">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="font-medium text-gray-800 kanit-regular">{username}</div>
        </div>

        <nav className="flex-1 p-4 pl-0">
          <ul className="space-y-1 kanit-regular">
            <li>
              <a
                href="/Home"
                className={`flex items-center space-x-3 pr-3 py-2 rounded-r-xl ${
                  currentPath === '/Home'
                    ? 'pl-3 bg-[#009DB7] text-white'
                    : 'pl-3 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>หน้าหลัก</span>
              </a>
            </li>

            <li>
              <a
                href="/Admin"
                className={`flex items-center space-x-3 pr-3 py-2 rounded-r-4xl ${
                  currentPath === '/Admin'
                    ? 'pl-3 bg-[#009DB7] text-white'
                    : 'pl-3 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>จัดการสินค้า</span>
              </a>
            </li>

            <li>
              <a
                href="/Admin/quotation"
                className={`flex items-center space-x-3 px-3 py-2 rounded-r-4xl ${
                  currentPath.startsWith('/Admin/quotation')
                    ? 'bg-[#009DB7] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>ออกใบเสนอราคา</span>
              </a>
            </li>

            <li>
              <a
                href="/Admin/history"
                className={`flex items-center space-x-3 px-3 py-2 rounded-r-4xl ${
                  currentPath === '/Admin/history'
                    ? 'bg-[#009DB7] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>ประวัติ</span>
              </a>
            </li>

            <li>
              <button
                onClick={() => setShowConfirmLogout(true)}
                className="flex items-center space-x-3 px-3 py-2 rounded-r-4xl text-gray-700 hover:bg-gray-100 w-full text-left"
                type="button"
              >
                <LogOut className="w-5 h-5" />
                <span>ออกจากระบบ</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div 
        className={`md:hidden fixed top-0 left-0 w-72 bg-white shadow-lg flex flex-col h-full z-[58] transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 58 }}
      >
        <div className="bg-[#009DB7] text-white px-4 py-4 pt-20">
        <div className="font-medium text-lg kanit-regular">Admin Dashboard</div>
        </div>
        
        <div className="p-4 text-center border-b border-gray-200">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-[#009DB7] font-bold text-xl kanit-regular">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="font-medium text-gray-800 kanit-regular text-sm">{username}</div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2 kanit-regular">
            <li>
              <a
                href="/Home"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  currentPath === '/Home'
                    ? 'bg-[#009DB7] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>หน้าหลัก</span>
              </a>
            </li>

            <li>
              <a
                href="/Admin"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  currentPath === '/Admin'
                    ? 'bg-[#009DB7] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>จัดการสินค้า</span>
              </a>
            </li>

            <li>
              <a
                href="/Admin/quotation"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  currentPath.startsWith('/Admin/quotation')
                    ? 'bg-[#009DB7] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>ออกใบเสนอราคา</span>
              </a>
            </li>

            <li>
              <a
                href="/Admin/history"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  currentPath === '/Admin/history'
                    ? 'bg-[#009DB7] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>ประวัติ</span>
              </a>
            </li>

            <li>
              <button
                onClick={() => {
                  setShowConfirmLogout(true)
                  closeMobileMenu()
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full text-left"
                type="button"
              >
                <LogOut className="w-5 h-5" />
                <span>ออกจากระบบ</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {showConfirmLogout && (
        <div className="fixed inset-0 z-[70] bg-black/25 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-4 md:p-6 shadow-lg text-center kanit-regular">
            <div className="flex items-center justify-center mx-auto mb-4 bg-cyan-100/50 rounded-full w-20 h-20">
              <img src={logout} className="h-10 w-10 md:h-12 md:w-12 object-contain block" />
            </div>
            <p className="mb-1 text-lg md:text-xl font-semibold text-gray-800 kanit-regular">
              ออกจากระบบ
            </p>
            <p className="mb-3 text-base md:text-lg font-semibold text-gray-600 kanit-regular">
              คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
            </p>
            <div className="flex flex-col justify-center gap-2">
              <button
                onClick={() => {
                  handleLogout();
                  setShowConfirmLogout(false);
                }}
                className="w-full px-4 py-2 rounded-lg border border-cyan-600 bg-[#009DB7] text-white hover:bg-cyan-600 transition kanit-regular cursor-pointer text-sm md:text-base"
              >
                ยืนยันการออกจากระบบ
              </button>
              <button
                onClick={() => {
                  setShowConfirmLogout(false);
                }}
                className="w-full px-4 py-2 rounded-lg border border-cyan-600 text-cyan-600 hover:bg-cyan-50 transition kanit-regular cursor-pointer text-sm md:text-base"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}