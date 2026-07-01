import React from 'react';
import { Link } from 'react-router-dom';
import { HiXCircle } from 'react-icons/hi';

const PaymentFailed = () => {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg border border-red-100">
        <HiXCircle className="text-red-500 text-7xl mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-stone-900 mb-3">Payment Failed</h1>
        <p className="text-stone-500 mb-8">Something went wrong with your payment. Please try again.</p>
        <Link
          to="/"
          className="inline-block bg-amber-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-800 transition shadow-md"
        >
          Browse Events
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;
