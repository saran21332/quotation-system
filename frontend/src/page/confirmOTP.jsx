import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, X } from 'lucide-react';
import logo from '../assets/logo.png';

export default function OTPConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otpToken, setOtpToken] = useState(location.state?.otpToken || '');
  const [expiresAt, setExpiresAt] = useState(location.state?.expiresAt || Date.now() + 5 * 60 * 1000);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!otpToken || !email || !expiresAt) {
      navigate('/');
    }
  }, [otpToken, email, expiresAt, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (resendCooldown === 0) {
      setResendMsg('');
    }
  }, [resendCooldown]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(1, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      setError('');
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasteData.length === 6) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      setError('');
      inputRefs.current[5]?.focus();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('กรุณากรอก OTP ให้ครบ 6 หลัก');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/verify/otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp_token: otpToken, otp: otpString }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const { username, password } = data;
        navigate('/user/temp', {
          state: { username, password },
        });
      } else {
        setError(data.message || 'การยืนยัน OTP ล้มเหลว');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/resend/otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp_token: otpToken }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setOtpToken(data.otp_token);
        const newExpiresAt = Date.now() + 5 * 60 * 1000;
        setExpiresAt(newExpiresAt);
        setOtp(['', '', '', '', '', '']);
        setResendMsg('ส่งอีเมลเรียบร้อยแล้ว');
        setResendCooldown(300);
        setError('');
      } else {
        setError(data.message || 'การส่ง OTP ใหม่ล้มเหลว');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center -mb-10">
        <div className="inline-flex items-center justify-center">
          <img src={logo} alt="PlanetCloud Logo" className="w-45 h-45 mr-3 object-contain" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 kanit-regular"
        >
          <X size={24} />
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 kanit-regular">ยืนยันตัวตน</h2>
        </div>
        <div className="flex justify-center mb-6 -mt-2">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#009DB7]" />
          </div>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 -mt-2 kanit-regular">
            กรุณากรอกรหัส OTP
          </h3>
          <p className="text-gray-600 text-sm mb-1 kanit-regular">
            รหัส OTP ได้ถูกส่งไปยังอีเมล
          </p>
          <p className="text-[#009DB7] font-medium kanit-regular">{email}</p>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={false}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#009DB7] focus:border-transparent kanit-regular"
                  maxLength={1}
                />
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-3 text-center kanit-regular">
                {error}
              </p>
            )}
          </div>
          <div className="text-center mb-6">
            {resendCooldown > 0 && resendMsg ? (
              <p className="text-green-600 text-sm kanit-regular">
                {resendMsg} ({formatTime(resendCooldown)})
              </p>
            ) : (
              <p className="text-gray-600 text-sm kanit-regular">
                ไม่ได้รับรหัส?
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-[#009DB7] hover:text-cyan-600 font-medium ml-1 kanit-regular cursor-pointer"
                >
                  ส่งรหัสอีกครั้ง
                </button>
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors cursor-pointer ${
              isLoading || otp.join('').length !== 6
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#009DB7] hover:bg-cyan-600'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 kanit-regular"></div>
                กำลังยืนยัน...
              </div>
            ) : (
              'ยืนยัน'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}