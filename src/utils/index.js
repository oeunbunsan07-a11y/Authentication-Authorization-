import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

export const checkPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

export const generateAccessToken = (userId, role, tokenVersion) => {
  const payload = {
    sub: userId,
    role,
    tokenVersion
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '30m'
  });
}

export const generateRefreshToken = (userId, tokenVersion) => {
  const payload = {
    sub: userId,
    tokenVersion
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '7d'
  });
}
