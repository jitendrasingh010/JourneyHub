const jwt=require("jsonwebtoken");
const User = require("../model/userModel");
const secretKey=process.env.jwt_secret || process.env.JWT_SECRET;
module.exports=async (req,res,next)=>{
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token=authHeader.split(" ")[1];
    const userVerified=jwt.verify(token,secretKey);
    if(!userVerified){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const email=userVerified.email;
    const userdata=await User.findOne({email});
    if(!userdata){
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user=userdata;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}
