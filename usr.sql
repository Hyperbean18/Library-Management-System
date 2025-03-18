-- First, we'll add the user creation and permissions
-- Create view-only user
CREATE USER 'library_viewer'@'localhost' IDENTIFIED BY 'view_password';

-- Create user with view and update rights
CREATE USER 'library_staff'@'localhost' IDENTIFIED BY 'staff_password';

-- Create views for the view-only user

-- Book catalog view - basic information about books
CREATE VIEW book_catalog AS
SELECT b.ISBN, b.Title, b.AvailabilityStatus, b.PublishingYear, bs.Genre
FROM Book b
JOIN Bookshelf bs ON b.BookshelfID = bs.BookshelfID;

-- Customer directory view - basic customer information
CREATE VIEW customer_directory AS
SELECT c.CustomerID, c.FirstName, c.LastName, c.Age
FROM Customer c;

-- Book borrowing status view
CREATE VIEW borrowing_status AS
SELECT b.Title, c.FirstName, c.LastName, bb.BorrowingDate, bb.ReturnDate
FROM BorrowedBy bb
JOIN Book b ON bb.ISBN = b.ISBN
JOIN Customer c ON bb.CustomerID = c.CustomerID;

-- Librarian directory view
CREATE VIEW librarian_directory AS
SELECT l.UID, l.Name, l.DateOfEmployment
FROM Librarian l;

-- Create updatable views for the library_staff user

-- Book updatable view (for availability status updates only)
CREATE VIEW book_management AS
SELECT ISBN, Title, AvailabilityStatus, PublishingYear, BookshelfID
FROM Book;

-- Customer management view
CREATE VIEW customer_management AS
SELECT CustomerID, FirstName, MiddleName, LastName, Address, DoB, Age, PhoneNumber, LibrarianUID
FROM Customer;

-- Borrowing management view
CREATE VIEW borrowing_management AS
SELECT CustomerID, ISBN, BorrowingDate, ReturnDate
FROM BorrowedBy;

-- Grant privileges to the view-only user
GRANT SELECT ON book_catalog TO 'library_viewer'@'localhost';
GRANT SELECT ON customer_directory TO 'library_viewer'@'localhost';
GRANT SELECT ON borrowing_status TO 'library_viewer'@'localhost';
GRANT SELECT ON librarian_directory TO 'library_viewer'@'localhost';

-- Grant privileges to the staff user with view and update rights
GRANT SELECT ON book_catalog TO 'library_staff'@'localhost';
GRANT SELECT ON customer_directory TO 'library_staff'@'localhost';
GRANT SELECT ON borrowing_status TO 'library_staff'@'localhost';
GRANT SELECT ON librarian_directory TO 'library_staff'@'localhost';

GRANT SELECT, UPDATE ON book_management TO 'library_staff'@'localhost';
GRANT SELECT, UPDATE ON customer_management TO 'library_staff'@'localhost';
GRANT SELECT, UPDATE, INSERT ON borrowing_management TO 'library_staff'@'localhost';

-- Explicitly deny CREATE privileges
REVOKE CREATE ON *.* FROM 'library_viewer'@'localhost';
REVOKE CREATE ON *.* FROM 'library_staff'@'localhost';

-- Now, let's create some example triggers to add additional constraints to our updatable views

DELIMITER //

-- Trigger to ensure that staff cannot modify ISBN or Title in book_management view
CREATE TRIGGER book_management_update_constraint
BEFORE UPDATE ON Book
FOR EACH ROW
BEGIN
    IF OLD.ISBN != NEW.ISBN OR OLD.Title != NEW.Title THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff cannot modify ISBN or Title';
    END IF;
END //

-- Trigger to ensure that return dates are valid in borrowing_management view
CREATE TRIGGER borrowing_management_update_constraint
BEFORE UPDATE ON BorrowedBy
FOR EACH ROW
BEGIN
    IF NEW.ReturnDate < NEW.BorrowingDate THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Return date must be after borrowing date';
    END IF;
    
    IF NEW.BorrowingDate != OLD.BorrowingDate THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff cannot modify borrowing date';
    END IF;
    
    IF NEW.CustomerID != OLD.CustomerID OR NEW.ISBN != OLD.ISBN THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff cannot change customer or book for existing records';
    END IF;
END //

-- Trigger to enforce constraints on borrowing_management view for insertions
CREATE TRIGGER borrowing_management_insert_constraint
BEFORE INSERT ON BorrowedBy
FOR EACH ROW
BEGIN
    DECLARE is_available BOOLEAN;
    
    -- Check if book is available
    SELECT AvailabilityStatus INTO is_available 
    FROM Book 
    WHERE ISBN = NEW.ISBN;
    
    IF NOT is_available THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Book is not available for borrowing';
    END IF;
    
    -- Check dates
    IF NEW.BorrowingDate > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Borrowing date cannot be in the future';
    END IF;
    
    IF NEW.ReturnDate < NEW.BorrowingDate THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Return date must be after borrowing date';
    END IF;
    
    -- Update book availability
    UPDATE Book SET AvailabilityStatus = FALSE WHERE ISBN = NEW.ISBN;
END //

-- Add constraints for customer management
CREATE TRIGGER customer_management_update_constraint
BEFORE UPDATE ON Customer
FOR EACH ROW
BEGIN
    -- Staff can't change CustomerID
    IF OLD.CustomerID != NEW.CustomerID THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff cannot modify CustomerID';
    END IF;
    
    -- Recalculate age if DoB changes
    IF OLD.DoB != NEW.DoB THEN
        SET NEW.Age = YEAR(CURDATE()) - YEAR(NEW.DoB);
    END IF;
END //

DELIMITER ;

-- Example of how to check user privileges
-- These commands would be used by an administrator to verify the setup

-- Show grants for view-only user
SHOW GRANTS FOR 'library_viewer'@'localhost';

-- Show grants for staff user
SHOW GRANTS FOR 'library_staff'@'localhost';
