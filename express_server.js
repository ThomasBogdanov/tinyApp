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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"

// };

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
}

function urlsForUser(id) {
  let allAccURLS = [];
  for (keys in urlDatabase) {
    if (urlDatabase[keys]["userID"] === id) {
      allAccURLS.push(keys);
    }
  } 
  return allAccURLS;
}


let defaultTemplateVars = {user: undefined};
let ifLogged = null;


//register
app.get("/register", (req, res) => {
  let templateVars = {
    user: undefined
  };
  res.render("urls_registration", templateVars);
});

//urls_index
app.get("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const user = users[userID];
  let templateVars = { 
    urls: urlsForUser(req.cookies["userID"]),
    user,
    allURLS: urlDatabase
  };
  console.log(templateVars["urls"]);

  res.render("urls_index", templateVars);
});

//urls_new
app.get("/urls/new", (req, res) => {
  if (!ifLogged) {
    res.redirect("/login");
  }
  let shortURL = req.cookies["userID"];
  let templateVars = {
    user: req.cookies["userID"]
  };
  res.render("urls_new", templateVars);
});

//edit
app.post("/urls/:shortURL/edit", (req, res) => {
  const newName = req.body.newName;
  const id = req.params.shortURL;
  urlDatabase[id]["longURL"] = newName;
  // urlDatabase[id]["userID"] = users[userID]; ---> dont need for edits yet
  res.redirect(`/urls/${id}`);
});

//Urls_show
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]["longURL"], 
    user: req.cookies["userID"] };
  res.render("urls_show", templateVars);
});

//string Shortening
app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = {longURL: req.body.longURL, userID: req.cookies["userID"]};
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
  delete urlDatabase[id];
  res.redirect('/urls');
});

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
  if (found["password"] !== req.body.password) {
    return res.send('Password incorrect!').status(403);
  }
  ifLogged = true;
  res.cookie('userID', found["id"]);
  res.redirect("/urls");
});



//Logout
app.post("/logout", (req, res) => {
  let userID = req.cookies["userID"];
  res.cookie("userID", "", {expires: new Date(0)});
  res.redirect("/urls");
  ifLogged = false;
});

//register
app.post("/register", (req, res) => {
  const randomStr = generateRandomString();
  let id = randomStr;
  let email = req.body.email;
  let password = req.body.password;
  let newUser = (randomStr);
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
  ifLogged = true;
  res.cookie('userID', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

