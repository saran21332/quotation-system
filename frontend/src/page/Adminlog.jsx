import { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/sidebar.jsx'
import Search from '../assets/search.png';
import Eye from '../assets/eye.png';

function Adminquotationlogs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [logs, setLogs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedMonth, setSelectedMonth] = useState('')

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

  const filteredLogs = logs
    .filter(log => {
      const logMonth = dayjs(log.created_at).format('MMMM YYYY');
      const matchesMonth = selectedMonth ? logMonth === selectedMonth : true;
      const matchesSearch =
        (log.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
      return matchesMonth && matchesSearch
    })
    .sort((a, b) => {
      const monthA = dayjs(a.created_at).startOf('month')
      const monthB = dayjs(b.created_at).startOf('month')
      return monthB.valueOf() - monthA.valueOf()
    })

  const fetchLogs = useCallback(async () => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quotation/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Unauthorized')

      const data = await res.json()
      if (Array.isArray(data)) {
        setLogs(data)
      } else {
        setLogs([])
        console.error('Unexpected data:', data)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      setLogs([])
    }
  }, [])

  useEffect(() => {
    fetchCartCount()
    fetchLogs()
  }, [fetchCartCount, fetchLogs])

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const displayedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const uniqueMonths = Array.from(
    new Set(logs.map(log => dayjs(log.created_at).format('MMMM YYYY')))
  ).sort((a, b) => dayjs(b, 'MMMM YYYY') - dayjs(a, 'MMMM YYYY'))

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          cartCount={cartCount}
          onCartUpdate={fetchCartCount}
        />

        <div className="p-3 md:p-6 mt-25 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6">
            <h1 className="text-lg md:text-xl font-medium mb-4 md:mb-6 text-gray-800 kanit-regular">ประวัติใบเสนอราคา</h1>

            <div className="flex flex-col md:flex-row items-stretch md:items-center mb-4 md:mb-6 gap-3 md:gap-4">
              <div className="relative flex-1 max-w-full md:max-w-5xl">
                <input
                  type="text"
                  placeholder="ค้นหาใบเสนอราคา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent kanit-regular text-sm md:text-base"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <img src={Search} alt="Search" className="w-4 h-4 opacity-60" />
                </div>
              </div>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent bg-white kanit-regular text-sm md:text-base"
              >
                <option value="">ทุกเดือน</option>
                {uniqueMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:block">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full table-fixed">
                  <thead className="bg-[#009DB7]">
                    <tr>
                      <th className="w-32 px-4 py-3 text-left text-white kanit-regular">วันที่</th>
                      <th className="w-40 px-4 py-3 text-left text-white kanit-regular">เลขที่</th>
                      <th className="w-64 px-4 py-3 text-left text-white kanit-regular">ลูกค้า</th>
                      <th className="w-48 px-4 py-3 text-left text-white kanit-regular">ผู้รับผิดชอบ</th>
                      <th className="w-32 px-4 py-3 text-left text-white kanit-regular">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {displayedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 kanit-regular">
                          {(() => {
                            const date = new Date(log.created_at)
                            const day = String(date.getDate()).padStart(2, '0')
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const year = date.getFullYear()
                            return `${day}/${month}/${year}`
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 kanit-regular text-left">
                          {log.quotation_number || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 kanit-regular">
                          {log.customer_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 kanit-regular">
                          {log.user_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <button
                              onClick={() => {
                              if (log.pdf_filename) {
                                const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/pdfs/${log.pdf_filename}`;
                                window.open(pdfUrl, "_blank");
                              } else {
                                alert("ไม่พบข้อมูลสำหรับเปิด PDF");
                              }
                              }}
                            >
                              <img src={Eye} alt="ดู" className="w-6 h-6 cursor-pointer ml-1" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-3">
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log) => (
                  <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 kanit-regular mb-1">
                          {log.customer_name}
                        </div>
                        <div className="text-xs text-gray-500 kanit-regular mb-1">
                          เลขที่: {log.quotation_number || '-'}
                        </div>
                        <div className="text-xs text-gray-500 kanit-regular">
                          ผู้รับผิดชอบ: {log.user_name}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (log.customer_tel) {
                            const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/pdfs/${log.customer_tel}.pdf`;
                            window.open(pdfUrl, '_blank');
                          } else {
                            alert('ไม่มีไฟล์ PDF ให้เปิด');
                          }
                        }}
                        className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <img src={Eye} alt="ดู" className="w-5 h-5 cursor-pointer" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-600 kanit-regular pt-2 border-t border-gray-100">
                      <div className="text-gray-500">
                        {(() => {
                          const date = new Date(log.created_at)
                          const day = String(date.getDate()).padStart(2, '0')
                          const month = String(date.getMonth() + 1).padStart(2, '0')
                          const year = date.getFullYear()
                          return `${day}/${month}/${year}`
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 kanit-regular">
                  ไม่มีข้อมูลใบเสนอราคา
                </div>
              )}
            </div>

            {totalPages > 0 && (
              <div className="mt-4 md:mt-6 flex justify-center items-center gap-1 md:gap-2">
                <button
                  className="px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors kanit-regular cursor-pointer text-xs md:text-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  &lt;
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  if (window.innerWidth < 768) {
                    if (
                      i === 0 ||
                      i === totalPages - 1 ||
                      Math.abs(i + 1 - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={i}
                          className={`px-2 md:px-3 py-1 md:py-2 border rounded-md transition-colors text-xs md:text-sm ${currentPage === i + 1
                            ? 'bg-[#009DB7] text-white border-[#009DB7] kanit-regular cursor-pointer'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 kanit-regular cursor-pointer'
                            }`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      )
                    } else if (i === 1 && currentPage > 3) {
                      return <span key={i} className="px-1 text-gray-400">...</span>
                    } else if (i === totalPages - 2 && currentPage < totalPages - 2) {
                      return <span key={i} className="px-1 text-gray-400">...</span>
                    }
                    return null
                  } else {
                    return (
                      <button
                        key={i}
                        className={`px-2 md:px-3 py-1 md:py-2 border rounded-md transition-colors text-xs md:text-sm ${currentPage === i + 1
                          ? 'bg-[#009DB7] text-white border-[#009DB7] kanit-regular cursor-pointer'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 kanit-regular cursor-pointer'
                          }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    )
                  }
                })}

                <button
                  className="px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs md:text-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Adminquotationlogs