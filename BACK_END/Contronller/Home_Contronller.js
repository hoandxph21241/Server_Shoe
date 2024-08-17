// Shoes Dashboard

// Controller Code (e.g., homeController.js)
exports.Home = (req, res) => {
  // Assuming userRole is stored in req.session
  const userRole = req.session.userLogin ? req.session.userLogin.role : null;

  res.render('home/viewHome.ejs', {
    userRole: userRole
  });
};
