const emailChecker = function(newUserEmail, database) {
  for (let eachUser in database) {
    if (newUserEmail === database[eachUser]["email"]) {
      return true;
    }
  }
  return false;
};

module.exports = { emailChecker };