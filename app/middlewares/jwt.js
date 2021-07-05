const jwt = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");

const authorizationMiddleware = jwt({
  secret: process.env.jwtSecret,
  algorithms: ["HS256"],
});

const tokenMiddleware = jwt({
  secret: process.env.jwtSecret,
  algorithms: ["HS256"],
  credentialsRequired: false,
});

module.exports = { jsonwebtoken, authorizationMiddleware, tokenMiddleware };