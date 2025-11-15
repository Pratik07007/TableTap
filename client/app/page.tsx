"use client"
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Hello World</h1>
      {/* <Link href="/login">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Login</button>
      </Link>
      <Link href="/register?role=ADMIN">
        <button className="bg-green-500 text-white px-4 py-2 rounded-md">Register</button>
      </Link>
      <div onClick={() => {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        alert("Successfully logged out!");
      }}>
        <button className="bg-red-500 text-white px-4 py-2 rounded-md">LogOut</button>
      </div> */}
    </div>
  );
}
