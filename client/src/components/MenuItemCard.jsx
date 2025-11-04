import React from 'react'

export default function MenuItemCard({ item, onAdd }) {
  return (
    <div className="card group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl mb-4 h-52 bg-gray-100">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {item.category && (
          <span className="absolute top-3 right-3 badge badge-primary backdrop-blur-sm bg-opacity-90 shadow-md">
            {item.category}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="flex-1 mb-4">
        <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {item.description}
        </p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <span className="text-xs text-gray-500 block mb-1">Price</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => onAdd(item)}
          className="btn-primary text-sm inline-flex items-center gap-2 group-hover:scale-105"
        >
          <span>Add</span>
          <span className="text-lg">+</span>
        </button>
      </div>
    </div>
  )
}
