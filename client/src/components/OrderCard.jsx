import React from 'react'

const statusConfig = {
  new: {
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
    badge: 'badge badge-primary',
    icon: '🔔',
    text: 'NEW'
  },
  preparing: {
    bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
    badge: 'badge badge-warning',
    icon: '👨‍🍳',
    text: 'PREPARING'
  },
  done: {
    bg: 'bg-gradient-to-r from-green-50 to-green-100',
    badge: 'badge badge-success',
    icon: '✅',
    text: 'DONE'
  }
};

export default function OrderCard({ order, onMarkDone }) {
  const config = statusConfig[order.status] || statusConfig.new;
  
  return (
    <div className="card hover:shadow-2xl">
      <div className={`-m-5 mb-4 p-4 rounded-t-xl ${config.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{config.icon}</span>
              <h3 className="text-xl font-bold text-gray-900">{order.customerName}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🪑</span>
              <span className="font-medium">Table {order.tableNumber}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`${config.badge} shadow-sm`}>
              {config.text}
            </span>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 justify-end">
              <span>🕐</span>
              <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-2.5 mb-4 pb-4 border-b border-gray-100">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-700 flex items-center gap-2">
              <span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-xs font-bold">
                {item.quantity}
              </span>
              <span className="font-medium">{item.title}</span>
            </span>
            <span className="text-gray-900 font-semibold">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <p className="text-xs text-yellow-700 font-medium mb-1 flex items-center gap-1">
            <span>📝</span>
            <span>Special Instructions:</span>
          </p>
          <p className="text-sm text-yellow-900 italic">&quot;{order.notes}&quot;</p>
        </div>
      )}

      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
          <span className="font-bold text-gray-700">Total Amount</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            ${order.total.toFixed(2)}
          </span>
        </div>

        {order.status !== 'done' && (
          <button
            onClick={() => onMarkDone(order._id)}
            className="w-full btn-primary inline-flex items-center justify-center gap-2 group"
          >
            <span>✓</span>
            <span>Mark as Complete</span>
          </button>
        )}
      </div>
    </div>
  )
}

