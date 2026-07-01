import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'nebuloid_secret_key_12345';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  isSignUp: z.boolean().optional().default(false),
});

/**
 * POST /api/auth
 * Handles user login (isSignUp = false) and registration (isSignUp = true)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = authSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, isSignUp } = validation.data;
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (isSignUp) {
      if (user) {
        return NextResponse.json(
          { error: 'User already exists with this email address.' },
          { status: 400 }
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const defaultName = name || email.split('@')[0];
      
      // Create new user record
      user = await prisma.user.create({
        data: {
          email,
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          password: hashedPassword,
        },
      });
    } else {
      // Login mode
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      // Check password correctness
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only JWT Cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth API POST Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error. Authentication failed.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth
 * Verifies if the user session cookie is valid and returns user details
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. No active session token found.' },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. User does not exist.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Auth API GET Error:', error);
    const response = NextResponse.json(
      { error: 'Session expired or invalid token.' },
      { status: 401 }
    );
    const cookieStore = await cookies();
    cookieStore.delete('token');
    return response;
  }
}

/**
 * DELETE /api/auth
 * Logouts user by clearing JWT cookies
 */
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.'
    });

    const cookieStore = await cookies();
    cookieStore.delete('token');

    return response;
  } catch (error) {
    console.error('Auth API DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error. Logout failed.' },
      { status: 500 }
    );
  }
}
