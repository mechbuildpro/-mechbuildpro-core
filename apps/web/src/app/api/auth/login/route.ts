import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // TODO: Replace with actual authentication logic
    // This is a mock implementation
    let userRole: 'admin' | 'user' | 'guest' | null = null;
    
    if (email === 'admin@example.com' && password === 'admin123') {
      userRole = 'admin';
    } else if (email === 'user@example.com' && password === 'user123') {
      userRole = 'user';
    }

    if (!userRole) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create the response
    const response = NextResponse.json({
      success: true,
      role: userRole,
      message: 'Login successful'
    });

    // Set authentication cookies
    response.cookies.set('isLoggedIn', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    response.cookies.set('userRole', userRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 