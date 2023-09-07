const isLogin = (req, res, next) => {
  try {
    if (req.session.login) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error);
  }
};

const isLogout = (req, res, next) => {
  try {
    if (req.session.login) {
      res.redirect("/admin/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
