import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import HeroSection from '../components/HeroSection.jsx'
import ProductCart from '../components/ProductCard.jsx'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [cartCount, setCartCount] = useState(0)

  const getToken = () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token')
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const decoded = jwtDecode(token)
      const expiresAt = decoded.exp * 1000
      if (expiresAt < Date.now()) {
        sessionStorage.clear()
        localStorage.clear()
        navigate('/login')
      } else {
        const timeout = setTimeout(() => {
          sessionStorage.clear()
          localStorage.clear()
          navigate('/login')
        }, expiresAt - Date.now())

        return () => clearTimeout(timeout)
      }
    } catch (err) {
      console.log(err)
      sessionStorage.clear()
      localStorage.clear()
      navigate('/login')
    }
  }, [navigate])

  const fetchCartCount = useCallback(async () => {
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.count)
      }
    } catch (err) {
      console.error('Failed to fetch cart count:', err)
    }
  }, [])

  useEffect(() => {
    fetchCartCount()
  }, [fetchCartCount])

  return (
    <>
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartCount={cartCount}
        onCartUpdate={fetchCartCount}
      />
      <HeroSection />
      <ProductCart
        searchTerm={searchTerm}
        cartCount={cartCount}
        setCartCount={setCartCount}
      />
    </>
  )
}

export default Home
