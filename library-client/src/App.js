// Install these packages for your React app:
// npm install react-router-dom axios

// This file appears to contain all components
// It should be split into separate files in a real project

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

// API functions - defined once
const API_URL = 'http://localhost:5000/api';

const fetchBooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/books`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

const fetchBookByISBN = async (isbn) => {
  try {
    const response = await axios.get(`${API_URL}/books/${isbn}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

const updateBookAvailability = async (isbn, availabilityStatus) => {
  try {
    const response = await axios.put(`${API_URL}/books/${isbn}`, { availabilityStatus });
    return response.data;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

const fetchCustomers = async () => {
  try {
    const response = await axios.get(`${API_URL}/customers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

const fetchBorrowings = async () => {
  try {
    const response = await axios.get(`${API_URL}/borrowings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    throw error;
  }
};

const addBorrowing = async (borrowingData) => {
  try {
    const response = await axios.post(`${API_URL}/borrowings`, borrowingData);
    return response.data;
  } catch (error) {
    console.error('Error adding borrowing:', error);
    throw error;
  }
};

// CSS Styles - using CSS-in-JS pattern with a style object
const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  appHeader: {
    marginBottom: '30px',
  },
  appHeaderH1: {
    color: '#333',
  },
  navUl: {
    display: 'flex',
    listStyle: 'none',
    padding: '0',
    backgroundColor: '#f5f5f5',
    borderRadius: '5px',
  },
  navLi: {
    padding: '10px 15px',
  },
  navA: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
  },
  navAHover: {
    color: '#0066cc',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  thTd: {
    padding: '10px',
    border: '1px solid #ddd',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  trEven: {
    backgroundColor: '#f9f9f9',
  },
  error: {
    color: '#cc0000',
    backgroundColor: '#ffeeee',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
  },
  success: {
    color: '#00cc00',
    backgroundColor: '#eeffee',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
  },
  button: {
    padding: '8px 15px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: '#0055aa',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  formGroup: {
    marginBottom: '15px',
  },
  formGroupLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  formGroupInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
};

// BookList Component
function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBooks = async () => {
      try {
        const data = await fetchBooks();
        setBooks(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books');
        setLoading(false);
      }
    };

    getBooks();
  }, []);

  const handleAvailabilityChange = async (isbn, newStatus) => {
    try {
      await updateBookAvailability(isbn, newStatus);
      setBooks(books.map(book => 
        book.ISBN === isbn ? { ...book, AvailabilityStatus: newStatus } : book
      ));
    } catch (err) {
      setError('Failed to update book status');
    }
  };

  if (loading) return <div>Loading books...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div className="book-list">
      <h2>Book Catalog</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{...styles.thTd, ...styles.th}}>ISBN</th>
            <th style={{...styles.thTd, ...styles.th}}>Title</th>
            <th style={{...styles.thTd, ...styles.th}}>Genre</th>
            <th style={{...styles.thTd, ...styles.th}}>Year</th>
            <th style={{...styles.thTd, ...styles.th}}>Status</th>
            <th style={{...styles.thTd, ...styles.th}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr key={book.ISBN} style={index % 2 === 1 ? styles.trEven : {}}>
              <td style={styles.thTd}>{book.ISBN}</td>
              <td style={styles.thTd}>{book.Title}</td>
              <td style={styles.thTd}>{book.Genre}</td>
              <td style={styles.thTd}>{book.PublishingYear}</td>
              <td style={styles.thTd}>{book.AvailabilityStatus ? 'Available' : 'Unavailable'}</td>
              <td style={styles.thTd}>
                <button 
                  style={book.AvailabilityStatus ? styles.button : {...styles.button, ...styles.buttonDisabled}}
                  onClick={() => handleAvailabilityChange(book.ISBN, !book.AvailabilityStatus)}
                  disabled={!book.AvailabilityStatus}
                >
                  {book.AvailabilityStatus ? 'Mark Unavailable' : 'Mark Available'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// CustomerList Component
function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const data = await fetchCustomers();
        setCustomers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch customers');
        setLoading(false);
      }
    };

    getCustomers();
  }, []);

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div className="customer-list">
      <h2>Customer Directory</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{...styles.thTd, ...styles.th}}>ID</th>
            <th style={{...styles.thTd, ...styles.th}}>First Name</th>
            <th style={{...styles.thTd, ...styles.th}}>Last Name</th>
            <th style={{...styles.thTd, ...styles.th}}>Age</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={customer.CustomerID} style={index % 2 === 1 ? styles.trEven : {}}>
              <td style={styles.thTd}>{customer.CustomerID}</td>
              <td style={styles.thTd}>{customer.FirstName}</td>
              <td style={styles.thTd}>{customer.LastName}</td>
              <td style={styles.thTd}>{customer.Age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// BorrowingList Component
function BorrowingList() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBorrowings = async () => {
      try {
        const data = await fetchBorrowings();
        setBorrowings(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch borrowings');
        setLoading(false);
      }
    };

    getBorrowings();
  }, []);

  if (loading) return <div>Loading borrowings...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div className="borrowing-list">
      <h2>Borrowing Status</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{...styles.thTd, ...styles.th}}>Book Title</th>
            <th style={{...styles.thTd, ...styles.th}}>Customer</th>
            <th style={{...styles.thTd, ...styles.th}}>Borrowed On</th>
            <th style={{...styles.thTd, ...styles.th}}>Return By</th>
          </tr>
        </thead>
        <tbody>
          {borrowings.map((borrowing, index) => (
            <tr key={index} style={index % 2 === 1 ? styles.trEven : {}}>
              <td style={styles.thTd}>{borrowing.Title}</td>
              <td style={styles.thTd}>{`${borrowing.FirstName} ${borrowing.LastName}`}</td>
              <td style={styles.thTd}>{new Date(borrowing.BorrowingDate).toLocaleDateString()}</td>
              <td style={styles.thTd}>{new Date(borrowing.ReturnDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// AddBorrowing Component
function AddBorrowing() {
  const [books, setBooks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerID: '',
    isbn: '',
    borrowingDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, customersData] = await Promise.all([
          fetchBooks(),
          fetchCustomers()
        ]);
        
        setBooks(booksData.filter(book => book.AvailabilityStatus));
        setCustomers(customersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    
    try {
      await addBorrowing(formData);
      setSuccess('Borrowing record added successfully!');
      setFormData({
        ...formData,
        isbn: ''
      });
    } catch (err) {
      setError('Failed to add borrowing record: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div>Loading form data...</div>;

  return (
    <div className="add-borrowing">
      <h2>Add New Borrowing</h2>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.formGroupLabel} htmlFor="customerID">Customer:</label>
          <select
            style={styles.formGroupInput}
            id="customerID"
            name="customerID"
            value={formData.customerID}
            onChange={handleChange}
            required
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.CustomerID} value={customer.CustomerID}>
                {`${customer.FirstName} ${customer.LastName}`}
              </option>
            ))}
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formGroupLabel} htmlFor="isbn">Book:</label>
          <select
            style={styles.formGroupInput}
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            required
          >
            <option value="">Select a book</option>
            {books.map(book => (
              <option key={book.ISBN} value={book.ISBN}>
                {book.Title}
              </option>
            ))}
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formGroupLabel} htmlFor="borrowingDate">Borrowing Date:</label>
          <input
            style={styles.formGroupInput}
            type="date"
            id="borrowingDate"
            name="borrowingDate"
            value={formData.borrowingDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formGroupLabel} htmlFor="returnDate">Return Date:</label>
          <input
            style={styles.formGroupInput}
            type="date"
            id="returnDate"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <button style={styles.button} type="submit">Add Borrowing</button>
      </form>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <header style={styles.appHeader}>
          <h1 style={styles.appHeaderH1}>Library Management System</h1>
          <nav>
            <ul style={styles.navUl}>
              <li style={styles.navLi}><Link style={styles.navA} to="/">Books</Link></li>
              <li style={styles.navLi}><Link style={styles.navA} to="/customers">Customers</Link></li>
              <li style={styles.navLi}><Link style={styles.navA} to="/borrowings">Borrowings</Link></li>
              <li style={styles.navLi}><Link style={styles.navA} to="/add-borrowing">Add Borrowing</Link></li>
            </ul>
          </nav>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/borrowings" element={<BorrowingList />} />
            <Route path="/add-borrowing" element={<AddBorrowing />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
