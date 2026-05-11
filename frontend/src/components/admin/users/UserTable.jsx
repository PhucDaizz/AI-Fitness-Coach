import React from 'react';

const UserTable = ({ items, pagination, onPageChange, onStatusToggle }) => {
  return (
    <div className="bg-surface-container rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]">User Identity</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]">Contact</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]">Gender</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]">Role</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((user) => (
              <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-primary/30 transition-all">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-primary/40 text-xl">person</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{user.fullName}</p>
                      <p className="text-[10px] font-bold text-[#adaaaa] uppercase tracking-wider mt-0.5">{user.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm">
                  <p className="text-white font-medium">{user.email}</p>
                  <p className="text-[10px] font-bold text-[#adaaaa] mt-0.5">{user.phoneNumber || 'N/A'}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.gender === true 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : user.gender === false 
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                    : 'bg-white/5 text-[#adaaaa] border border-white/10'
                  }`}>
                    {user.gender === true ? 'Male' : user.gender === false ? 'Female' : 'Unknown'}
                  </span>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.role === 'SysAdmin' 
                    ? 'bg-primary text-black' 
                    : 'bg-white/5 text-white border border-white/10'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-primary animate-pulse' : 'bg-error'}`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-primary' : 'text-error'}`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <button 
                     onClick={() => onStatusToggle(user)}
                     className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                       user.isActive 
                       ? 'bg-error/10 text-error hover:bg-error hover:text-white border border-error/20' 
                       : 'bg-primary/10 text-primary hover:bg-primary hover:text-black border border-primary/20'
                     }`}
                   >
                     <span className="material-symbols-outlined text-sm">
                       {user.isActive ? 'block' : 'check_circle'}
                     </span>
                     {user.isActive ? 'Ban User' : 'Unban'}
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-8 py-6 bg-white/[0.02] flex items-center justify-between border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#adaaaa]">
          Showing <span className="text-white">{items.length}</span> of <span className="text-white">{pagination.totalCount}</span> Profiles
        </p>
        <div className="flex gap-2">
          <button 
            disabled={!pagination.hasPreviousPage}
            onClick={() => onPageChange(pagination.pageNumber - 1)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <div className="flex items-center px-4 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest">
            {pagination.pageNumber} / {pagination.totalPages || 1}
          </div>
          <button 
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.pageNumber + 1)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
