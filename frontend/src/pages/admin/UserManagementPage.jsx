import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import UserTable from '../../components/admin/users/UserTable';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { getUsers, updateUserStatus } from '../../services/api/auth.service';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' (All), 'true' (Active), 'false' (Banned)
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  const fetchData = useCallback(async (page = 1, search = '', role = '', status = '') => {
    try {
      setLoading(true);
      const params = { 
        pageNumber: page, 
        pageSize: pagination.pageSize, 
        searchTerm: search 
      };
      
      if (role) params.role = role;
      if (status !== '') params.isActive = status === 'true';

      const data = await getUsers(params);
      setUsers(data.items);
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        hasPreviousPage: data.hasPreviousPage,
        hasNextPage: data.hasNextPage
      });
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1, searchTerm, roleFilter, statusFilter);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, roleFilter, statusFilter, fetchData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusToggle = (user) => {
    setUserToUpdate(user);
    setIsStatusModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!userToUpdate) return;
    try {
      setUpdating(true);
      await updateUserStatus(userToUpdate.id, !userToUpdate.isActive);
      setIsStatusModalOpen(false);
      fetchData(pagination.pageNumber, searchTerm, roleFilter, statusFilter);
    } catch (err) {
      alert(err.message || "Failed to update user status");
    } finally {
      setUpdating(false);
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
                <span className="text-[#b1ff24]">Access Control</span>
              </nav>
              <h2 className="text-4xl font-black tracking-tighter text-white">User <span className="text-[#b1ff24]">Management</span></h2>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-container rounded-2xl px-6 py-3 border border-white/5">
               <div className="flex flex-col items-end">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#adaaaa]">Operational Capacity</p>
                  <p className="text-xl font-black text-white">{pagination.totalCount}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">groups</span>
               </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <div className="md:col-span-3 bg-surface-container rounded-2xl p-4 flex items-center gap-4 group focus-within:ring-1 focus-within:ring-primary/30 transition-all border border-white/5">
              <span className="material-symbols-outlined text-[#adaaaa] group-focus-within:text-primary">search</span>
              <input 
                value={searchTerm}
                onChange={handleSearch}
                className="bg-transparent border-none focus:ring-0 text-white w-full placeholder:text-[#494847] outline-none font-medium" 
                placeholder="Search users by Name or Email..." 
                type="text"
              />
            </div>
            
            <div className="md:col-span-1 bg-surface-container rounded-2xl p-2 border border-white/5">
               <select 
                 value={roleFilter}
                 onChange={(e) => setRoleFilter(e.target.value)}
                 className="bg-transparent border-none focus:ring-0 text-white w-full text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
               >
                  <option value="" className="bg-surface-container">All Roles</option>
                  <option value="Customer" className="bg-surface-container">Customer</option>
                  <option value="SysAdmin" className="bg-surface-container">SysAdmin</option>
               </select>
            </div>

            <div className="md:col-span-1 bg-surface-container rounded-2xl p-2 border border-white/5">
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="bg-transparent border-none focus:ring-0 text-white w-full text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
               >
                  <option value="" className="bg-surface-container">All Status</option>
                  <option value="true" className="bg-surface-container">Active</option>
                  <option value="false" className="bg-surface-container">Banned</option>
               </select>
            </div>

            <button 
              onClick={() => { setSearchTerm(''); setRoleFilter(''); setStatusFilter(''); }}
              className="md:col-span-1 bg-surface-container rounded-2xl p-4 flex items-center justify-center hover:bg-surface-container-highest transition-colors border border-white/5 group"
            >
              <span className="material-symbols-outlined text-[#adaaaa] group-hover:text-primary text-sm mr-2">restart_alt</span>
              <span className="text-[10px] font-black text-[#adaaaa] tracking-widest uppercase group-hover:text-white">Reset</span>
            </button>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(177,255,36,0.2)]"></div>
            </div>
          ) : (
            <UserTable 
              items={users} 
              pagination={pagination}
              onPageChange={(page) => fetchData(page, searchTerm, roleFilter, statusFilter)}
              onStatusToggle={handleStatusToggle}
            />
          )}

        </div>
      </main>

      <DeleteConfirmModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        title={userToUpdate?.isActive ? "Ban User Account" : "Unban User Account"}
        itemName={`${userToUpdate?.fullName} (${userToUpdate?.email})`}
      />

      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
};

export default UserManagementPage;
