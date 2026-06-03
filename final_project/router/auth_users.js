const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); //Assuming this is the module that contains the books object
const regd_users = express.Router();

let users = [
{
    firstName: "Bailey",
    lastName: "McElroy",
    email: "baileymcelroyv@outlook.com",
    DOB: "10-24-2000",
    password: "password123"
},
{
    firstName: "Steven",
    lastName: "Gray",
    email: "mrgutiman@icloud.com",
    DOB: "04-06-1992",
    password: "mysecretpass"
},
];

// Helper functions; check if username is valid
const isValid = (username) => {
    return !users.some(user => user.email.toLowerCase() === username.toLowercase());
};

// Check if username/password match a registered user
const authenticatedUser = (username,password) => {
return users.find(user => user.email.toLowerCase() === username.toLowerCase());
return user && user.password === password;
};

// Login route for registered users
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if(!isValid(username)) {
    return res.status(404).json({message:"Invalid username"});
  }

  if(!authenticatedUser(username, password)) {
    return res.status(401).json({message:"Invalid username or password"});
  }

  // Generate JWT (optional)
  if (user) {
    const accessToken = jwt.sign(
        { email:user.email },
        'access',
        { expiresIn: '2h' }
    );
    req.session.authorization = { accessToken };
    return res.status(200).json({ message: "User successfully logged in", accessToken});
  } else {
    return res.status(500).json({ message: "An error occured"});
  }
});

// Add or update a book review 
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

  if(!token) {
    return res.status(401).json({ message: "User is not authenticated" });
  }
  try {
    const user = jwt.verify(token, 'access'); //Ensure the key matches the signing key
    const username = user.email;
  }

  if(!books[isbn]) {
    return res.status(404).json({message: "Book not found" });
  }

 
  books[isbn].reviews = books[isbn].reviews || {};
  books[isbn].reviews[username] = review; 

  return res.status(200).json({message: '${username} ${review}'});
} catch (err) {
    return res.status(403).json({message: "Invalid token or session expired"});
}
});

  // Add or update review for this user
  books[isbn].reviews[username]=review;

  return res.status(200).json({
    message:"Review for ISBN ${isbn} by ${username} added/updated successfully.",
    reviews:books[isbn].reviews
  }
});

// Delete book review by the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    try {
        const user = jwt.verify(token, 'access');
        const username = user.email;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete the review
    if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username]; 
    return res.status(200).json({message: "Review deleted successfully" });
    } else {
        return res.status(404).json({message: "Review not found for this user" });
    }
  } catch (err) {
    return res.status(403).json({message: "Invalid token or session expired" });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
