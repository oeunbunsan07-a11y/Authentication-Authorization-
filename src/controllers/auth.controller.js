import { sendEmail } from "../lib/email.js";
import { User } from "../models/user.mode.js";
import { checkPassword, generateAccessToken, generateRefreshToken, hashPassword, verifyRefreshToken } from "../utils/index.js";

import jwt from "jsonwebtoken";
import crypto from "crypto";

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
      accessToken: accessToken,
      refreshToken: refreshToken,
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


// export const refreshTokenHandler = async (req, res) => {
//   try {
//     // Get old accessToken
//     const token = req.cookies.refreshToken;

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Refresh token is missing."
//       })
//     };

//     const payload = verifyRefreshToken(token);

//     const user = await User.findById(payload.sub);

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User not found."
//       })
//     };

//     if (user.tokenVersion != payload.tokenVersion) {
//       return res.status(401).json({
//         success: false,
//         message: "Refresh token Invalidated"
//       })
//     };

//     const newAccessToken = generateAccessToken(user.id, user.role, user.tokenVersion);
//     const newRefreshToken = generateRefreshToken(user.id, user.tokenVersion);

//     const isProd = process.env.NODE_ENV === "production";

//     res.cookie("refreshToken", newRefreshToken, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Token refreshed",
//       accessToken: newAccessToken,
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         isEmailVerified: user.isEmailVerified,
//         twoFactorEnabled: user.twoFactorEnabled,
//       }
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }


export const refreshTokenHandler = async (req, res) => {
  try {
    const token = req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing.",
      });
    }

    let payload;

    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has been invalidated.",
      });
    }

    const accessToken = generateAccessToken(
      user.id,
      user.role,
      user.tokenVersion
    );

    const refreshToken = generateRefreshToken(
      user.id,
      user.tokenVersion
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// This function is a Refresh Token API handler used in authentication systems with JWT (JSON Web Tokens).

// Its job is:

// Validate the refresh token sent by the client
// Check if the user is still valid
// Generate a new access token
// Generate a new refresh token
// Return both tokens back to the client


export const logoutHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Optional: check if refresh token exists
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    let payload;

    // Verify refresh token
    try {
      payload = verifyRefreshToken(refreshToken);
      console.log(payload);

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    // Find user
    const user = await User.findById(payload.sub);
    console.log(user);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Increment token version
    // This invalidates ALL existing refresh tokens
    //  + tokenVersion is increased during logout to make all existing refresh tokens immediately invalid.
    // Without increasing it, the refresh token would still work even after logout.
    user.tokenVersion += 1;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required."
      })
    };

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "If the acc with this email exist, we will send the reset link."
      })
    };

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetUrl = `${getAppUrl()}/api/auth/reset-password?token=${rawToken}`;

    await sendEmail(user.email, "Reset your password", `
        <p>You requested password reset. click on the link below to reset the password</p>
        <p>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
      `);

    return res.status(401).json({
      success: true,
      message: "Please kindly check your email"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const resetPasswordHandler = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(401).json({
      success: false,
      message: "Missing token or password"
    });
  };

  try {

    const tokenHash = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken : tokenHash,
      resetPasswordExpires : { $gt : new Date() }
    });

    if(!user){
      return res.status(401).json({
        success : false,
        message : "Invalid or token expired"
      })
    };

    const newPasswordHash = await hashPassword(password);
    user.passwordHash = newPasswordHash;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.tokenVersion = user.tokenVersion + 1;

    await user.save();

    return res.status(201).json({
      success : true,
      message : "Password reset successfully."
    });


  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
