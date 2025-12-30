"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config"; 
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        router.push("/dashboard");
    } catch (err: unknown) {
        if (err instanceof Error) {
        setError(err.message);
        } else {
        setError("An unknown error occurred");
        }
    } finally {
        setLoading(false);
    }
    };

  return (
    <main className="bg-[#F4F2EF] h-screen flex flex-col items-center gap-y-20">
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
          <h1 className="font-saucesans text-3xl text-[#191413]">Sign In</h1>
          </div>
          <form 
          onSubmit={handleLogin} //login system in form area
          className="flex-4 flex flex-col gap-5 font-saucesans"
          >
            <div className="">
              <label className="block mb-1 text-[#9B9E9A]">Email</label>
              <input
                type="email"
                className="w-full border border-[#5B5B5B] focus:outline-[#637A54] px-3 py-2 rounded-md"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="">
              <label className="block mb-1 text-[#9B9E9A]">Password</label>
              <input
                type="password"
                className="w-full border border-[#5B5B5B] focus:outline-[#637A54] px-3 py-2 rounded-md"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit" /* connect to onSubmit={handleLogin} */
                disabled={loading}
                className="mt-5 w-full bg-[#637A54] text-white py-3 rounded-md hover:bg-[#7E9370] transition"
              >
                Sign In
              </button>
            </div>
          </form>
          <div className="flex-3 justify-center items-start flex gap-x-5">
              <button className="flex w-full gap-x-2 py-3 px-2 items-center justify-center hover:bg-[#EDEDED] rounded-md">
                <Image
                src="/google-icon.svg"
                alt="google icon"
                width={25}
                height={25}
                />
                <p>Login with Google</p>
              </button>
              <button className="flex w-full gap-x-2 py-3 px-2 items-center justify-center hover:bg-[#EDEDED] rounded-md">
                <Image
                src="/microsoft-icon.svg"
                alt="microsoft icon"
                width={25}
                height={25}
                />
                <p>Login with Microsoft</p>
              </button>
          </div>
          <div className=" flex flex-2 justify-center">
            <p className="text-sm text-[#191413] text-center">
              {"Don't have an account"}?{" "}
              <a href="/register" className="text-[#637A54] hover:text-[#7E9370]">
                Create Fyzy account
              </a>
            </p>            
          </div>
        </div>        
    </main>
  );
}
