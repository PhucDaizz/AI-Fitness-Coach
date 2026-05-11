import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { requeueExercises, requeueMeals } from '../../services/api/system.service';

const MaintenancePage = () => {
  const [loading, setLoading] = useState({
    exercises: false,
    meals: false
  });
  const [messages, setMessages] = useState({
    exercises: '',
    meals: ''
  });

  const handleRequeue = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setMessages(prev => ({ ...prev, [type]: '' }));
    try {
      const res = type === 'exercises' ? await requeueExercises() : await requeueMeals();
      setMessages(prev => ({ ...prev, [type]: res.message || 'Success' }));
    } catch (err) {
      setMessages(prev => ({ ...prev, [type]: `Error: ${err.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <AdminSidebar />

      <main className="md:ml-64 min-h-screen relative z-10">
        <AdminHeader />
        
        <div className="p-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <nav className="flex gap-2 text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] mb-2 font-bold">
                <span className="hover:text-[#b1ff24] cursor-pointer" onClick={() => window.location.href='/admin'}>Dashboard</span>
                <span>/</span>
                <span className="text-[#b1ff24]">System Health</span>
              </nav>
              <h2 className="text-4xl font-black tracking-tighter text-white">System <span className="text-[#b1ff24]">Maintenance</span></h2>
              <p className="text-[#adaaaa] mt-2 font-medium">Manage background tasks and data synchronization.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Requeue Exercises Card */}
            <div className="bg-surface-container rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-primary text-3xl">fitness_center</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Exercise Embedding</h3>
                <p className="text-[#adaaaa] mb-8 text-sm leading-relaxed">
                  Re-push all exercises with <span className="text-white font-bold">Pending</span> status into the RabbitMQ queue for vector embedding generation.
                </p>
                
                <button
                  onClick={() => handleRequeue('exercises')}
                  disabled={loading.exercises}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all
                    ${loading.exercises 
                      ? 'bg-white/10 text-[#adaaaa] cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-[#b1ff24] active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.2)]'
                    }`}
                >
                  {loading.exercises ? (
                    <div className="w-4 h-4 border-2 border-[#adaaaa] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-sm">sync</span>
                  )}
                  {loading.exercises ? 'Processing...' : 'Execute Requeue'}
                </button>

                {messages.exercises && (
                  <div className={`mt-6 p-4 rounded-xl text-xs font-bold border ${messages.exercises.startsWith('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-[#b1ff24]/10 border-[#b1ff24]/20 text-[#b1ff24]'}`}>
                    {messages.exercises}
                  </div>
                )}
              </div>
              
              {/* Card Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500"></div>
            </div>

            {/* Requeue Meals Card */}
            <div className="bg-surface-container rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-secondary text-3xl">restaurant</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Meal Embedding</h3>
                <p className="text-[#adaaaa] mb-8 text-sm leading-relaxed">
                  Re-push all meals with <span className="text-white font-bold">Pending</span> status into the RabbitMQ queue for vector embedding generation.
                </p>
                
                <button
                  onClick={() => handleRequeue('meals')}
                  disabled={loading.meals}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all
                    ${loading.meals 
                      ? 'bg-white/10 text-[#adaaaa] cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-secondary active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.2)]'
                    }`}
                >
                  {loading.meals ? (
                    <div className="w-4 h-4 border-2 border-[#adaaaa] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-sm">sync</span>
                  )}
                  {loading.meals ? 'Processing...' : 'Execute Requeue'}
                </button>

                {messages.meals && (
                  <div className={`mt-6 p-4 rounded-xl text-xs font-bold border ${messages.meals.startsWith('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-secondary/10 border-secondary/20 text-secondary'}`}>
                    {messages.meals}
                  </div>
                )}
              </div>

              {/* Card Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-secondary/10 transition-colors duration-500"></div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 p-8 bg-surface-container-low rounded-3xl border border-white/5 border-dashed">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary">info</span>
              <div>
                <h4 className="text-white font-bold mb-1 uppercase tracking-wider text-xs">About Embedding Requeue</h4>
                <p className="text-[#adaaaa] text-[11px] leading-relaxed max-w-2xl">
                  Embedding generation is a background process handled by RabbitMQ workers. If data is stuck in "Pending" state, it usually means the worker was down or failed to process the initial request. Re-queueing will force the system to attempt regeneration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
};

export default MaintenancePage;
