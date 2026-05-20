import { verifyAccessToken } from "../utils/index.js";
import { User } from "../models/user.mode.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(authHeader);

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    })
  };

  const token = authHeader.split(" ")[1];


  try {
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized and user not found"
      })
    };

    if (user.tokenVersion != payload.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Token Invalidated"
      })
    };

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    }

    next();
  } catch (error) {
    return res.status(501).json({
      success: false,
      message: error.message
    })
  }
}
