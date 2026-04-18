import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import ExerciseTable from '../../components/admin/exercise/ExerciseTable';
import ExerciseModal from '../../components/admin/exercise/ExerciseModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { 
  getExercises, 
  createExercise, 
  updateExercise, 
  deleteExercise 
} from '../../services/api/exercise.service';
import { getExerciseCategories } from '../../services/api/exerciseCategory.service';
import { getMuscleGroups } from '../../services/api/muscleGroup.service';
import { getEquipments } from '../../services/api/equipment.service';

const ExercisePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookups, setLookups] = useState({
    categories: [],
    muscles: [],
    equipment: []
  });

  const [filters, setFilters] = useState({
    searchTerm: '',
    categoryId: '',
    muscleGroupId: '',
    equipmentId: '',
    locationType: '',
    embedStatus: 2, // 2 = embedded
    sortBy: 'CreatedAt',
    sortDescending: true
  });

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

  const fetchLookups = async () => {
    try {
      const [cats, musc, equip] = await Promise.all([
        getExerciseCategories({ pageSize: 100 }),
        getMuscleGroups({ pageSize: 100 }),
        getEquipments({ pageSize: 100 })
      ]);
      setLookups({
        categories: cats.items || [],
        muscles: musc.items || [],
        equipment: equip.items || []
      });
    } catch (err) {
      console.error("Failed to fetch lookups", err);
    }
  };

  const fetchData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        pageNumber: page,
        pageSize: pagination.pageSize,
        searchTerm: filters.searchTerm,
        categoryIds: filters.categoryId,
        muscleGroupIds: filters.muscleGroupId,
        equipmentIds: filters.equipmentId,
        locationTypes: filters.locationType,
        embedStatus: filters.embedStatus,
        sortBy: filters.sortBy,
        sortDescending: filters.sortDescending
      };
      
      const data = await getExercises(params);
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
      console.error("Failed to fetch exercises", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, filters]);

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [filters, fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
        await deleteExercise(itemToDelete.id);
        setIsDeleteModalOpen(false);
        fetchData(pagination.pageNumber);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await updateExercise(formData.id, formData);
      } else {
        await createExercise(formData);
      }
      setIsModalOpen(false);
      fetchData(pagination.pageNumber);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      <AdminSidebar />

      <main className="md:ml-64 min-h-screen relative z-10">
        <AdminHeader />
        
        <div className="p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <nav className="flex gap-2 text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] mb-2 font-bold">
                <span className="hover:text-primary cursor-pointer">Protocol</span>
                <span>/</span>
                <span className="text-primary">Exercise Library</span>
              </nav>
              <h2 className="text-4xl font-black tracking-tighter text-white">Advanced <span className="text-primary italic">Library</span></h2>
              <p className="text-on-surface-variant text-sm mt-2 opacity-60">Manage your high-performance training protocol definitions.</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex bg-surface-container rounded-full p-1 border border-white/5">
                {[
                  { id: 2, label: 'Embedded' },
                  { id: 1, label: 'Pending' },
                  { id: 3, label: 'Skip' }
                ].map(status => (
                  <button 
                    key={status.id}
                    onClick={() => handleFilterChange('embedStatus', status.id)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      filters.embedStatus === status.id ? 'bg-surface-container-highest text-white' : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleAddClick}
                className="bg-primary text-on-primary px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-[1.05] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(177,255,36,0.3)] uppercase text-xs"
              >
                <span className="material-symbols-outlined">add</span>
                Create Exercise
              </button>
            </div>
          </div>

          {/* Search Bar - Separate Row */}
          <div className="bg-surface-container mb-6 px-6 py-4 flex items-center gap-4 rounded-2xl border border-white/5 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search by protocol name or ID..."
              value={filters.searchTerm}
              onChange={e => handleFilterChange('searchTerm', e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-white text-sm w-full placeholder:text-outline-variant"
            />
          </div>

          {/* Filters & Sorting Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
              <label className="block text-[0.6rem] uppercase tracking-widest text-[#adaaaa] font-bold">Category</label>
              <select 
                value={filters.categoryId}
                onChange={e => handleFilterChange('categoryId', e.target.value)}
                className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1 px-2 text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1919] text-white">All Categories</option>
                {lookups.categories.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#1a1919] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
              <label className="block text-[0.6rem] uppercase tracking-widest text-[#adaaaa] font-bold">Muscle</label>
              <select 
                value={filters.muscleGroupId}
                onChange={e => handleFilterChange('muscleGroupId', e.target.value)}
                className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1 px-2 text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1919] text-white">All Muscles</option>
                {lookups.muscles.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#1a1919] text-white">
                    {m.nameEN}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
              <label className="block text-[0.6rem] uppercase tracking-widest text-[#adaaaa] font-bold">Gear</label>
              <select 
                value={filters.equipmentId}
                onChange={e => handleFilterChange('equipmentId', e.target.value)}
                className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1 px-2 text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1919] text-white">All Equipment</option>
                {lookups.equipment.map(eq => (
                  <option key={eq.id} value={eq.id} className="bg-[#1a1919] text-white">
                    {eq.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Sorting Column 1: Field */}
            <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
              <label className="block text-[0.6rem] uppercase tracking-widest text-[#adaaaa] font-bold">Sort By</label>
              <select 
                value={filters.sortBy}
                onChange={e => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1 px-2 text-white appearance-none cursor-pointer"
              >
                <option value="CreatedAt" className="bg-[#1a1919] text-white">Date Created</option>
                <option value="Name" className="bg-[#1a1919] text-white">Alpha-Name</option>
              </select>
            </div>
            {/* Sorting Column 2: Direction */}
            <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
              <label className="block text-[0.6rem] uppercase tracking-widest text-[#adaaaa] font-bold">Order</label>
              <button 
                onClick={() => handleFilterChange('sortDescending', !filters.sortDescending)}
                className="w-full h-8 flex items-center justify-between px-3 bg-[#1a1919] rounded-lg text-xs font-bold text-white hover:text-primary transition-colors border-none"
              >
                <span>{filters.sortDescending ? 'Descending' : 'Ascending'}</span>
                <span className="material-symbols-outlined text-sm">
                  {filters.sortDescending ? 'south' : 'north'}
                </span>
              </button>
            </div>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(177,255,36,0.2)]"></div>
            </div>
          ) : (
            <ExerciseTable 
              items={items} 
              pagination={pagination}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onPageChange={(page) => fetchData(page)}
            />
          )}
        </div>
      </main>

      <ExerciseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
        categories={lookups.categories}
        allMuscles={lookups.muscles}
        allEquipment={lookups.equipment}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Retire Exercise"
        itemName={itemToDelete?.name}
      />
    </div>
  );
};

export default ExercisePage;
