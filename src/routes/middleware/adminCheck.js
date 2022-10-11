const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminCheck = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({
      errors: [
        {
          msg: "Token not found",
        },
      ],
    });
  }

  // Authenticate token
  try {
    const user = await jwt.verify(token, "ACCESS_TOKEN_SECRET");
    req.user = user.userName;
    req.role = user.role;

    if (user.role !== "admin" && user.role !== "superAdmin") {
      res
        .status(403)
        .send("Solo un administrador puede realizar esa operación");
    } else {
      next();
    }
  } catch (error) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
};

module.exports = adminCheck;
