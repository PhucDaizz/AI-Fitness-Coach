import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import EquipmentTable from '../../components/admin/equipment/EquipmentTable';
import EquipmentModal from '../../components/admin/equipment/EquipmentModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { 
  getEquipments, 
  createEquipment, 
  updateEquipment, 
  deleteEquipment 
} from '../../services/api/equipment.service';

const EquipmentPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchData = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const data = await getEquipments({ 
        pageNumber: page, 
        pageSize: pagination.pageSize, 
        searchTerm: search 
      });
      setItems(data.items);
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        hasPreviousPage: data.hasPreviousPage,
        hasNextPage: data.hasNextPage
      });
    } catch (err) {
      console.error("Failed to fetch equipment", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  useEffect(() => {
    fetchData(1, searchTerm);
  }, [searchTerm, fetchData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteEquipment(itemToDelete.id);
        setIsDeleteModalOpen(false);
        fetchData(pagination.pageNumber, searchTerm);
      } catch (err) {
        alert(err.message || "Failed to delete equipment");
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await updateEquipment(editingItem.id, formData);
      } else {
        await createEquipment(formData);
      }
      setIsModalOpen(false);
      fetchData(pagination.pageNumber, searchTerm);
    } catch (err) {
      alert(err.message || "Failed to save equipment");
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
                <span className="hover:text-[#b1ff24] cursor-pointer">Dashboard</span>
                <span>/</span>
                <span className="text-[#b1ff24]">Inventory</span>
              </nav>
              <h2 className="text-4xl font-black tracking-tighter text-white">Equipment <span className="text-[#b1ff24]">Management</span></h2>
            </div>
            <button 
              onClick={handleAddClick}
              className="bg-[#b1ff24] text-[#3e5e00] px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-[1.05] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(177,255,36,0.3)] uppercase text-xs"
            >
              <span className="material-symbols-outlined">add</span>
              Add Equipment
            </button>
          </div>

          {/* Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-3 bg-surface-container rounded-2xl p-4 flex items-center gap-4 group focus-within:ring-1 focus-within:ring-primary/30 transition-all">
              <span className="material-symbols-outlined text-[#adaaaa] group-focus-within:text-primary">filter_list</span>
              <input 
                value={searchTerm}
                onChange={handleSearch}
                className="bg-transparent border-none focus:ring-0 text-white w-full placeholder:text-[#494847] outline-none" 
                placeholder="Filter equipment by Name" 
                type="text"
              />
            </div>
            <div className="bg-surface-container rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-highest transition-colors">
              <span className="text-xs font-bold text-[#adaaaa] tracking-widest uppercase">Status: All</span>
              <span className="material-symbols-outlined text-[#b1ff24]">expand_more</span>
            </div>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(177,255,36,0.2)]"></div>
            </div>
          ) : (
            <EquipmentTable 
              items={items} 
              pagination={pagination}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onPageChange={(page) => fetchData(page, searchTerm)}
            />
          )}

        </div>
      </main>

      <EquipmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Retire Equipment"
        itemName={itemToDelete?.name}
      />

      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
};

export default EquipmentPage;
