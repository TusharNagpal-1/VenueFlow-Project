import React from 'react';
import { Link } from 'react-router-dom';
import { HiCheckCircle, HiArrowRight, HiSparkles } from 'react-icons/hi';

const PaymentSuccess = () => {
  return (
    <div className="flex justify-center py-10 md:py-20">
      <div className="w-full max-w-lg text-center animate-fade-up">
        <div className="relative bg-white p-10 md:p-14 rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-100/50 rounded-full"></div>
          <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-amber-50 rounded-full"></div>
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/30 animate-float">
              <HiCheckCircle className="text-white text-6xl" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <HiSparkles className="text-amber-500" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-green-600">Payment Confirmed</span>
              <HiSparkles className="text-amber-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-4">Payment Successful!</h1>
            <p className="text-stone-500 mb-4 font-medium">
              Your booking has been confirmed.
              <br />
              Check your dashboard for full details.
            </p>
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-bold p-3.5 rounded-xl mb-8">
              🎉 See you at the event!
            </div>
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-extrabold py-4 px-10 rounded-full transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
            >
              Go to Dashboard <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
