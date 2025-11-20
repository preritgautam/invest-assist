// 'use client';

// import { SignIn } from "@clerk/nextjs";
// import Link from "next/link";

// export default function SignInPage() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
//       <SignIn 
//         appearance={{
//           elements: {
//             rootBox: "mx-auto",
//             card: "shadow-lg",
//             footer: "hidden"
//           }
//         }}
//         forceRedirectUrl="/"
//         signUpUrl="/sign-up"
//       />
      
//       {/* Forgot Password Link */}
//       <div className="mt-6 text-center bg-white px-8 py-4 rounded-lg shadow-lg w-full max-w-md">
//         <Link 
//           href="/forgot-password" 
//           className="text-sm font-medium text-gray-600 hover:text-green-600 hover:underline"
//         >
//           Forgot your password?
//         </Link>
//       </div>
//     </div>
//   );
// }

"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // CLERK BYPASSED - using local form for v0 Vercel compatibility
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!email || !password) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }
      
      // Bypass authentication - just redirect to home
      // In production, you would integrate your own auth system here
      router.push("/");
    } catch (err) {
      setError("An error occurred during sign in");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-sm text-gray-600 mb-6">
            Enter your credentials to continue
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-gray-600 hover:text-green-600 hover:underline block"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
