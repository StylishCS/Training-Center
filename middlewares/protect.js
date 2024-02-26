const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

async function UserPrivileges(req, res, next) {
  try {
    if (!req.header("Authorization")) {
      return res.status(401).json("FORBIDDEN");
    }
    const key = req.header("Authorization").split(" ")[0];
    const token = req.header("Authorization").split(" ")[1];
    if (key !== process.env.JWT_KEYWORD) {
      console.log("flag1");
      return res.status(401).json("FORBIDDEN");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded._id)
    const user = await User.findById(decoded._id);
    if (!user) {
      console.log("flag2");
      return res.status(401).json("FORBIDDEN");
    }
    req.userId = decoded._id;
    next();
  } catch (error) {
    console.log("flag3");
    return res.status(401).json("FORBIDDEN");
  }
}

module.exports = UserPrivileges;
