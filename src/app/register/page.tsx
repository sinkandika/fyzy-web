"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/config";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!name.trim()) return setError("Please enter your name.");
    if (!email) return setError("Please enter an email.");
    if (password.length < 6)
      return setError("Password should be at least 6 characters.");
    if (password !== passwordConfirm)
      return setError("Passwords do not match.");

    setLoading(true);

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ⬅️ SAVE NAME TO FIREBASE PROFILE
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      toast.success("Sign up Success!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Registration failed");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#F4F2EF] h-screen flex flex-col items-center gap-y-20">
      <Toaster position="top-center" />

      <div className="w-full max-w-xl flex justify-center mt-30">
        <Image
          src="/fyzy-full-logo.svg"
          alt="fyzy logo"
          width={180}
          height={180}
        />
      </div>

      <div className="bg-white w-full max-w-xl px-15 h-200 flex flex-col justify-center rounded-xl">
        <div className="py-10 flex-1">
          <h1 className="font-saucesans text-3xl text-[#191413]">Sign Up</h1>
        </div>

        <form
          onSubmit={handleRegister}
          className="flex-7 flex flex-col gap-5 font-saucesans"
        >
          <div>
            <label className="block mb-1 text-[#9B9E9A]">Name</label>
            <input
              type="text"
              className="w-full border border-[#5B5B5B] focus:outline-[#637A54] px-3 py-2 rounded-md"
              placeholder="Kimi no nawa..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-[#9B9E9A]">Email</label>
            <input
              type="email"
              className="w-full border border-[#5B5B5B] focus:outline-[#637A54] px-3 py-2 rounded-md"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-[#9B9E9A]">Password</label>
            <input
              type="password"
              className="w-full border border-[#5B5B5B] focus:outline-[#637A54] px-3 py-2 rounded-md"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-[#9B9E9A]">Confirm Password</label>
            <input
              type="password"
              className="w-full border border-[#5B5B5B] focus:outline-[#637A54] px-3 py-2 rounded-md"
              placeholder="Re-enter your password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          <div>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full bg-[#637A54] text-white py-3 rounded-md hover:bg-[#798C69] transition"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="flex flex-2 justify-center">
          <p className="text-sm text-[#191413] text-center">
            Already have an account?{" "}
            <a href="/login" className="text-[#637A54] hover:text-[#798C69]">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
