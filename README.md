# Book Manager App

A modern book management application built with Next.js and Prisma, featuring full CRUD operations and responsive design.

## Features

- View all books in a clean table layout
- Add new books with form validation
- Edit existing book details
- Delete books with confirmation

## Tech Stack

- **Frontend**: Next.js
- **Styling**: Tailwind CSS
- **Database**: Mysql
- **ORM**: Prisma
- **API**: Next.js API routes

## Setup

1. Clone the repository:
    git clone https://github.com/mayank1009/saral-test.git
    cd book-manager

2. Install dependencies:
    npm install

3. Create .env file:
    DATABASE_URL="mysql://user:password@localhost:3306/dbname"

4. Set up database:
    npx prisma migrate dev --name init
    npx prisma generate

5. Run development server:
    npm run dev

## API Endpoints
    Method	Endpoint	Description
    GET	    /api/books	Get all books
    POST	/api/books	Add new book
    PUT	    /api/books	Update existing book
    DELETE	/api/books	Delete book