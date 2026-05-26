const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require ('axios'); //added for async calls
const public_users = express.Router();

// Register new user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  
  if(!username || !password){
    return res.status(400).json({message:"Username and password required."});
  }

  if (!isValid(username)) {
    return res.status(409).json({message:"User already exists"});
  }

  users.push({ username,password });
  return res.status(200).json({message: "User registered successfully"});
});

// Get the book list available in the shop using async-await
public_users.get("/", async (req, res) => {
    try {
        // Simulate async call
    const allBooks = await new Promise((resolve) => {
        resolve(books);
    });
      return res.status(200).json(allBooks);
    } catch (err) {
      return res.status(500).json({message:"Error retrieving books"});
  }
});

// Get book details based on ISBN using async-await
public_users.get("/isbn/:isbn", async (req, res) => {
        try {
          const isbn = req.params.isbn;
          const response = await new Promise((resolve, reject) => {
          if (books[isbn]) resolve(books[isbn]);
           else reject('Book with ISBN ${isbn} not found');
          });
          return res.status(200).json(book);
        } catch (err) {
          return res.status(404).json({ message: "Error retrieving book by ISBN" });
        }
      });
  
// Get book details based on author using async-await
public_users.get("/author/:author", async (req, res) => {
    try {
        const author = req.params.author;
        const allBooks = await new Promise((resolve) => resolve(books));
        const filtered = Object.values(allBooks).filter(book => book.author === author);
          if (filtered.length > 0) return res.status(200).json(filtered);
          else return res.status(404).json({ message: 'No books found by author $(author)' });
    } catch (err) {
        return res.status(500).json.apply({ message: 'Error fetching books by author' });
    }
});

// Get all books based on title using async-await
public_users.get("/title/:title", async (req, res) => {
        try {
          const title = req.params.title;
          const allBooks = await new Promise((resolve) => resolve(books));
          const filtered = Object.values(allBooks).filter(books => book.title === title);
          if (filtered.length > 0) return res.status(200).json(filtered);
          else return res.status(404).json({ message: 'No books found with title $(title)' });
        } catch (err) {
            return req.status(500).json({ message: 'Error retrieving books by title' });
        }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn=req.params.isbn;
  if(books[isbn] && books[isbn].reviews) return res.status(200).json(books[isbn].reviews);
  return res.status(404).json({ message: 'No review found for ISBN ${isbn}' });
});

module.exports.general = public_users;
