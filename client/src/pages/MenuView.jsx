import React, { useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CartContext } from '../App'

export default function MenuView() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const { cart, addToCart } = useContext(CartContext)
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableNumber, setTableNumber] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [restaurant, setRestaurant] = useState({ 
    name: 'Restaurant', 
    logoUrl: '', 
    slug: 'restaurant' 
  })

  useEffect(() => {
    // Get table number from URL if present
    const tableParam = searchParams.get('table')
    if (tableParam) {
      setTableNumber(tableParam)
      // Store in localStorage so it persists when going to cart
      localStorage.setItem('tableNumber', tableParam)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchData() {
      try {
        const restaurantSlug = slug || 'sunrise-cafe'
        
        // Fetch restaurant info
  const resRestaurant = await api.get(`/api/restaurant?slug=${restaurantSlug}`)
        if (resRestaurant.data) setRestaurant(resRestaurant.data)

        // Fetch menu
  const resMenu = await api.get(`/api/menu?slug=${restaurantSlug}`)
        setMenu(resMenu.data)
      } catch (e) {
        console.error('Fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const handleAddToCart = (item) => {
    addToCart(item)
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Get unique categories
  const categories = ['All', ...new Set(menu.map(item => item.category).filter(Boolean))]

  // Filter menu by category
  const filteredMenu = activeCategory === 'All' 
    ? menu 
    : menu.filter(item => item.category === activeCategory)

  // Group by category for display
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      {/* Mobile-First Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl shadow-md">
                ☕
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {restaurant.name}
                </h1>
                {tableNumber && (
                  <p className="text-xs text-gray-500">Table {tableNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-[#d4825c] text-white shadow-md'
                    : 'bg-white text-[#d4825c] border border-[#d4825c]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-32">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#d4825c] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading menu...</p>
          </div>
        ) : (
          <>
            {Object.keys(groupedMenu).map(category => (
              <div key={category} className="mt-6">
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🍽️</span>
                  <h2 className="text-xl font-bold text-gray-800">{category}</h2>
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                  {groupedMenu[category].map(item => {
                    const cartItem = cart.find(c => c._id === item._id || c.id === item._id)
                    const quantity = cartItem ? cartItem.quantity : 0
                    
                    return (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden"
                      >
                        {/* Item Image */}
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Cart Badge */}
                          {quantity > 0 && (
                            <div className="absolute bottom-3 right-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-[#d4825c] flex items-center justify-center shadow-lg">
                                  <span className="text-white text-xl">🛒</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{quantity}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-gray-800 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="ml-3 w-10 h-10 rounded-full bg-[#d4825c] text-white flex items-center justify-center shadow-md hover:bg-[#c87550] active:scale-95 transition-all flex-shrink-0"
                            >
                              <span className="text-xl font-bold">+</span>
                            </button>
                          </div>
                          <p className="text-lg font-bold text-[#d4825c]">
                            €{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredMenu.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No items in this category.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl">
          <Link to="/cart">
            <button className="w-full bg-[#d4825c] hover:bg-[#c87550] text-white rounded-2xl py-4 flex items-center justify-between px-6 shadow-lg active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">
                  🛒
                </div>
                <div className="text-left">
                  <p className="text-xs opacity-90">Total: €{cartTotal.toFixed(2)}</p>
                  <p className="text-sm font-medium">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <span className="font-bold text-lg">Confirm Order</span>
            </button>
          </Link>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
