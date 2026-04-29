import React from 'react';
import CustomerTopBar from './CustomerTopBar';
import CustomerBottomNav from './CustomerBottomNav';

const CustomerLayout = ({ children, title, fullWidth = false }) => {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      <CustomerTopBar title={title} />
      
      <main className={`flex-grow flex flex-col w-full relative pb-32 md:pb-0 ${fullWidth ? '' : 'max-w-4xl mx-auto px-4 pt-16'}`}>
        {children}
      </main>

      <CustomerBottomNav />
    </div>
  );
};

export default CustomerLayout;
