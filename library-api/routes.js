// Books API endpoints
app.get('/api/books', (req, res) => {
  const query = 'SELECT * FROM book_catalog';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Internal server error' });
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
      return res.status(500).json({ error: 'Internal server error' });
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
      return res.status(500).json({ error: 'Internal server error' });
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
      return res.status(500).json({ error: 'Internal server error' });
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
  
  const query = 'INSERT INTO borrowing_management (CustomerID, ISBN, BorrowingDate, ReturnDate) VALUES (?, ?, ?, ?)';
  
  db.query(query, [customerID, isbn, borrowingDate, returnDate], (err, results) => {
    if (err) {
      console.error('Error adding borrowing record:', err);
      return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
    res.status(201).json({ message: 'Borrowing record added successfully' });
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
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ message: 'Book updated successfully' });
  });
});
