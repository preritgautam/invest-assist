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

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  
  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/");
    }
  }, [isLoaded, userId, router]);
  
  // If user is signed in, don't show the forgot password link
  const showForgotPassword = isLoaded && !userId;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
            footer: "hidden"
          }
        }}
        forceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/"}
        signUpUrl="/sign-up"
        routing="path"
        path="/sign-in"
      />
      
      {/* Only show Forgot Password Link when not signed in */}
      {showForgotPassword && (
        <div className="mt-6 text-center bg-white px-8 py-4 rounded-lg shadow-lg w-full max-w-md">
          <Link 
            href="/forgot-password" 
            className="text-sm font-medium text-gray-600 hover:text-green-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      )}
    </div>
  );
}
