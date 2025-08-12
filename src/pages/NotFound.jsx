import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Страница не найдена
      </h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Кажется, вы попали не туда. Возможно, страница была удалена, перемещена
        или никогда не существовала.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
