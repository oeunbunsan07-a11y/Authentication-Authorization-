

export const requireRole = (role) => {
  return (req, res, next) => {
    const authUser = req.user;

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, You are not enter the building."
      })
    };

    if (authUser.role != role) {
      return res.status(403).json({
        success: false,
        message: "You do not the correct role to access this route."
      })
    };

    next();
  }
}
