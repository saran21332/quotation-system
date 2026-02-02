import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const UserTempPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, password } = location.state || {};
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!username || !password) {
      navigate('/login');
    }
  }, [username, password, navigate]);

  const handleLogin = async () => {
  setIsLoggingIn(true);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();

      sessionStorage.setItem('token', data.token);
      if (data.session_id) {
        sessionStorage.setItem('session_id', data.session_id);
      }

      const decoded = jwtDecode(data.token);
      const expiresAt = decoded.exp * 1000;
      const msUntilExpire = expiresAt - Date.now();

      if (msUntilExpire > 0) {
        setTimeout(() => {
          sessionStorage.clear();
          navigate('/login');
        }, msUntilExpire);
      } else {
        sessionStorage.clear();
        navigate('/login');
      }

      navigate('/home');
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
  } finally {
    setIsLoggingIn(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          onClick={() => navigate('/login')}
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#009DB7] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-cyan-100" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 kanit-regular">
            ยืนยันตัวตนสำเร็จ
          </h2>
          <p className="text-gray-600 text-sm kanit-regular">
            กรุณาใช้ข้อมูลด้านล่างในการเข้าสู่ระบบ
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 mx-2 kanit-regular">
            ชื่อผู้ใช้
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              readOnly
              className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 pr-10 text-sm kanit-regular"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 kanit-regular">
            รหัสผ่าน
          </label>
          <div className="relative">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 pr-10 text-sm kanit-regular"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
          <div className="flex">
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-sm text-yellow-800 kanit-regular">
                กรุณาอย่าปิดหน้าต่างเบราว์เซอร์ เพราะบัญชีของคุณจะสามารถใช้งานได้เพียง 1 ชั่วโมงหลังจากการล็อกอิน
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex-1 bg-[#009DB7] hover:bg-cyan-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-color kanit-regular cursor-pointer"
          >
            {isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบทันที'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 transition-colors kanit-regular cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTempPage;
