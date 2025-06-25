"use client";

import { useState } from 'react';
import { useFirebase } from '@/lib/firebase';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const { auth } = useFirebase();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isPhoneLogin) {
        // Handle phone login (requires additional steps like sending verification code)
        console.log('Phone login not yet implemented');
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        // Redirect or update UI on successful login
        console.log('Logged in with email');
      }
    } catch (error: any) {
      console.error('Login failed:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          {isPhoneLogin ? (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="phoneNumber"
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            <button
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              type="button"
              onClick={() => setIsPhoneLogin(!isPhoneLogin)}
            >
              {isPhoneLogin ? 'Use Email Login' : 'Use Phone Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
