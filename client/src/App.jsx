import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import MenuView from './pages/MenuViewNew'
import CartPage from './pages/CartPage'
import Dashboard from './pages/Dashboard'
import MenuManagement from './pages/MenuManagement'
import QRCodeGenerator from './pages/QRCodeGenerator'
import { LanguageProvider } from './i18n/LanguageContext'

// Cart state is shared via context so any page can read/modify it
export const CartContext = React.createContext()

function App() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('qr-menu-cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('qr-menu-cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => (cartItem._id || cartItem.id) === (item._id || item.id))
      if (existingItem) {
        return prev.map(cartItem =>
          (cartItem._id || cartItem.id) === (item._id || item.id)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => (item._id || item.id) !== itemId))
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        (item._id || item.id) === itemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <LanguageProvider>
      <CartContext.Provider value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal
      }}>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<MenuView />} />
            <Route path="/menu" element={<MenuView />} />
            <Route path="/menu/:slug" element={<MenuView />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:slug" element={<Dashboard />} />
            <Route path="/menu-management" element={<MenuManagement />} />
            <Route path="/menu-management/:slug" element={<MenuManagement />} />
            <Route path="/qr-codes" element={<QRCodeGenerator />} />
            <Route path="/qr-codes/:slug" element={<QRCodeGenerator />} />
          </Routes>
        </div>
      </CartContext.Provider>
    </LanguageProvider>
  )
}

export default App