import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-100 to-orange-300 p-4">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold text-orange-500 mb-4 text-center">
          Welcome to VideoX - The Next Gen Video Conferencing App
        </h1>
        <p className="text-gray-700 text-center mb-8">
          Connect, chat, and video call with your friends in real time.
          <br />
          Please login or register to get started.
        </p>
        <div className="flex gap-6 w-full justify-center">
          <Link
            to="/login"
            className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition text-lg w-32 text-center"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 rounded-lg bg-white text-orange-500 border border-orange-500 font-semibold shadow hover:bg-orange-100 transition text-lg w-32 text-center"
          >
            Register
          </Link>
        </div>
      </div>
      <footer className="mt-12 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Sahil Handa. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
