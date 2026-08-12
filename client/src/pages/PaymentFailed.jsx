import React from 'react';
import { Link } from 'react-router-dom';
import { HiXCircle, HiArrowRight } from 'react-icons/hi';

const PaymentFailed = () => {
  return (
    <div className="flex justify-center py-10 md:py-20">
      <div className="w-full max-w-lg text-center animate-fade-up">
        <div className="relative bg-white p-10 md:p-14 rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-100/50 rounded-full"></div>
          <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-amber-50 rounded-full"></div>
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/30 animate-float">
              <HiXCircle className="text-white text-6xl" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-red-600">Payment Unsuccessful</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-4">Payment Failed</h1>
            <p className="text-stone-500 mb-4 font-medium">
              Something went wrong with your payment.
              <br />
              Please try again in a moment.
            </p>
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-3.5 rounded-xl mb-8">
              Don't worry — your booking details are safe.
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-extrabold py-4 px-8 rounded-full transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
              >
                Browse Events <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold py-4 px-8 rounded-full transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
