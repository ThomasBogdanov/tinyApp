const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let characterLength = chars.length;
  for (let i = 1; i<7; i++) {
    result += chars.charAt(Math.floor(Math.random() * characterLength));
  }
  return result;
}

function emailChecker(newUserEmail) {
  for (eachUser in users) {
    if (newUserEmail === users[eachUser]["email"]) {
      return true;
    }
  }
  return false;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}





//register
app.get("/register", (req, res) => {
  let templateVars = {
    userName: req.cookies["userName"]
  };
  res.render("urls_registration", templateVars);
});

//urls_index
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, userName: req.cookies["userName"] };
  console.log(users);
  res.render("urls_index", templateVars);
});

//urls_new
app.get("/urls/new", (req, res) => {
  let templateVars = {
    userName: req.cookies["userName"]
  };
  res.render("urls_new", templateVars);
});

//edit
app.post("/urls/:shortURL/edit", (req, res) => {
  const newName = req.body.newName;
  const id = req.params.shortURL;
  urlDatabase[id] = newName;
  res.redirect(`/urls/${id}`);
});

//Urls_show
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userName: req.cookies["userName"] };
  res.render("urls_show", templateVars);
});

//string Shortening
app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect('/urls/' + randomStr);
});

//longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL.includes('http://')) {
    res.redirect(longURL);
  } else {
    longURL = 'http://' + longURL;
    res.redirect(longURL);
  }
});


//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//Login + cookies
app.post("/login", (req, res) => {
  let userName = req.body.login;
  res.cookie('userName', userName);
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  let userName = req.cookies["userName"];
  res.cookie("userName", "", {expires: new Date(0)});
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const randomStr = generateRandomString();
  let id = randomStr;
  let email = req.body.email;
  let password = req.body.password;
  let newUser = ("user" + randomStr);
  if (email === '' || password === '') {
    return res.status(400).send('Email or password field(s) are empty');
  } else if (emailChecker(email)) {
    return res.status(400).send('Email is already in use');
  }
  users[newUser] = {
    "id": id,
    "email": email,
    "password": password
  };
  res.cookie('userID', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
