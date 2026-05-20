import { sendEmail } from "../lib/email.js";
import { User } from "../models/user.mode.js";
import { checkPassword, generateAccessToken, generateRefreshToken, hashPassword } from "../utils/index.js";

import jwt from "jsonwebtoken";

const getAppUrl = () => {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}`
};

export const registerHandler = async (_req, res) => {
  const { name, email, password } = _req.body;

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "The user with this email is already exist."
      })
    };

    const passwordHash = await hashPassword(password);
    const newlyCreatedUser = await User.create({
      email: normalizedEmail,
      passwordHash,
      role: "user",
      isEmailVerified: false,
      twoFactorEnabled: false,
      name
    });


    // Email Verification
    const verifyToken = jwt.sign(
      {
        sub: newlyCreatedUser.id
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: '1d'
      }
    );

    const verifyUrl = `${getAppUrl()}/api/auth/verify-email?token=${verifyToken}`;

    await sendEmail(
      newlyCreatedUser.email,
      "Verify your email",
      `<p>Please verify your email by clicking this link</p>
       <p>
          <a href="${verifyUrl}">${verifyUrl}</a>
       </p>
      `
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newlyCreatedUser.id,
        email: newlyCreatedUser.email,
        role: newlyCreatedUser.role,
        isEmailVerified: newlyCreatedUser.isEmailVerified,
      }
    })



  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

export const verifyEmailHandler = async (_req, res) => {
  const token = _req.query.token;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Verification token is missing."
    })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!"
      })
    };

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: "Email is already verified."
      })
    };

    user.isEmailVerified = true,
      await user.save();

    return res.status(201).json({
      success: true,
      message: "Email is now verified, you can log in now."
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const loginHandler = async (_req, res) => {
  const { email, password } = _req.body;


  try {
    const normalizedEmail = email.toLowerCase().trim();


    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password!"
      });
    };

    const isMatch = await checkPassword(password, user.passwordHash);


    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      })
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before loggin in..."
      })
    };

    const accessToken = generateAccessToken(user.id, user.role, user.tokenVersion);
    const refreshToken = generateRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV == "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // must be a number
    });

    return res.status(201).json({
      success: true,
      message: "You are logged in successfully.",
      accessToken : accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

export const profileHandler = async (req, res) => {
  try {
    // req.user is already set by requireAuth middleware
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

