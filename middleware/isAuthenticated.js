const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { users } = require("../database");

exports.isAuthenticated = async (req, res, next) => {
  const token = req.cookies.jwtToken;
  console.log(token);
  if (!token || token === null || token === undefined) {
    return res.redirect("/login");
  }

  const decryptedResult = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  console.log(decryptedResult);

  const data = await users.findByPk(decryptedResult.id);
  if (!data) {
    return res.send("Invalid token");
  }
  req.userId = decryptedResult.id;
  next();
};
