'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { getEnv } from '@/lib/env';

const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export async function verifyPassword(formData: FormData) {
  try {
    const rawData = {
      password: formData.get('password'),
    };

    const validated = passwordSchema.parse(rawData);
    const { HOME_PAGE_PASSWORD } = getEnv();

    // If no password is set in env, allow access
    if (!HOME_PAGE_PASSWORD) {
      return { success: true };
    }

    // Verify password
    if (validated.password !== HOME_PAGE_PASSWORD) {
      return { success: false, error: 'Incorrect password' };
    }

    // Set cookie to remember verification (expires in 7 days)
    const cookieStore = await cookies();
    cookieStore.set('home_page_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid input',
      };
    }
    return { success: false, error: 'An error occurred' };
  }
}

export async function checkPasswordVerification() {
  const { HOME_PAGE_PASSWORD } = getEnv();

  // If no password is set, allow access
  if (!HOME_PAGE_PASSWORD) {
    return true;
  }

  const cookieStore = await cookies();
  const verified = cookieStore.get('home_page_verified');
  return verified?.value === 'true';
}

