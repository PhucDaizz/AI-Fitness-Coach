import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import BentoStats from '../../components/admin/BentoStats';
import MetricWidgets from '../../components/admin/MetricWidgets';
import StrategicInsights from '../../components/admin/StrategicInsights';

const SystemStatistics = () => {
  return (
    <div className="bg-background text-on-background min-h-screen">
      <AdminSidebar />
      
      <main className="md:ml-64 min-h-screen relative">
        <AdminHeader />
        
        <section className="p-6 md:p-10 space-y-8">
          <BentoStats />
          <MetricWidgets />
          <StrategicInsights />

          {/* Footer Meta Info */}
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] py-8 opacity-50">
            <p>© 2024 Kinetic AI Systems LLC.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="hover:text-primary" href="#">System Status</a>
              <a className="hover:text-primary" href="#">API Documentation</a>
              <a className="hover:text-primary" href="#">Security Protocols</a>
            </div>
          </div>
        </section>

        {/* Floating AI Orb (Coach Pulse) */}
        <div className="fixed bottom-8 right-8 z-[70]">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-2 bg-secondary blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-14 h-14 rounded-full glass-panel border border-secondary/30 flex items-center justify-center relative overflow-hidden">
              <div className="w-4 h-4 rounded-full bg-secondary shadow-[0_0_20px_rgba(106,156,255,0.8)] animate-pulse"></div>
            </div>
            <div className="absolute right-full mr-4 bottom-0 bg-surface-container border border-white/5 px-4 py-3 rounded-2xl w-48 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none">
              <p className="text-[0.65rem] text-secondary font-black uppercase tracking-widest mb-1">AI Coach Status</p>
              <p className="text-[0.7rem] text-white leading-tight">Processing real-time telemetry. Performance within optimal parameters.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0e0e0e]/90 backdrop-blur-xl flex justify-around items-center py-4 z-[100]">
        <span className="text-primary flex flex-col items-center">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Dash</span>
        </span>
        <span className="text-on-surface-variant flex flex-col items-center">
          <span className="material-symbols-outlined">monitoring</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Metrics</span>
        </span>
        <div className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center -translate-y-6 shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined">add</span>
        </div>
        <span className="text-on-surface-variant flex flex-col items-center">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Users</span>
        </span>
        <span className="text-on-surface-variant flex flex-col items-center">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Admin</span>
        </span>
      </nav>
    </div>
  );
};

export default SystemStatistics;
