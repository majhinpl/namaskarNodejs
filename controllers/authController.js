exports.getRegister = (req, res) => {
  res.render("register");
};

exports.postRegister = (req, res) => {
  // Handle registration logic
  res.redirect("/auth/login");
};

exports.getLogin = (req, res) => {
  res.render("login");
};

exports.postLogin = (req, res) => {
  // Handle login logic
  res.redirect("/");
};
