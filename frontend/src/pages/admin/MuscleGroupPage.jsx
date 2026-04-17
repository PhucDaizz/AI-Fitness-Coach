import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import MuscleTable from '../../components/admin/muscle-group/MuscleTable';
import MuscleModal from '../../components/admin/muscle-group/MuscleModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { 
  getMuscleGroups, 
  createMuscleGroup, 
  updateMuscleGroup, 
  deleteMuscleGroup 
} from '../../services/api/muscleGroup.service';

const MuscleGroupPage = () => {
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
      const data = await getMuscleGroups({ 
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
      console.error("Failed to fetch muscle groups", err);
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
        await deleteMuscleGroup(itemToDelete.id);
        setIsDeleteModalOpen(false);
        fetchData(pagination.pageNumber, searchTerm);
      } catch (err) {
        alert(err.message || "Failed to delete muscle group");
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await updateMuscleGroup(editingItem.id, formData);
      } else {
        await createMuscleGroup(formData);
      }
      setIsModalOpen(false);
      fetchData(pagination.pageNumber, searchTerm);
    } catch (err) {
      alert(err.message || "Failed to save muscle group");
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <AdminSidebar />

      <main className="md:ml-64 min-h-screen relative z-10">
        <AdminHeader />
        <div className="max-w-6xl mx-auto p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-[2px] bg-secondary"></span>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary">Anatomy Management</span>
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter text-white">Muscle Group Management</h2>
            </div>
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(177,255,36,0.2)]"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Add Muscle Group</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 max-w-md relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/30 placeholder:text-on-surface-variant/50 transition-all text-white outline-none"
            />
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <MuscleTable 
              items={items} 
              pagination={pagination}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onPageChange={(page) => fetchData(page, searchTerm)}
            />
          )}
        </div>
      </main>

      <MuscleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Muscle Group"
        itemName={itemToDelete?.nameEN}
      />

      {/* Decorative Layer */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
};

export default MuscleGroupPage;
