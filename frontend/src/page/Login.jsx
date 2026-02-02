import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom'; 
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
  setIsLoading(true);
  setError('');

  try {
    const apiUrl = activeTab === 'login'
      ? `${import.meta.env.VITE_API_BASE_URL}/api/login`
      : `${import.meta.env.VITE_API_BASE_URL}/api/request/otp`;
    const body = activeTab === 'login'
      ? { username: formData.username, password: formData.password }
      : { email: formData.email, name: formData.name, phone: formData.phone };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      if (activeTab === 'login') {
        if (data.token) {
          const decoded = jwtDecode(data.token);
          const expiresAt = decoded.exp * 1000;
          const msUntilExpire = expiresAt - Date.now();

          const storage = data.temp_user ? sessionStorage : localStorage;
          storage.setItem('token', data.token);
          if (data.session_id) {
            storage.setItem('session_id', data.session_id);
          }

          setTimeout(() => {
            storage.clear();
            window.location.href = '/login'; 
          }, msUntilExpire);

          navigate('/Home');
        } else {
          setError('ระบบผิดพลาด: ไม่พบ token');
        }
      } else {
        const expiresIn = 300;
        const timestamp = Date.now();

        navigate('/Confirm/OTP', {
          state: {
            otpToken: data.otp_token,
            email: formData.email,
            expiresAt: timestamp + expiresIn * 1000,
          }
        });
      }
    } else {
      setError(data.message || 'เข้าสู่ระบบล้มเหลว');
    }
  } catch (err) {
    setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
  } finally {
    setIsLoading(false);
  }
};

   return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src={logo} alt="PlanetCloud Logo" className="mx-auto w-40 h-auto" />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
                setFormData({ username: '', password: '', email: '', name: '', phone: '' });
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium focus:outline-none ${
                activeTab === 'login'
                  ? 'text-[#009DB7] border-b-2 border-[#009DB7]  pb-4 pt-4 bg-white kanit-regular'
                  : 'text-gray-500 border-b-2 border-gray-200  pb-4 pt-4 hover:text-gray-700 bg-white kanit-regular'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError('');
                setFormData({ username: '', password: '', email: '', name: '', phone: '' });
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium focus:outline-none ${
                activeTab === 'register'
                  ? 'text-[#009DB7] border-b-2 border-[#009DB7] pb-4 pt-4 bg-white kanit-regular'
                  : 'text-gray-500 border-b-2 border-gray-200  pb-4 pt-4 hover:text-gray-700 bg-white kanit-regular'
              }`}
            >
              ลงทะเบียน
            </button>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold text-gray-800 mb-2 kanit-regular">
                {activeTab === 'login' ? 'ยินดีต้อนรับกลับมา' : 'ลงทะเบียนผ่านอีเมล'}
              </h2>
              <p className="text-gray-600 text-sm kanit-regular">
                {activeTab === 'login'
                  ? 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ'
                  : 'เราจะส่งรหัส OTP ไปยังอีเมลของคุณ'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {activeTab === 'login' ? (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 mx-2 -mt-2 kanit-regular">
                      ชื่อผู้ใช้
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="กรอกชื่อผู้ใช้ของคุณ"
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-xs kanit-regular"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 mx-2 kanit-regular">
                      รหัสผ่าน
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="กรอกรหัสผ่านของคุณ"
                        className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-xs kanit-regular"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 mx-2 kanit-regular">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="กรอกชื่อและนามสกุล"
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-xs kanit-regular"
                    required
                  />
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 mx-2 kanit-regular mt-3">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="กรอกเบอร์โทรศัพท์"
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-xs kanit-regular"
                    required
                  />
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 mx-2 kanit-regular mt-3">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="กรอกอีเมลของคุณ"
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-xs kanit-regular"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md kanit-regular">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isLoading ||
                  (activeTab === 'login' && (!formData.username || !formData.password)) ||
                  (activeTab === 'register' && (!formData.email || !formData.name || !formData.phone))
                }
                className="w-full bg-[#009DB7] text-white py-2 px-4 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors kanit-regular cursor-pointer"
              >
                {isLoading
                  ? activeTab === 'login'
                    ? 'กำลังเข้าสู่ระบบ...'
                    : 'กำลังส่ง OTP...'
                  : activeTab === 'login'
                    ? 'เข้าสู่ระบบ'
                    : 'ขอรับ OTP'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
