DROP DATABASE IF EXISTS library_management_system;
CREATE DATABASE library_management_system;
USE library_management_system;

CREATE TABLE Customer (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    MiddleName VARCHAR(100),
    LastName VARCHAR(100) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    DoB DATE NOT NULL,
    Age INT,
    PhoneNumber VARCHAR(15),
    LibrarianUID INT
);

CREATE TABLE Bookshelf (
    BookshelfID INT AUTO_INCREMENT PRIMARY KEY,
    Genre VARCHAR(100) NOT NULL UNIQUE,
    LibrarianUID INT
);

CREATE TABLE Librarian (
    UID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    DateOfEmployment DATE NOT NULL
);

CREATE TABLE Book (
    ISBN VARCHAR(20) PRIMARY KEY,
    Title VARCHAR(255) NOT NULL UNIQUE,
    AvailabilityStatus BOOLEAN NOT NULL,
    PublishingYear INT NOT NULL,
    BookshelfID INT NOT NULL
);

CREATE TABLE BorrowedBy (
    CustomerID INT NOT NULL,
    ISBN VARCHAR(20) NOT NULL,
    BorrowingDate DATE NOT NULL,
    ReturnDate DATE NOT NULL,
    PRIMARY KEY (CustomerID, ISBN, BorrowingDate),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (ISBN) REFERENCES Book(ISBN)
);

ALTER TABLE Customer
ADD CONSTRAINT fk_customer_librarian
FOREIGN KEY (LibrarianUID) REFERENCES Librarian(UID);

ALTER TABLE Bookshelf
ADD CONSTRAINT fk_bookshelf_librarian
FOREIGN KEY (LibrarianUID) REFERENCES Librarian(UID);

ALTER TABLE Book
ADD CONSTRAINT fk_book_bookshelf
FOREIGN KEY (BookshelfID) REFERENCES Bookshelf(BookshelfID);

DELIMITER //

CREATE TRIGGER check_publishing_year
BEFORE INSERT ON Book
FOR EACH ROW
BEGIN
    IF NEW.PublishingYear > YEAR(CURDATE()) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Publishing year cannot be greater than current year';
    END IF;
END //

CREATE TRIGGER check_employment_date
BEFORE INSERT ON Librarian
FOR EACH ROW
BEGIN
    IF NEW.DateOfEmployment > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Employment date cannot be in the future';
    END IF;
END //

CREATE TRIGGER update_age
BEFORE INSERT ON Customer
FOR EACH ROW
BEGIN
    SET NEW.Age = YEAR(CURDATE()) - YEAR(NEW.DoB);
END //

CREATE TRIGGER check_borrowing_dates
BEFORE INSERT ON BorrowedBy
FOR EACH ROW
BEGIN
    IF NEW.BorrowingDate > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Borrowing date cannot be in the future';
    END IF;
    
    IF NEW.ReturnDate < NEW.BorrowingDate THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Return date must be after borrowing date';
    END IF;
END //

DELIMITER ;

INSERT INTO Librarian (Name, DateOfEmployment) VALUES
('Robert Wilson', '2010-06-15'),
('Jennifer Lee', '2015-09-22'),
('Thomas Garcia', '2018-03-10'),
('Patricia Martinez', '2012-11-05'),
('Carlos Rodriguez', '2020-01-20');

INSERT INTO Bookshelf (Genre, LibrarianUID) VALUES
('Fiction', 1),
('Science Fiction', 1),
('Mystery', 2),
('Biography', 2),
('History', 3),
('Computer Science', 4),
('Philosophy', 5),
('Poetry', 5);

INSERT INTO Book (ISBN, Title, AvailabilityStatus, PublishingYear, BookshelfID) VALUES
('978-0451524935', '1984', TRUE, 1949, 1),
('978-0061120084', 'To Kill a Mockingbird', TRUE, 1960, 1),
('978-0141439518', 'Pride and Prejudice', FALSE, 1813, 1),
('978-0307277671', 'The Road', TRUE, 2006, 1),
('978-0547928227', 'The Hobbit', FALSE, 1937, 2),
('978-0307744432', 'The Girl with the Dragon Tattoo', TRUE, 2005, 3),
('978-0385472579', 'Zen and the Art of Motorcycle Maintenance', TRUE, 1974, 4),
('978-0062315007', 'The Alchemist', TRUE, 1988, 1),
('978-0142437179', 'Don Quixote', TRUE, 1605, 1),
('978-0132350884', 'Clean Code', FALSE, 2008, 6),
('978-0131103627', 'The C Programming Language', TRUE, 1978, 6),
('978-0262033848', 'Introduction to Algorithms', TRUE, 2009, 6),
('978-0133591620', 'Database Systems: A Practical Approach', TRUE, 2015, 6),
('978-0134757599', 'Designing Data-Intensive Applications', FALSE, 2017, 6),
('978-0140447934', 'Republic', TRUE, -380, 7);

INSERT INTO Customer (FirstName, MiddleName, LastName, Address, DoB, PhoneNumber, LibrarianUID) VALUES
('John', NULL, 'Smith', '123 Main St, Anytown, USA', '1990-05-15', '555-123-4567', 1),
('Emily', 'Rose', 'Johnson', '456 Oak Ave, Somecity, USA', '1985-09-22', '555-987-6543', 1),
('Michael', NULL, 'Brown', '789 Pine Rd, Otherville, USA', '1992-11-30', '555-456-7890', 2),
('Sarah', 'Jane', 'Williams', '321 Elm St, Newtown, USA', '1988-07-12', '555-789-0123', 3),
('David', 'Lee', 'Jones', '654 Maple Dr, Oldcity, USA', '1995-03-25', '555-234-5678', 4),
('Aarav', NULL, 'Patel', 'B-12 Park Lane, Chennai, India', '2000-01-10', '91-9876543210', 5),
('Zara', 'M', 'Khan', 'C-45 Lake View, Mumbai, India', '1998-08-19', '91-8765432109', 5),
('Raj', 'Kumar', 'Singh', 'D-78 Green Park, Delhi, India', '1993-12-05', '91-7654321098', 5);

INSERT INTO BorrowedBy (CustomerID, ISBN, BorrowingDate, ReturnDate) VALUES
(1, '978-0451524935', '2025-01-10', '2025-01-31'),
(2, '978-0062315007', '2025-02-05', '2025-02-26'),
(3, '978-0141439518', '2025-01-20', '2025-02-10'),
(4, '978-0547928227', '2025-02-15', '2025-03-08'),
(5, '978-0132350884', '2025-01-05', '2025-01-26'),
(6, '978-0134757599', '2025-02-10', '2025-03-03'),
(7, '978-0307744432', '2025-01-15', '2025-02-05'),
(8, '978-0131103627', '2025-02-20', '2025-03-13');

UPDATE Book SET AvailabilityStatus = FALSE WHERE ISBN IN (
    SELECT ISBN FROM BorrowedBy WHERE ReturnDate > CURDATE()
);
