import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import { sendRegistrationerificationEmail } from "../libs/registrationEmail.js";
import jwt from "jsonwebtoken";

export type TRegisterUser = {
  fName: string;
  lName: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
};

/**
 * registerUserService
 * -------------------
 * Accepts user registration data (first name, last name, email, password, role).
 * 1. Hashes the provided password.
 * 2. Checks if a user with the given email already exists.
 * 3. Creates the new user record in the database.
 * 4. Sends a registration verification email to the user.
 * 5. On email failure, rolls back the user creation.
 */

export const registerUserService = async (userData: TRegisterUser) => {
  try {
    const { fName, lName, email, password, role } = userData;
    console.log(fName, lName, email, password, role);
    const hashedPassword = await bcrypt.hash(password, 10);

    const userAlreadyExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userAlreadyExists) {
      return {
        message: "User already exists",
        success: false,
      };
    }
    const user = await prisma.user.create({
      data: {
        firstName: fName,
        lastName: lName,
        email,
        hash: hashedPassword,
        role,
      },
    });
    try {
      await sendRegistrationerificationEmail(email);
    } catch (error) {
      await prisma.user.delete({
        where: {
          email,
        },
      });
      console.error("Failed to send verification email:", error);
      return {
        message: "User registered failed",
        success: false,
        error,
      };
    }

    return {
      message: "User registered successfully an email is sent for verification",
      success: true,
      user,
    };
  } catch (error) {
    return {
      message: "User registration failed",
      success: false,
      error,
    };
  }
};

/**
 * verifyEmailService
 * ------------------
 * Accepts a verification token.
 * 1. Finds the user with the corresponding token.
 * 2. If found, marks the user as verified and clears the token.
 * 3. Returns success/failure status and accompanying messages.
 */
export const verifyEmailService = async (token: string) => {
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET as string);
    const { email } = verify as { email: string };
    console.log(email);
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
      message: "User not found",
      success: false,
    };
  }
  if (!user.isEmailVerified) {
    return {
      message:
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
    { email: user.email },
    process.env.JWT_SECRET as string
  );
  return {
    message: "Login successful",
    success: true,
    token,
  };
};
