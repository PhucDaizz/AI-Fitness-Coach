import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import MealTable from '../../components/admin/meal/MealTable';
import MealModal from '../../components/admin/meal/MealModal';
import MealFilter from '../../components/common/meal/MealFilter';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { 
  getAdminMeals, 
  getMealById,
  createMeal, 
  updateMeal, 
  deleteMeal 
} from '../../services/api/meal.service';

const INITIAL_FILTERS = {
  searchTerm: '',
  cuisineType: '',
  embedStatus: '',
  dietTags: [],
  caloriesFrom: '',
  caloriesTo: '',
  proteinFrom: '',
  proteinTo: '',
  carbsFrom: '',
  carbsTo: '',
  fatFrom: '',
  fatTo: '',
  sortBy: 'CreatedAt',
  sortDescending: true
};

const MealPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  
  const [filters, setFilters] = useState(INITIAL_FILTERS);

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

  const fetchData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        pageNumber: page,
        pageSize: pagination.pageSize,
        searchTerm: filters.searchTerm,
        cuisineType: filters.cuisineType,
        dietTags: filters.dietTags.length > 0 ? filters.dietTags : undefined,
        caloriesFrom: filters.caloriesFrom || undefined,
        caloriesTo: filters.caloriesTo || undefined,
        proteinFrom: filters.proteinFrom || undefined,
        proteinTo: filters.proteinTo || undefined,
        carbsFrom: filters.carbsFrom || undefined,
        carbsTo: filters.carbsTo || undefined,
        fatFrom: filters.fatFrom || undefined,
        fatTo: filters.fatTo || undefined,
        embedStatus: filters.embedStatus || undefined,
        sortBy: filters.sortBy,
        sortDescending: filters.sortDescending
      };
      
      const data = await getAdminMeals(params);
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
      console.error("Failed to fetch culinary records", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, filters]);

  useEffect(() => {
    fetchData(1);
  }, [filters, fetchData]);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters(INITIAL_FILTERS);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  /**
   * Fetch full meal details (including description) before editing
   */
  const handleEditClick = async (item) => {
    try {
      setIsFetchingDetail(true);
      const fullDetail = await getMealById(item.id);
      setEditingItem(fullDetail);
      setIsModalOpen(true);
    } catch (err) {
      alert("Critical Error: Unable to fetch full culinary narrative. " + err.message);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMeal(itemToDelete.id);
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
        await updateMeal(formData.id, formData);
      } else {
        await createMeal(formData);
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

      {/* Detail Loading Overlay */}
      {isFetchingDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-black uppercase tracking-[0.3em] mt-4 text-[10px]">Decoding Culinary Profiles...</p>
        </div>
      )}

      <main className="md:ml-64 min-h-screen relative z-10 transition-all duration-300">
        <AdminHeader />
        
        <div className="p-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <nav className="flex gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-black">
                <span className="hover:text-primary cursor-pointer transition-colors">Culinary</span>
                <span>/</span>
                <span className="text-primary italic">Global Matrix</span>
              </nav>
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Meal <span className="text-primary">Management</span></h2>
              <div className="h-1 w-20 bg-primary mt-2"></div>
            </div>
            <button 
              onClick={handleAddClick}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-black flex items-center gap-2 hover:scale-[1.05] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(177,255,36,0.3)] uppercase text-[10px]"
            >
              <span className="material-symbols-outlined font-bold text-[18px]">add</span>
              Initialize Meal
            </button>
          </div>

          <MealFilter 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            isAdmin={true} 
          />

          {/* Records Stats */}
          <div className="flex justify-between items-center my-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant italic">
                Synchronized Matrix: <span className="text-white font-mono">{pagination.totalCount.toLocaleString()} Elements Found</span>
              </span>
            </div>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(177,255,36,0.3)]"></div>
            </div>
          ) : (
            <MealTable 
              items={items} 
              pagination={pagination}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onPageChange={(page) => fetchData(page)}
            />
          )}
        </div>
      </main>

      <MealModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Archive Meal Record"
        itemName={itemToDelete?.name}
      />
    </div>
  );
};

export default MealPage;
