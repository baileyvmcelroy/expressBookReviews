const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user=>user.username===username && user.password===password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username=req.body.username;
  const password=req.body.password;
  if(!username || !password){
    return res.status(400).json({message:"Username and password are required."});
  }
  if(!authenticatedUser(username,password)){
    return res.status(401).json({message:"Invalid login. Check Username and password"});
  }
  const accessToken=jwt.sign(
    {username:username},
    "access",
    {expiresIn:60*60}
  );
  req.session.authorization={
    accessToken,username
  };
  return res.status(200).json({ message: "Login successful as registered user!"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn=req.params.isbn;
  const review=req.query.review;
  const username=req.session.authorization.username;
  if(!review){
    return res.status(400).json({message:"Review query parameter is required"});
  }
  if(!books[isbn]){
    return res.status(404).json({message:"Book not found"});
  }
  if(!books[isbn].reviews){
    books[isbn].reviews={};
  }
  books[isbn].reviews[username]=review;
  return res.status(200).json({
    message:"Review added/updated successfully.",
    reviews:books[isbn].reviews
  });
});
// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (!books[isbn].reviews) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for this user on this book" });
    } 
    delete books[isbn].reviews[username]; 
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: books[isbn].reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
