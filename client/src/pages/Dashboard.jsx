import React, { useEffect, useState } from 'react'
import { api, getSocketUrl } from '../lib/api'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import OrderCard from '../components/OrderCard'

export default function Dashboard() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState(null)
  const [adminKey, setAdminKey] = useState('')
  const [inputKey, setInputKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const restaurantSlug = slug || 'sunrise-cafe'

  useEffect(() => {
    const storedKey = localStorage.getItem('adminKey')
    const storedSlug = localStorage.getItem('adminSlug')

    if (storedKey && storedSlug === restaurantSlug) {
      setAdminKey(storedKey)
      setAuthenticated(true)
      return
    }

    // Support ?key= in URL for backward compatibility
    const keyFromUrl = searchParams.get('key')
    const authFromUrl = searchParams.get('auth')

    if (keyFromUrl) {
      setAdminKey(keyFromUrl)
      setAuthenticated(true)
      localStorage.setItem('adminKey', keyFromUrl)
      localStorage.setItem('adminSlug', restaurantSlug)
    } else if (authFromUrl === 'true') {
      // Development fallback using the default key
      setAdminKey('changeme')
      setAuthenticated(true)
      localStorage.setItem('adminKey', 'changeme')
      localStorage.setItem('adminSlug', restaurantSlug)
    }
  }, [searchParams, restaurantSlug])

  useEffect(() => {
    if (!authenticated) return

    fetchData()

    // Poll for new orders every 5 seconds as a fallback to socket updates
    const interval = setInterval(fetchOrders, 5000)

    const socket = io(getSocketUrl())
    
    socket.on('ordersUpdated', (data) => {
      if (data.restaurantSlug === restaurantSlug) {
        fetchOrders()
      }
    })
    
    return () => {
      clearInterval(interval)
      socket.disconnect()
    }
  }, [authenticated, restaurantSlug, adminKey])

  const fetchData = async () => {
    try {
      const resRestaurant = await api.get(`/api/restaurant?slug=${restaurantSlug}`)
      setRestaurant(resRestaurant.data)
      await fetchOrders()
    } catch (e) {
      console.error('Failed to load data', e)
      if (e.response?.status === 401) {
        setAuthenticated(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/api/orders?slug=${restaurantSlug}&key=${adminKey}`)
      setOrders(res.data)
    } catch (e) {
      console.error('Failed to fetch orders', e)
    }
  }

  const handleMarkDone = async (orderId) => {
    try {
      await api.delete(`/api/orders/${orderId}?key=${adminKey}&slug=${restaurantSlug}`)
      await fetchOrders()
    } catch (e) {
      console.error('Failed to mark order as done:', e)
      alert('Failed to mark order as done')
    }
  }

  const handleLogin = async () => {
    if (!inputKey) {
      setLoginError('Please enter your admin key')
      return
    }
    
    setLoggingIn(true)
    setLoginError('')
    
    try {
      const res = await api.post('/api/restaurant/verify-admin', {
        slug: restaurantSlug,
        adminKey: inputKey
      })

      if (res.data.success) {
        setAdminKey(inputKey)
        setAuthenticated(true)
        localStorage.setItem('adminKey', inputKey)
        localStorage.setItem('adminSlug', restaurantSlug)
      } else {
        setLoginError('Invalid admin key')
      }
    } catch (e) {
      if (e.response?.status === 401) {
        setLoginError('Invalid admin key')
      } else if (e.response?.status === 404) {
        setLoginError('Restaurant not found')
      } else {
        setLoginError('Unable to verify admin key. Please try again.')
      }
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setAdminKey('')
    setInputKey('')
    localStorage.removeItem('adminKey')
    localStorage.removeItem('adminSlug')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f5f1ed] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          {/* Logo/Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d4825c] to-[#c87550] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">🔐</span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
            Restaurant Dashboard
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Enter your admin key to access the dashboard
          </p>
          
          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Admin Key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value)
                setLoginError('')
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your admin key"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d4825c] focus:border-transparent transition-all"
              disabled={loggingIn}
            />
            {loginError && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{loginError}</span>
              </p>
            )}
          </div>
          
          {/* Login Button */}
          <button 
            onClick={handleLogin} 
            disabled={loggingIn}
            className="w-full bg-[#d4825c] hover:bg-[#c87550] text-white rounded-xl py-4 font-bold text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingIn ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></span>
                <span>Verifying...</span>
              </span>
            ) : (
              'Access Dashboard'
            )}
          </button>
          
          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-800 text-center">
              🔒 Secure admin access only
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const activeOrders = orders.filter(o => o.status !== 'done')
  const doneOrders = orders.filter(o => o.status === 'done')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {restaurant?.name || 'Restaurant'} Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <span>📊</span>
                <span>Manage incoming orders</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/qr-codes?auth=true`}>
                <button className="btn-secondary inline-flex items-center gap-2">
                  <span>📱</span>
                  <span className="hidden sm:inline">QR Codes</span>
                </button>
              </Link>
              <Link to={`/menu-management?auth=true`}>
                <button className="btn-secondary inline-flex items-center gap-2">
                  <span>🍽️</span>
                  <span className="hidden sm:inline">Menu</span>
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Active Orders</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {activeOrders.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Active Orders */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Active Orders ({activeOrders.length})
            </h2>
            {activeOrders.length > 0 && (
              <span className="badge badge-primary animate-pulse">🔔 Live</span>
            )}
          </div>
          {activeOrders.length === 0 ? (
            <div className="card text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No active orders at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map(order => (
                <OrderCard key={order._id} order={order} onMarkDone={handleMarkDone} />
              ))}
            </div>
          )}
        </div>

        {/* Completed Orders */}
        {doneOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-green-600 to-green-700 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                Completed Orders ({doneOrders.length})
              </h2>
              <span className="badge badge-success">✓</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
              {doneOrders.map(order => (
                <OrderCard key={order._id} order={order} onMarkDone={handleMarkDone} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
