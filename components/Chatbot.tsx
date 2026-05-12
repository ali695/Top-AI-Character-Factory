'use client';

import React from 'react';

export const Chatbot: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
        <span className="text-3xl">💬</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">Chatbot Feature</h3>
      <p className="text-gray-500">Coming soon! Chat with your AI characters.</p>
    </div>
  );
};
