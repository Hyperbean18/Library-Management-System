// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Create database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Using the staff user with appropriate permissions
  password: '8008',
  database: 'library_management_system'
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Books API endpoints
app.get('/api/books', (req, res) => {
  // Use the book_catalog view instead of trying to join with book_management
  const query = 'SELECT * FROM book_catalog';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
    res.json(results);
  });
});

// Get a specific book
app.get('/api/books/:isbn', (req, res) => {
  const query = 'SELECT * FROM book_catalog WHERE ISBN = ?';
  
  db.query(query, [req.params.isbn], (err, results) => {
    if (err) {
      console.error('Error fetching book:', err);
      return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(results[0]);
  });
});

// Customers API endpoints
app.get('/api/customers', (req, res) => {
  const query = 'SELECT * FROM customer_directory';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
    res.json(results);
  });
});

// Borrowing status API
app.get('/api/borrowings', (req, res) => {
  const query = 'SELECT * FROM borrowing_status';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching borrowings:', err);
      return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
    res.json(results);
  });
});

// Add a new borrowing record (for staff)
app.post('/api/borrowings', (req, res) => {
  const { customerID, isbn, borrowingDate, returnDate } = req.body;
  
  if (!customerID || !isbn || !borrowingDate || !returnDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Start a transaction to ensure data consistency
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
    
    // First, add borrowing record
    const borrowingQuery = 'INSERT INTO borrowing_management (CustomerID, ISBN, BorrowingDate, ReturnDate) VALUES (?, ?, ?, ?)';
    
    db.query(borrowingQuery, [customerID, isbn, borrowingDate, returnDate], (err, results) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error adding borrowing record:', err);
          res.status(500).json({ error: 'Internal server error: ' + err.message });
        });
      }
      
      // No need to manually update book availability as the trigger will handle it
      db.commit(err => {
        if (err) {
          return db.rollback(() => {
            console.error('Error committing transaction:', err);
            res.status(500).json({ error: 'Internal server error: ' + err.message });
          });
        }
        
        res.status(201).json({ message: 'Borrowing record added successfully' });
      });
    });
  });
});

// Update book availability
app.put('/api/books/:isbn', (req, res) => {
  const { availabilityStatus } = req.body;
  
  if (availabilityStatus === undefined) {
    return res.status(400).json({ error: 'Availability status is required' });
  }
  
  const query = 'UPDATE book_management SET AvailabilityStatus = ? WHERE ISBN = ?';
  
  db.query(query, [availabilityStatus, req.params.isbn], (err, results) => {
    if (err) {
      console.error('Error updating book:', err);
      return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ message: 'Book updated successfully' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
