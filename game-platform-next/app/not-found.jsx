import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <AlertTriangle size={56} className="text-yellow-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8">That page doesn't exist.</p>
        <Link href="/" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}