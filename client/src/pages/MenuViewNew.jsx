import React, { useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CartContext } from '../App'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'

export default function MenuViewNew() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const { cart, addToCart } = useContext(CartContext)
  const { translations: t, currentLanguage } = useLanguage()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableNumber, setTableNumber] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [restaurant, setRestaurant] = useState({ 
    name: 'Restaurant', 
    logoUrl: '', 
    slug: 'restaurant' 
  })

  // Helper function to get localized description
  const getLocalizedDescription = (item) => {
    if (item.descriptions && item.descriptions[currentLanguage]) {
      return item.descriptions[currentLanguage]
    }
    return item.description || ''
  }

  useEffect(() => {
    // Get table number from URL if present
    const tableParam = searchParams.get('table')
    if (tableParam) {
      setTableNumber(tableParam)
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

  // Get unique categories from database (original English values)
  const dbCategories = ['All', ...new Set(menu.map(item => item.category).filter(Boolean))]
  
  // Helper function to translate category names for display
  const translateCategory = (category) => {
    const categoryMap = {
      'All': t.allCategories,
      'Main': t.main || 'Main',
      'Appetizers': t.appetizers || 'Appetizers',
      'Drinks': t.drinks || 'Drinks',
      'Desserts': t.desserts || 'Desserts'
    }
    return categoryMap[category] || category
  }

  // Filter menu by category (using original database values)
  const filteredMenu = activeCategory === 'All'
    ? menu 
    : menu.filter(item => item.category === activeCategory)

  // Get featured items (first 5 items or items with highest prices)
  const featuredItems = menu.slice(0, 5)

  // Group by category for vertical sections
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      {/* Fixed Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl shadow-md">
                ☕
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {restaurant.name}
                </h1>
                {tableNumber && (
                  <p className="text-xs text-gray-500">{t.table} {tableNumber}</p>
                )}
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content - Vertical Scroll */}
      <div className="pb-32">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#d4825c] to-[#c87550] px-4 py-8 text-white">
          <h2 className="text-2xl font-bold mb-2">{t.welcomeTitle}</h2>
          <p className="text-white/90 text-sm">{t.welcomeSubtitle}</p>
        </div>

        {/* Featured Items - Horizontal Scroll */}
        <div className="py-6 bg-white">
          <div className="px-4 mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>⭐</span>
              <span>{t.featuredDishes}</span>
            </h3>
            <p className="text-sm text-gray-600">{t.ourMostPopular}</p>
          </div>

          {/* Horizontal Scroll Container */}
          <div 
            className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredItems.map(item => {
              const cartItem = cart.find(c => c._id === item._id || c.id === item._id)
              const quantity = cartItem ? cartItem.quantity : 0

              return (
                <div
                  key={item._id}
                  className="flex-shrink-0 w-64 snap-start group"
                >
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Cart Badge */}
                      {quantity > 0 && (
                        <div className="absolute bottom-2 right-2">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-[#d4825c] flex items-center justify-center shadow-lg">
                              <span className="text-white text-lg">🛒</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{quantity}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 mb-1 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {getLocalizedDescription(item)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[#d4825c]">
                          €{item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-9 h-9 rounded-full bg-[#d4825c] text-white flex items-center justify-center shadow-md hover:bg-[#c87550] active:scale-95 transition-all"
                        >
                          <span className="text-xl font-bold">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-4 bg-white border-t border-b border-gray-100 sticky top-[72px] z-40">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {dbCategories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-[#d4825c] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {translateCategory(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Menu Sections */}
        <div className="px-4 pt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#d4825c] border-t-transparent"></div>
              <p className="mt-4 text-gray-600">{t.loadingMenu}</p>
            </div>
          ) : (
            <>
              {Object.keys(groupedMenu).map(category => (
                <div key={category} className="mb-8">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🍽️</span>
                    <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
                  </div>

                  {/* Menu Items - Vertical List */}
                  <div className="space-y-4">
                    {groupedMenu[category].map(item => {
                      const cartItem = cart.find(c => c._id === item._id || c.id === item._id)
                      const quantity = cartItem ? cartItem.quantity : 0

                      return (
                        <div
                          key={item._id}
                          className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
                        >
                          {/* Item Layout */}
                          <div className="flex gap-4 p-4">
                            {/* Image */}
                            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              {/* Cart Badge */}
                              {quantity > 0 && (
                                <div className="absolute bottom-1 right-1">
                                  <div className="relative">
                                    <div className="w-7 h-7 rounded-full bg-[#d4825c] flex items-center justify-center shadow-lg">
                                      <span className="text-white text-sm">🛒</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-800 border border-white flex items-center justify-center">
                                      <span className="text-white text-[10px] font-bold">{quantity}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {getLocalizedDescription(item)}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-[#d4825c]">
                                  €{item.price.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => handleAddToCart(item)}
                                  className="w-8 h-8 rounded-full bg-[#d4825c] text-white flex items-center justify-center shadow-md hover:bg-[#c87550] active:scale-95 transition-all"
                                >
                                  <span className="text-lg font-bold">+</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {filteredMenu.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">{t.noItemsInCategory}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fixed Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50">
          <Link to="/cart">
            <button className="w-full bg-[#d4825c] hover:bg-[#c87550] text-white rounded-2xl py-4 flex items-center justify-between px-6 shadow-lg active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg relative">
                  🛒
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-800 text-xs flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs opacity-90">{t.total}</p>
                  <p className="text-lg font-bold">€{cartTotal.toFixed(2)}</p>
                </div>
              </div>
              <span className="font-bold text-lg">{t.viewCart} →</span>
            </button>
          </Link>
        </div>
      )}

      {/* Hide Scrollbar Styles */}
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
