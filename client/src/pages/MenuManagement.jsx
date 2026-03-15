import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useParams, useSearchParams, Link } from 'react-router-dom'

export default function MenuManagement() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState(null)
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [filter, setFilter] = useState('All')
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Main',
    image: ''
  })

  const restaurantSlug = slug || 'sunrise-cafe'
  const categories = ['All', 'Main', 'Appetizers', 'Drinks', 'Desserts']

  useEffect(() => {
    // Check for stored session first
    const storedKey = localStorage.getItem('adminKey')
    
    if (storedKey) {
      setAdminKey(storedKey)
      setAuthenticated(true)
      return
    }

    // Check URL parameters
    const keyFromUrl = searchParams.get('key')
    const authFromUrl = searchParams.get('auth')
    
    if (keyFromUrl) {
      setAdminKey(keyFromUrl)
      setAuthenticated(true)
      localStorage.setItem('adminKey', keyFromUrl)
    } else if (authFromUrl === 'true') {
      setAdminKey('changeme')
      setAuthenticated(true)
      localStorage.setItem('adminKey', 'changeme')
    }
  }, [searchParams])

  const handleLogout = () => {
    setAuthenticated(false)
    setAdminKey('')
    localStorage.removeItem('adminKey')
    localStorage.removeItem('adminSlug')
    window.location.href = '/dashboard'
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated, restaurantSlug])

  const fetchData = async () => {
    try {
      const resRestaurant = await api.get(`/api/restaurant?slug=${restaurantSlug}`)
      setRestaurant(resRestaurant.data)

      const resMenu = await api.get(`/api/menu?slug=${restaurantSlug}`)
      setMenu(resMenu.data)
    } catch (e) {
      console.error('Failed to load data', e)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      
      // Clear URL field since we're using file upload
      setFormData(prev => ({ ...prev, image: '' }))
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('adminKey', adminKey)

      const response = await api.post(`/api/upload?key=${adminKey}&slug=${restaurantSlug}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data.imageUrl
    } catch (e) {
      console.error('Upload failed:', e)
      alert('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.price) {
      alert('Please fill in title and price')
      return
    }

    try {
      // Upload image first if file is selected
      let imageUrl = formData.image
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (!uploadedUrl) {
          alert('Image upload failed. Please try again.')
          return
        }
        imageUrl = uploadedUrl
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        image: imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
        restaurantSlug
      }

      if (editingItem) {
        await api.put(`/api/menu/${editingItem._id}?key=${adminKey}&slug=${restaurantSlug}`, payload)
      } else {
        await api.post(`/api/menu?key=${adminKey}&slug=${restaurantSlug}`, payload)
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'Main',
        image: ''
      })
      setImageFile(null)
      setImagePreview(null)
      setEditingItem(null)
      setShowForm(false)
      
      // Refresh menu
      await fetchData()
    } catch (e) {
      alert(editingItem ? 'Failed to update item' : 'Failed to create item')
      console.error(e)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image
    })
    setImageFile(null)
    setImagePreview(item.image) // Show existing image
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await api.delete(`/api/menu/${itemId}?key=${adminKey}&slug=${restaurantSlug}`)
      await fetchData()
    } catch (e) {
      alert('Failed to delete item')
      console.error(e)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'Main',
      image: ''
    })
    setImageFile(null)
    setImagePreview(null)
    setEditingItem(null)
    setShowForm(false)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Menu Management</h1>
          <p className="text-gray-600 mb-4 text-center">
            Access denied. Please login from dashboard.
          </p>
          <Link to={`/dashboard?auth=true`}>
            <button className="w-full btn-primary">Go to Dashboard</button>
          </Link>
        </div>
      </div>
    )
  }

  const filteredMenu = filter === 'All' 
    ? menu 
    : menu.filter(item => item.category === filter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Menu Management
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <span>🍽️</span>
                <span>{restaurant?.name || 'Restaurant'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/dashboard?auth=true`}>
                <button className="btn-secondary">
                  📊 Dashboard
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              >
                🚪 Logout
              </button>
              <button 
                onClick={() => setShowForm(!showForm)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <span>{showForm ? '✕' : '+'}</span>
                <span>{showForm ? 'Cancel' : 'Add Item'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="card mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>{editingItem ? '✏️' : '➕'}</span>
              <span>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Margherita Pizza"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="12.99"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your dish..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="Main">Main</option>
                    <option value="Appetizers">Appetizers</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Item Image
                </label>
                
                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      📤 Upload Image File (Recommended)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageFileChange}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer hover:border-blue-400 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Accepted formats: JPEG, PNG, GIF, WebP • Max size: 5MB
                    </p>
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500 font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      🔗 Image URL (from Unsplash, etc.)
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      disabled={imageFile !== null}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {imageFile && (
                      <p className="text-xs text-blue-600 mt-2">
                        ✓ File selected. URL field disabled.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview || formData.image} 
                      alt="Preview" 
                      className="w-full max-w-md h-48 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image'
                      }}
                    />
                    {imageFile && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                        ✓ Ready to upload
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>{editingItem ? '💾' : '➕'}</span>
                      <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-600">Filter:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === cat
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-sm text-gray-500 ml-auto">
            {filteredMenu.length} item{filteredMenu.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading menu...</p>
          </div>
        ) : filteredMenu.length === 0 ? (
          <div className="card text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items yet</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'All' 
                ? 'Add your first menu item to get started' 
                : `No items in ${filter} category`}
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              ➕ Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map(item => (
              <div key={item._id} className="card group hover:shadow-2xl">
                <div className="relative overflow-hidden rounded-xl mb-4 h-48 bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
                    }}
                  />
                  <span className="absolute top-3 right-3 badge badge-primary backdrop-blur-sm bg-opacity-90 shadow-md">
                    {item.category}
                  </span>
                </div>

                <div className="flex-1 mb-4">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
