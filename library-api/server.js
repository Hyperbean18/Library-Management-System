// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Database connection creator function
const createDbConnection = (credentials) => {
  return mysql.createConnection({
    host: 'localhost',
    user: credentials.username || 'guest', // Default to limited access if no credentials
    password: credentials.password || '',
    database: 'library_management_system'
  });
};

// Default connection for unauthenticated requests
let defaultDb = createDbConnection({
  username: 'library_viewer',
  password: 'view_password'
});

defaultDb.connect(err => {
  if (err) {
    console.error('Error connecting to the default database:', err);
    return;
  }
  console.log('Connected to the default database');
});

// Middleware to handle authentication
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // Use default connection for unauthenticated requests
    req.db = defaultDb;
    return next();
  }
  
  try {
    // Get credentials from Authorization header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    // Create new connection with provided credentials
    const userDb = createDbConnection({ username, password });
    
    // Test the connection
    userDb.connect(err => {
      if (err) {
        console.error('Authentication failed:', err);
        return res.status(401).json({ error: 'Authentication failed' });
      }
      
      // Store connection in request object
      req.db = userDb;
      next();
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Apply authentication middleware to all routes
app.use(authMiddleware);

// Books API endpoints
app.get('/api/books', (req, res) => {
  const query = 'SELECT * FROM book_catalog';
  
  req.db.query(query, (err, results) => {
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
  
  req.db.query(query, [req.params.isbn], (err, results) => {
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
  
  req.db.query(query, (err, results) => {
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
  
  req.db.query(query, (err, results) => {
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
  req.db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
    
    // First, add borrowing record
    const borrowingQuery = 'INSERT INTO borrowing_management (CustomerID, ISBN, BorrowingDate, ReturnDate) VALUES (?, ?, ?, ?)';
    
    req.db.query(borrowingQuery, [customerID, isbn, borrowingDate, returnDate], (err, results) => {
      if (err) {
        return req.db.rollback(() => {
          console.error('Error adding borrowing record:', err);
          res.status(500).json({ error: 'Internal server error: ' + err.message });
        });
      }
      
      req.db.commit(err => {
        if (err) {
          return req.db.rollback(() => {
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
  
  req.db.query(query, [availabilityStatus, req.params.isbn], (err, results) => {
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
