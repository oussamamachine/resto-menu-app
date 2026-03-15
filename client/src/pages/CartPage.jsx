import React, { useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CartContext } from '../App'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'

export default function CartPage() {
  const { slug } = useParams()
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useContext(CartContext)
  const { translations: t } = useLanguage()
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedTableNumber = localStorage.getItem('tableNumber')
    if (savedTableNumber) {
      setTableNumber(savedTableNumber)
    }
  }, [])

  const sendOrder = async () => {
    if (cart.length === 0) return
    setSending(true)
    try {
      const payload = {
        restaurantSlug: slug || 'sunrise-cafe',
        customerName: customerName || 'Guest',
        tableNumber: tableNumber || 'N/A',
        notes,
        items: cart.map(item => ({
          _id: item._id || item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        total: cartTotal
      }
  await api.post('/api/orders', payload)
      setSuccess(true)
      clearCart()
      setTimeout(() => navigate(`/menu/${slug || 'sunrise-cafe'}`), 2500)
    } catch (e) {
      alert('Failed to send order. Please try again.')
      setSending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f1ed] px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            {t.orderConfirmed}
          </h2>
          <p className="text-gray-600 mb-2">
            {t.orderSentToKitchen}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {t.weWillPrepare}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#d4825c] animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-4">{t.redirectingToMenu}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/menu/${slug || 'sunrise-cafe'}`}>
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl hover:bg-gray-200 transition-colors">
                ←
              </button>
            </Link>
            <h1 className="text-lg font-bold text-gray-800">{t.yourCart}</h1>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="px-4 pb-32 pt-4">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">{t.cartEmpty}</h2>
            <p className="text-gray-600 mb-8">{t.addItemsFromMenu}</p>
            <Link to={`/menu/${slug || 'sunrise-cafe'}`}>
              <button className="bg-[#d4825c] hover:bg-[#c87550] text-white px-8 py-3 rounded-2xl font-medium shadow-md">
                {t.browseMenu}
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            {cart.map(item => (
              <div key={item._id || item.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex gap-3">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0" 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{item.title}</h3>
                    <p className="text-sm text-[#d4825c] font-semibold mb-3">€{item.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center font-bold text-gray-700 shadow-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center font-bold text-gray-700 shadow-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">€{(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item._id || item.id)}
                          className="text-xs text-red-600 hover:text-red-700 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Order Form */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mt-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">{t.yourDetails}</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">{t.name}</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t.enterYourName}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d4825c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    {t.tableNumber}
                    {tableNumber && (
                      <span className="ml-2 text-xs text-green-600 font-semibold">
                        ✓ {t.autoFilledFromQR}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    readOnly
                    placeholder={tableNumber ? '' : t.enterTableNumber}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
                    title="Table number is automatically filled from the QR code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">{t.specialRequests}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.anySpecialInstructions}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d4825c] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{t.total}</span>
            <span className="text-2xl font-bold text-[#d4825c]">€{cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={sendOrder}
            disabled={sending}
            className="w-full bg-[#d4825c] hover:bg-[#c87550] text-white rounded-2xl py-4 font-bold text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? t.sendingOrder : t.confirmOrder}
          </button>
        </div>
      )}
    </div>
  )
}
