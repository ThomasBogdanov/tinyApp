function emailChecker(newUserEmail, database) {
    for (eachUser in database) {
      if (newUserEmail === database[eachUser]["email"]) {
        return true;
      }
    }
    return false;
};

module.exports = { emailChecker };