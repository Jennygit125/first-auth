const jwt = require ('jsonwebtoken')
const User = require ("../models/model.js");
const logActivity = require("./activityLogger.js");


const isAuthentication = async (req, res, next) => {
const authHeader = req.headers.authorization;
if(!authHeader|| !authHeader.startsWith("Bearer ")){
    return res.status(401)
    .json({message: "No token provided"});
}//ensures you have token don't forget your key
const token = authHeader.split(" ")[1];
if(!token){
    return res.status(401)
    .json({message: "No token provided"});
}//space is not a token
try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password")
    if(!user){
        return res.status(401)
        .json({message: "User no longer exists"});
    }
    req.user = user;
    next();
}//checks and stuff
catch(e){
    console.log(e);
    if(e.name === "TokenExpiredError"){
        return res.status(401)
        .json({message: "Token expired, please login again"});
    }

    if(e.name === "JsonWebTokenError"){
        return res.status(401)
        .json({message: "Invalid token"});
    }

    return res.status(401)
    .json({message: "Unauthorized"});
}
};

const authorizeRoles = (...roles) => 
    /*role manager*/{
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      await logActivity({
        action: "FORBIDDEN_ACCESS",
        user: req.user._id,
        ipAddress: req.ip,
        metadata: {
          method: req.method,
          path: req.originalUrl,
          role: req.user.role,
          allowedRoles: roles
        }
      });

      return res.status(403).json({
        message: "Forbidden: insufficient permission"
      });
    }

    next();
  };
};
module.exports = {isAuthentication, authorizeRoles};
