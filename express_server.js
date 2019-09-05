const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const { emailChecker } = require("./helper.js");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["hello"],
}))

function generateRandomString() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let characterLength = chars.length;
  for (let i = 1; i<7; i++) {
    result += chars.charAt(Math.floor(Math.random() * characterLength));
  }
  return result;
}

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
};

function urlsForUser(id) {
  let allAccURLS = [];
  for (keys in urlDatabase) {
    if (urlDatabase[keys]["userID"] === id) {
      allAccURLS.push(keys);
    }
  } 
  return allAccURLS;
}

let ifLogged = null;

// / page
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect(`/urls`)
  } else {
    res.redirect(`/login`)
  }
});

//register
app.get("/register", (req, res) => {
  let templateVars = {
    user: undefined
  };
  res.render("urls_registration", templateVars);
});

//urls_index
app.get("/urls", (req, res) => {
  if (!req.session.userID) {
    res.redirect(`login`)
  };
  const userID = req.session.userID;
  const user = users[userID];
  let templateVars = { 
    urls: urlsForUser(req.session.userID),
    user,
    allURLS: urlDatabase
  };

  res.render("urls_index", templateVars);
});

//urls_new
app.get("/urls/new", (req, res) => {
  if (!ifLogged) {
    res.redirect("/login");
  }
  const userID = req.session.userID;
  const user = users[userID];
  let templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

//edit
app.post("/urls/:shortURL/edit", (req, res) => {
  const newName = req.body.newName;
  const id = req.params.shortURL;
  urlDatabase[id]["longURL"] = newName;
  if (id !== undefined) {
    if (urlDatabase[id]["userID"] !== req.session.userID) {
      return res.send('Not your URL to delete!').status(403);
    } else {
  // urlDatabase[id]["userID"] = users[userID]; ---> dont need for edits yet
    res.redirect(`/urls/${id}`);
    }
  }
});

//Urls_show
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]["longURL"], 
    user: req.session.userID };
  res.render("urls_show", templateVars);
});

//string Shortening
app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = {longURL: req.body.longURL, userID: req.session.userID};
  res.redirect('/urls/' + randomStr);
});

//longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]["longURL"];
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
  if (id !== undefined) {
    if (urlDatabase[id]["userID"] !== req.session.userID) {
      return res.send('Not your URL to delete!').status(403);
    } else {
    delete urlDatabase[id];
    res.redirect('/urls');
    }
  }
});

//GET Login
app.get("/login", (req, res) => {
  let templateVars = {
    user: undefined
  };
  res.render("urls_login", templateVars);
  res.redirect("/urls");
});

//Login + cookies
app.post("/login", (req, res) => {
  let email = req.body.email;
  let found = null;
  for (userID in users) {
    if (users[userID]["email"] === email) {
      found = users[userID];
    }
  }
  if (!found){
  return res.send('Email does not exist').status(403);
  }
  if (!bcrypt.compareSync(req.body.password, found["hashedPassword"])) {
    return res.send('Password incorrect!').status(403);
  } else {
    ifLogged = true;
    // res.cookie('userID', found["id"]);
    console.log(userID);
    req.session.userID = found["id"];
    
    res.redirect("/urls");
  }
});

//Logout
app.post("/logout", (req, res) => {
  // let userID = req.session.userID;
  req.session = null;
  // res.cookie("userID", "", {expires: new Date(0)});
  res.redirect("/urls");
  ifLogged = false;
});

//POST register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  // let id = randomStr;
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  // let newUser = (randomStr);
  if (email === '' || password === '') {
    return res.status(400).send('Email or password field(s) are empty');
  } else if (emailChecker(email, users)) {
    return res.status(400).send('Email is already in use');
  }
  users[id] = {
    "id": id,
    "email": email,
    "hashedPassword": hashedPassword
  };
  ifLogged = true;
  req.session.userID = id;
  // res.cookie('userID', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

