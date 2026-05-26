const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (not already taken)
const isValid = (username) => {
    return !users.some(user => user.username === username);
};

// Check if usernmae/password match a registered user
const authenticatedUser = (username,password) => {
return users.some(user=>user.username===username && user.password===password);
};

// Login route for registered users
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if(!username || !password){
    return res.status(400).json({message:"Username and password are required."});
  }

  if(!authenticatedUser(username,password)){
    return res.status(401).json({message:"Invalid login. Check Username and password"});
  }

  // Save username in session
  req.session.usernmae = username;

  // Generate JWT (optional)
    const token = jwt.sign({ username: username }, "access_secret_key", {expiresIn: "1h" });

    return res.status(200).json({ message: "Login successful", token});
});

// Add or update a book review 
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;
  const review = req.query.review;

  if(!username) {
    return res.status(401).json({ message: "You must be logged in to post a review" });
  }

  if(!books[isbn]) {
    return res.status(404).json({message:"Book with ISBN ${isbn} not found" });
  }

  // Initialize reviews object if it doesn't exist
  if(!books[isbn].reviews){
    books[isbn].reviews={};
  }

  // Add or update review for this user
  books[isbn].reviews[username]=review;

  return res.status(200).json({
    message:"Review for ISBN ${isbn} by ${username} added/updated successfully.",
    reviews:books[isbn].reviews
  });
});

// Delete book review by the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;

    if (!username) {
      return res.status(401).json({ message: "You must be logged in to delete a review" });
    }

    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for ISBN ${isn} by user ${username}" });
    }

    // Delete the review
    delete books[isbn].reviews[username]; 

    return res.status(200).json({
      message: "Review for ISBN ${isbn} by ${username} deleted successfully",
      reviews: books[isbn].reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
