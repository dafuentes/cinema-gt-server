const jwt = require("jsonwebtoken");

const config = process.env;
const TOKEN_KEY = process.env.TOKEN_KEY || "devdf2023";

const verifyToken = (req, res, next) => {
  /* const token =
    req.body.token || req.query.token || req.headers["x-access-token"]; */

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
