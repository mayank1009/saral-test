import prisma from '@/lib/prisma'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const books = await prisma.book.findMany()
        return res.status(200).json({ 
          success: true,
          data: books 
        })
      }

      case 'POST': {
        const { title, author, genre } = req.body


        if (!title || !author || !genre) {
          return res.status(400).json({ 
            success: false,
            error: 'Title, author and genre are required fields' 
          })
        }


        const newBook = await prisma.book.create({
          data: { title, author, genre }
        })

        return res.status(201).json({ 
          success: true,
          data: newBook 
        })
      }

      case 'PUT': {
        const { id, ...bookData } = req.body

        if (!id) {
          return res.status(400).json({ 
            success: false,
            error: 'Book ID is required for updates' 
          })
        }
        const data = {}
        for(const i in bookData){
            if(bookData[i]){
                data[i] = bookData[i]
            }   
        }
        const updatedBook = await prisma.book.update({
          where: { id: parseInt(id) },
          data: data
        })

        return res.status(200).json({ 
          success: true,
          message: 'Book updated successfully' 
        })
      }

      case 'DELETE': {
        const { id } = req.body

        if (!id) {
          return res.status(400).json({ 
            success: false,
            error: 'Book ID is required' 
          })
        }

        await prisma.book.delete({
          where: { id: parseInt(id) }
        })

        return res.status(200).json({ 
          success: true,
          message: 'Book deleted successfully' 
        })
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ 
          success: false,
          error: `Method ${req.method} not allowed` 
        })
    }
  } catch (error) {
    console.error('API Error:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false,
        error: 'Book not found' 
      })
    }

    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}