import React from 'react';
import { Link } from 'react-router-dom';
import { HiCheckCircle } from 'react-icons/hi';

const PaymentSuccess = () => {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg border border-green-100">
        <HiCheckCircle className="text-green-500 text-7xl mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-stone-900 mb-3">Payment Successful!</h1>
        <p className="text-stone-500 mb-8">Your booking has been confirmed. Check your dashboard for details.</p>
        <Link
          to="/dashboard"
          className="inline-block bg-amber-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-800 transition shadow-md"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
