import React, { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function QRCodeGenerator() {
  const [searchParams] = useSearchParams()
  const [authenticated, setAuthenticated] = useState(false)
  const [restaurant, setRestaurant] = useState(null)
  const [tables, setTables] = useState([])
  const [numTables, setNumTables] = useState(10)
  const [qrCodes, setQrCodes] = useState({})
  const [generating, setGenerating] = useState(false)
  const printRef = useRef()

  useEffect(() => {
    // Check for stored session first
    const storedKey = localStorage.getItem('adminKey')
    if (storedKey) {
      setAuthenticated(true)
      return
    }

    // Check URL parameters
    const keyFromUrl = searchParams.get('key')
    const authFromUrl = searchParams.get('auth')
    
    if (keyFromUrl) {
      setAuthenticated(true)
      localStorage.setItem('adminKey', keyFromUrl)
    } else if (authFromUrl === 'true') {
      setAuthenticated(true)
      localStorage.setItem('adminKey', 'changeme')
    }
  }, [searchParams])

  const handleLogout = () => {
    setAuthenticated(false)
    localStorage.removeItem('adminKey')
    localStorage.removeItem('adminSlug')
    window.location.href = '/dashboard'
  }

  useEffect(() => {
    if (authenticated) {
      fetchRestaurant()
      generateTableList(numTables)
    }
  }, [authenticated, numTables])

  const fetchRestaurant = async () => {
    try {
  const response = await api.get('/api/restaurant?slug=sunrise-cafe')
      setRestaurant(response.data)
    } catch (e) {
      console.error('Failed to fetch restaurant', e)
    }
  }

  const generateTableList = (count) => {
    const tableList = []
    for (let i = 1; i <= count; i++) {
      tableList.push({
        number: i,
        url: `${window.location.origin}/menu/sunrise-cafe?table=${i}`
      })
    }
    setTables(tableList)
  }

  const generateQRCodes = async () => {
    setGenerating(true)
    const newQrCodes = {}
    
    try {
      for (const table of tables) {
        const response = await api.post('/api/restaurant/generate-qr', {
          url: table.url
        })
        newQrCodes[table.number] = response.data.qrCode
      }
      setQrCodes(newQrCodes)
    } catch (e) {
      alert('Failed to generate QR codes')
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const downloadQRCode = (tableNumber, qrCodeData) => {
    const link = document.createElement('a')
    link.href = qrCodeData
    link.download = `table-${tableNumber}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllQRCodes = () => {
    Object.entries(qrCodes).forEach(([tableNumber, qrCodeData]) => {
      setTimeout(() => {
        downloadQRCode(tableNumber, qrCodeData)
      }, 100 * parseInt(tableNumber))
    })
  }

  const printAllQRCodes = () => {
    window.print()
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">QR Code Generator</h1>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                QR Code Generator
              </h1>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <span>📱</span>
                <span>{restaurant?.name || 'Restaurant'} - Table QR Codes</span>
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Setup Section */}
        <div className="card mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 print:hidden">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>⚙️</span>
            <span>Setup</span>
          </h2>

          <div className="space-y-6">
            {/* Number of Tables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many tables do you have?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={numTables}
                  onChange={(e) => setNumTables(parseInt(e.target.value) || 1)}
                  className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg font-bold text-center"
                />
                <span className="text-gray-600">tables</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter the total number of tables in your restaurant
              </p>
            </div>

            {/* Generate Button */}
            <div>
              <button
                onClick={generateQRCodes}
                disabled={generating || tables.length === 0}
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                {generating ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    <span>Generating QR Codes...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate {tables.length} QR Codes</span>
                  </>
                )}
              </button>
              {Object.keys(qrCodes).length > 0 && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={downloadAllQRCodes}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <span>💾</span>
                    <span>Download All</span>
                  </button>
                  <button
                    onClick={printAllQRCodes}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <span>🖨️</span>
                    <span>Print All</span>
                  </button>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>How it works</span>
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Each table gets a unique QR code</li>
                <li>• QR codes automatically include the table number</li>
                <li>• When customers scan, orders show correct table number</li>
                <li>• Print and laminate QR codes for each table</li>
                <li>• No manual table entry needed by customers!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* QR Codes Grid */}
        {Object.keys(qrCodes).length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between print:hidden">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>📱</span>
                <span>Your QR Codes ({Object.keys(qrCodes).length} tables)</span>
              </h2>
              <p className="text-sm text-gray-600">
                Click any QR code to download individually
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 print:grid-cols-3" ref={printRef}>
              {tables.map((table) => (
                qrCodes[table.number] && (
                  <div 
                    key={table.number} 
                    className="card text-center hover:shadow-2xl cursor-pointer transition-all print:break-inside-avoid print:mb-4"
                    onClick={() => downloadQRCode(table.number, qrCodes[table.number])}
                  >
                    {/* QR Code Image */}
                    <div className="bg-white p-4 rounded-lg mb-3">
                      <img
                        src={qrCodes[table.number]}
                        alt={`Table ${table.number} QR Code`}
                        className="w-full h-auto"
                      />
                    </div>

                    {/* Table Info */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1">
                        Table {table.number}
                      </div>
                      <p className="text-xs text-gray-500">
                        Click to download
                      </p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {Object.keys(qrCodes).length === 0 && (
          <div className="card text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 print:hidden">
            <div className="text-7xl mb-6">📱</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Generate QR Codes</h3>
            <p className="text-gray-600 mb-6">
              Set the number of tables and click &quot;Generate QR Codes&quot; to create unique QR codes for each table
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span>👆</span>
              <span>Configure settings above</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 print:hidden">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📋</span>
            <span>Instructions</span>
          </h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-green-900 mb-2">1. Generate QR Codes</h3>
              <p className="text-sm">Set number of tables and click &quot;Generate QR Codes&quot;</p>
            </div>

            <div>
              <h3 className="font-semibold text-green-900 mb-2">2. Download Options</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• <strong>Individual:</strong> Click any QR code to download</li>
                <li>• <strong>Batch:</strong> Click &quot;Download All&quot; to get all QR codes</li>
                <li>• <strong>Print:</strong> Click &quot;Print All&quot; to print directly</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-green-900 mb-2">3. Prepare for Tables</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Print each QR code on quality paper/cardstock</li>
                <li>• Laminate for durability (recommended)</li>
                <li>• Add restaurant branding if desired</li>
                <li>• Place in table stands or frames</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-green-900 mb-2">4. Display on Tables</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Place QR code card on each table</li>
                <li>• Make sure table numbers match physical tables</li>
                <li>• Test by scanning with your phone</li>
                <li>• Orders will automatically show table number!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card mt-8 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 print:hidden">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>Pro Tips</span>
          </h2>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span><strong>Lamination:</strong> Protect QR codes from spills and wear</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span><strong>Size:</strong> Print at least 3x3 inches for easy scanning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span><strong>Placement:</strong> Center of table, visible from all seats</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span><strong>Branding:</strong> Add &quot;Scan to Order&quot; text and restaurant logo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span><strong>Testing:</strong> Test every QR code before customer use</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">✓</span>
              <span><strong>Backup:</strong> Keep digital copies for reprinting</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:break-inside-avoid,
          .print\\:break-inside-avoid * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  )
}
