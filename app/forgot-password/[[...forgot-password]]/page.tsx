'use client';
import React from 'react';
import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  // Send password reset code to user's email
  async function sendResetCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setSuccessfulCreation(true);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.errors?.[0]?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  }

  // Reset password using the code
//   async function resetPassword(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const result = await signIn?.attemptFirstFactor({
//         strategy: 'reset_password_email_code',
//         code,
//         password,
//       });

//       if (result?.status === 'complete') {
//         setActive({ session: result.createdSessionId });
//         setComplete(true);
//         router.push('/');
//       }
//     } catch (err: any) {
//       console.error('Error:', err);
//       setError(err.errors?.[0]?.message || 'Failed to reset password');
//     } finally {
//       setLoading(false);
//     }
//   }

// Reset password using the code
async function resetPassword(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const result = await signIn?.attemptFirstFactor({
      strategy: 'reset_password_email_code',
      code,
      password,
    });

    if (result?.status === 'complete') {
      // Add null check for setActive
      if (setActive && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      }
      setComplete(true);
      router.push('/');
    }
  } catch (err: any) {
    console.error('Error:', err);
    setError(err.errors?.[0]?.message || 'Failed to reset password');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            {!successfulCreation
              ? "Enter your email to receive a reset code"
              : "Enter the code sent to your email"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!successfulCreation && !complete && (
          <form onSubmit={sendResetCode} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {successfulCreation && !complete && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Reset Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter 6-digit code"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {complete && (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                Password reset successful! Redirecting...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}