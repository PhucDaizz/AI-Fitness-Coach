import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import BentoGrid from '../components/home/BentoGrid';
import CTASection from '../components/home/CTASection';
import Footer from '../components/layout/Footer';

const Home = () => {
  return (
    <div className="bg-background min-h-screen text-on-background selection:bg-primary selection:text-on-primary">
      <Navbar />
      <main>
        <Hero />
        <BentoGrid />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
