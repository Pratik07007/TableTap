import bcrypt from "bcryptjs";
import { sendRegistrationerificationEmail } from "../utils/registrationEmail";
import { sendPasswordResetEmail } from "../utils/passwordResetEmail";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";

export type TRegisterUser = {
  fName: string;
  lName: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
};

export const registerUserService = async (userData: TRegisterUser) => {
  try {
    const { fName, lName, email, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userAlreadyExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userAlreadyExists) {
      return {
        success: false,
        error: "User already exists",
      };
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET as string);

    const user = await prisma.user.create({
      data: {
        firstName: fName,
        lastName: lName,
        email,
        hash: hashedPassword,
        role: role.toUpperCase() as "ADMIN" | "USER",
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 5),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isEmailVerified: true,
      },
    });
    try {
      await sendRegistrationerificationEmail(email, token);
    } catch (error) {
      await prisma.user.delete({
        where: {
          email,
        },
      });
      return {
        success: false,
        error: "User registered failed",
      };
    }

    return {
      message: "User registered successfully an email is sent for verification",
      success: true,
      data: { ...user },
    };
  } catch (error) {
    return {
      error: "User registration failed",
      success: false,
    };
  }
};

export const verifyEmailService = async (token: string) => {
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET as string);
    const { email, type } = verify as { email: string; type: string };
    if (type != "verify") {
      return {
        success: false,
        message: "Invalid or expired token",
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        return {
          message: "Invalid or expired token",
          success: false,
        };
      }
      await prisma.user.update({
        where: {
          email: user.email,
        },
        data: {
          isEmailVerified: true,
        },
      });
      return {
        message: "Email verified successfully",
        success: true,
      };
    } catch (error) {
      return {
        message: "Invalid or expired token",
        success: false,
        error,
      };
    }
  } catch (error) {
    return {
      message: "Email verification failed",
      success: false,
      error,
    };
  }
};

export const loginService = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      error: "User not found",
      success: false,
    };
  }
  if (!user.isEmailVerified) {
    return {
      error:
        "Email not verified please check your email we have send verification email",
      success: false,
    };
  }
  const isPasswordValid = await bcrypt.compare(password, user.hash);
  if (!isPasswordValid) {
    return {
      message: "Invalid password",
      success: false,
    };
  }
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "24h" }
  );
  return {
    message: "Login successful",
    success: true,
    token,
  };
};

export const forgotPasswordService = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await sendPasswordResetEmail(email);
    }
    return {
      message: "If the email exists, a reset link has been sent",
      success: true,
    };
  } catch (error) {
    return {
      message: "Failed to initiate password reset",
      success: false,
      error,
    };
  }
};

export const resetPasswordService = async (
  token: string,
  newPassword: string
) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
      type?: string;
    };
    if (payload.type && payload.type !== "reset") {
      return {
        message: "Invalid token type",
        success: false,
      };
    }
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      return {
        message: "Invalid or expired token",
        success: false,
      };
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: user.email },
      data: { hash: hashed },
    });
    return {
      message: "Password reset successfully",
      success: true,
    };
  } catch (error) {
    return {
      message: "Invalid or expired token",
      success: false,
      error,
    };
  }
};

export const verifyTokenService = async (token: string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
      role: string;
      name: string;
    };
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        resurant: true,
      },
    });
    if (!user) {
      return {
        message: "Invalid or expired token",
        success: false,
      };
    }
    return {
      message: "Token verified successfully",
      success: true,
      data: { user },
    };
  } catch (error) {
    return {
      message: "Invalid or expired token",
      success: false,
      error,
    };
  }
};
