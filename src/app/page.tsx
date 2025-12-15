"use client";

import Link from "next/link";
import { FileText, Image } from "lucide-react";

export default function Home() {
  const tools = [
    {
      id: "merge",
      title: "PDF結合",
      description: "複数の講義資料を一つにまとめる",
      icon: FileText,
      href: "/merge",
      color: "blue",
    },
    {
      id: "image-to-pdf",
      title: "画像からPDF",
      description: "スマホで撮った板書やノートをPDF化",
      icon: Image,
      href: "/image-to-pdf",
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            PDF Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            ブラウザ完結型のPDFツール。
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const colorClasses = {
              blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/40",
              green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/40",
            };

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`block p-6 rounded-lg border-2 transition-all hover:shadow-lg w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] ${colorClasses[tool.color as keyof typeof colorClasses]}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 ${
                    tool.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-green-600 dark:text-green-400"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {tool.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🔒 プライバシー重視: すべての処理はブラウザ内で完結し、サーバーにアップロードされません
          </p>
        </div>
      </div>
    </div>
  );
}
