'use client';
import { useState, useEffect, useRef } from 'react'

export default function BookManager() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formPosition, setFormPosition] = useState({ 
    top: 0, 
    left: 0, 
    visible: false,
    isMobile: false
  })
  const [currentBook, setCurrentBook] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: ''
  })

  const primaryColor = '#DE3163'
  const formRef = useRef(null)
  const buttonRefs = useRef({})

  // Check mobile viewport
  const checkIfMobile = () => window.innerWidth < 768

  // Fetch books from API
  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      const data = await response.json()
      if (data.success) {
        setBooks(data.data)
      } else {
        setError(data.error || 'Failed to fetch books')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchBooks()

    // Add event listener for window resize
    const handleResize = () => {
      if (formPosition.visible) {
        setFormPosition(prev => ({
          ...prev,
          isMobile: checkIfMobile()
        }))
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formPosition.visible && formRef.current && !formRef.current.contains(event.target)) {
        // Check if we're clicking on any of the buttons that open the form
        const isButton = Object.values(buttonRefs.current).some(
          ref => ref && ref.contains(event.target)
        )
        if (!isButton) {
          handleCloseForm()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [formPosition.visible])

  const positionForm = (buttonId, isAddButton = false) => {
    const button = buttonRefs.current[buttonId]
    if (button) {
      const rect = button.getBoundingClientRect()
      const isMobile = checkIfMobile()
      
      setFormPosition({
        top: isMobile ? 20 : rect.bottom + window.scrollY + 8,
        left: isMobile ? 20 : rect.left + window.scrollX,
        visible: true,
        isAdd: isAddButton,
        isMobile
      })
    }
  }

  const handleAddClick = (e) => {
    const buttonId = 'add-button'
    buttonRefs.current[buttonId] = e.currentTarget
    setFormData({ title: '', author: '', genre: '' })
    setCurrentBook(null)
    positionForm(buttonId, true)
  }

  const handleEditClick = (book, e) => {
    const buttonId = `edit-${book.id}`
    buttonRefs.current[buttonId] = e.currentTarget
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre
    })
    setCurrentBook(book)
    positionForm(buttonId)
  }

  const handleCloseForm = () => {
    setFormPosition(prev => ({ ...prev, visible: false }))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return
    
    try {
      const response = await fetch(`/api/books`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      if (data.success) {
        setBooks(books.filter(book => book.id !== id))
      } else {
        setError(data.error || 'Failed to delete book')
      }
    } catch (err) {
      setError(err.message) 
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = '/api/books'
      const method = currentBook ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentBook ? { id: currentBook.id, ...formData } : formData),
      })
      
      const data = await response.json()
      if (data.success) {
        fetchBooks()
        handleCloseForm()
      } else {
        setError(data.error || `Failed to ${currentBook ? 'update' : 'add'} book`)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: primaryColor }}>
            SaralTech
          </h1>
          <button 
            id="add-button"
            ref={el => buttonRefs.current['add-button'] = el}
            onClick={handleAddClick}
            className="px-4 py-2 rounded-md transition-colors font-medium"
            style={{
              backgroundColor: primaryColor,
              color: 'white'
            }}
          >
            Add New Book
          </button>
        </div>

        {formPosition.visible && (
          <div 
            ref={formRef}
            className={`fixed z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200 ${
              formPosition.isMobile ? 'w-[calc(100%-40px)]' : 'min-w-[300px] max-w-[90vw]'
            }`}
            style={{
              top: `${formPosition.top}px`,
              left: `${formPosition.left}px`,
              transform: formPosition.isMobile ? 'none' : 'translateX(-50%)',
              right: formPosition.isMobile ? '20px' : 'auto'
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">
                {currentBook ? 'Edit Book' : 'Add New Book'}
              </h3>
              <button 
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700 text-lg"
                aria-label="Close form"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Author*</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Genre*</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {currentBook ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Genre</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">No books found</td>
                  </tr>
                ) : (
                  books.map(book => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{book.genre}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            id={`edit-${book.id}`}
                            ref={el => buttonRefs.current[`edit-${book.id}`] = el}
                            onClick={(e) => handleEditClick(book, e)}
                            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="px-3 py-1 rounded border border-red-500 text-red-500 hover:bg-red-50 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}