const { assert } = require('chai');

const { emailChecker } = require('../helper.js');

const testUsers = {
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

describe('emailChecker', function() {
  it('should return true with valid email', function() {
    const user = emailChecker("user@example.com", testUsers)
        assert.isTrue(user);
  });
});

describe('emailChecker', function() {
    it('should return false with an invalid email', function() {
      const user = emailChecker("user123412@example.com", testUsers)
          assert.isFalse(user);
    });
  });
  