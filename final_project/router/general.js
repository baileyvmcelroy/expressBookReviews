const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username=req.body.username;
  const password=req.body.password;
  if(!username || !password){
    return res.status(400).json({message:"Username and password are required."});
  }
  if(users.some(user=>user.username===username)){
    return res.status(409).json({message:"User already exists"});
  }
  users.push({username,password});
  return res.status(201).json({message: "User successfully registered. You may log in!"});
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
    try {
      const response = await axios.get("http://localhost:5000/booksdata");
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
    try {
      const isbn = req.params.isbn;
      const response = await axios.get("http://localhost:5000/booksdata");
      const allBooks = response.data;
  
      if (allBooks[isbn]) {
        return res.status(200).send(JSON.stringify(allBooks[isbn], null, 4));
      }
  
      return res.status(404).json({ message: "Book not found" });
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving book by ISBN" });
    }
  });
  
// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
    try {
      const author = req.params.author;
      const response = await axios.get("http://localhost:5000/booksdata");
      const allBooks = response.data;
  
      const matchedBooks = Object.keys(allBooks)
        .filter(key => allBooks[key].author === author)
        .map(key => ({ isbn: key, ...allBooks[key] }));
  
      if (matchedBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchedBooks, null, 4));
      }
  
      return res.status(404).json({ message: "No books found for this author" });
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving books by author" });
    }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
    try {
      const title = req.params.title;
      const response = await axios.get("http://localhost:5000/booksdata");
      const allBooks = response.data;
  
      const matchedBooks = Object.keys(allBooks)
        .filter(key => allBooks[key].title === title)
        .map(key => ({ isbn: key, ...allBooks[key] }));
  
      if (matchedBooks.length > 0) {
        return res.status(200).send(JSON.stringify(matchedBooks, null, 4));
      }
  
      return res.status(404).json({ message: "No books found for this title" });
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving books by title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
// write code here
    const isbn=req.params.isbn;
  if(books[isbn]){
    return res.status(200).send(JSON.stringify(books[isbn].reviews,null,4));
  }
  return res.status(404).json({message: "Books not found"});
});

module.exports.general = public_users;
