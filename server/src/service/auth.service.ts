import bcrypt from 'bcryptjs';
import { sendRegistrationerificationEmail } from '../utils/registrationEmail';
import { sendPasswordResetEmail } from '../utils/passwordResetEmail';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';

export type TRegisterUser = {
  fName: string;
  lName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
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
        code: 409,
        success: false,
        error: 'User already exists',
      };
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: '5m',
    });

    await prisma.user.create({
      data: {
        firstName: fName,
        lastName: lName,
        email,
        hash: hashedPassword,
        role: role.toUpperCase() as 'ADMIN' | 'USER',
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 5),
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
        code: 500, //internal server error(failed to send email)
        success: false,
        error: 'Registration Email sent failed, please try regisering again',
      };
    }
    return {
      code: 201, //created
      message: 'User registered successfully an email is sent for verification',
      success: true,
    };
  } catch (error) {
    console.error('ERROR FROM AUTH SERVICE', error);
    return {
      code: 500, //internal server error
      error: 'User registration failed',
      success: false,
    };
  }
};

export const verifyEmailService = async (token: string) => {
  try {
    const userWithToken = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });
    if (!userWithToken || (userWithToken.emailVerificationExpires && userWithToken.emailVerificationExpires < new Date())) {
      return {
        code: 400,
        error: 'Invalid or expired token',
        success: false,
      };
    }
    await prisma.user.update({
      where: {
        id: userWithToken.id,
      },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
    return {
      code: 200,
      message: 'Email verified successfully',
      success: true,
    };
  } catch (error) {
    console.error('ERROR FROM AUTH SERVICE', error);
    return {
      code: 500,
      error: 'Invalid or expired token',
      success: false,
    };
  }
};

export const resendVerificationEmailService = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        code: 404,
        error: 'User not found',
        success: false,
      };
    }
    if (user.isEmailVerified) {
      return {
        code: 409,
        error: 'Email already verified',
        success: false,
      };
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: '5m' });
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 5),
      },
    });
    try {
      await sendRegistrationerificationEmail(email, token);
    } catch (error) {
      console.error('ERROR FROM AUTH SERVICE', error);
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
      return {
        code: 500,
        error: 'Failed to send verification email',
        success: false,
      };
    }
    return {
      code: 200,
      message: 'Verification email sent successfully',
      success: true,
    };
  } catch (error) {
    console.error('ERROR FROM AUTH SERVICE', error);
    return {
      code: 500,
      error: 'Failed to send verification email',
      success: false,
    };
  }
};

export const loginService = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      code: 404,
      error: 'User not found',
      success: false,
    };
  }
  if (!user.isEmailVerified) {
    return {
      code: 401,
      error: 'Email not verified please check your email we have send verification email',
      success: false,
    };
  }
  const isPasswordValid = await bcrypt.compare(password, user.hash);
  if (!isPasswordValid) {
    return {
      code: 401,
      error: 'Invalid password',
      success: false,
    };
  }
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  );

  return {
    code: 200,
    message: 'Login successful',
    success: true,
    token,
  };
};

export const forgotPasswordService = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: '5m' });

      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: token,
          resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 5),
        },
      });
      try {
        await sendPasswordResetEmail(email, token);
      } catch (error) {
        await prisma.user.update({
          where: {
            email,
          },
          data: {
            resetPasswordToken: null,
            resetPasswordExpires: null,
          },
        });
        return {
          code: 500,
          message: 'Failed to send reset email',
          success: false,
        };
      }
    }
    return {
      code: 200,
      message: 'If the email exists, a reset link has been sent',
      success: true,
    };
  } catch (error) {
    return {
      code: 500,
      message: 'Failed to initiate password reset',
      success: false,
    };
  }
};

export const resetPasswordService = async (token: string, newPassword: string) => {
  try {
    const userWithResetToken = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
      },
    });
    if (!userWithResetToken || (userWithResetToken.resetPasswordExpires && userWithResetToken.resetPasswordExpires < new Date())) {
      return {
        code: 400,
        error: 'Invalid or expired token',
        success: false,
      };
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userWithResetToken.id },
      data: {
        hash: hashed,
      },
    });
    await prisma.user.update({
      where: { id: userWithResetToken.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    return {
      code: 200,
      message: 'Password reset successfully',
      success: true,
    };
  } catch (error) {
    return {
      code: 500,
      error: 'Failed to reset password',
      success: false,
    };
  }
};
