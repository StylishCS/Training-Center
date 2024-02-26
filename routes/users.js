var express = require("express");
const {
  userSignupController,
  resendOTP,
  verifyUser,
  loginController,
  verifyLogin,
} = require("../controllers/userAuth");
const UserPrivileges = require("../middlewares/protect");
var router = express.Router();

router.post("/login", loginController);
router.post("/signup", userSignupController);
router.post("/resendOTP", UserPrivileges, resendOTP);
router.post("/verify", UserPrivileges, verifyUser);
router.post("/verifyLogin", UserPrivileges, verifyLogin);

/** MAIL TEMPLATE */
// router.get("/", (req, res) => {
//   res.render("../public/mail-template/index2.ejs", {
//     name: "Yusuf",
//     email: "joeshirf@gmail.com",
//     otp: 1234,
//   });
// });

module.exports = router;
