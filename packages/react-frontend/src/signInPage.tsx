// src/signInPage.jsx
import { useState } from "react";

export default function SignInPage() {
  const handleSignIn = () => {
    console.log("Sign in button clicked!"); //temporary console log 
  };

  return (
    <div className="min-h-screen bg-stone-300 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Room8
        </h1>

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
          Sign In
        </h2>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block text-gray-600 mb-2">username</label>
            <input
              type="text"
              placeholder="barrybbenson"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2">password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}