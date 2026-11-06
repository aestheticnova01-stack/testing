import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you!</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Your order has been placed successfully. You can track it in your order
        confirmation email, and the store admin will update its shipping status.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        Back to home
      </Link>
    </div>
  );
}
