import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import ExerciseTable from '../../components/admin/exercise/ExerciseTable';
import ExerciseModal from '../../components/admin/exercise/ExerciseModal';
import ExerciseFilter from '../../components/common/exercise/ExerciseFilter';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { 
  getExercises, 
  getExerciseById,
  createExercise, 
  updateExercise, 
  deleteExercise 
} from '../../services/api/exercise.service';
import { getExerciseCategories } from '../../services/api/exerciseCategory.service';
import { getMuscleGroups } from '../../services/api/muscleGroup.service';
import { getEquipments } from '../../services/api/equipment.service';

const INITIAL_FILTERS = {
  searchTerm: '',
  categoryIds: '',
  muscleGroupIds: '',
  equipmentIds: '',
  locationTypes: '',
  embedStatus: 2, // 2 = embedded
  sortBy: 'CreatedAt',
  sortDescending: true
};

const ExercisePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [lookups, setLookups] = useState({
    categories: [],
    muscles: [],
    equipment: []
  });

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
        categoryIds: filters.categoryIds || undefined,
        muscleGroupIds: filters.muscleGroupIds || undefined,
        equipmentIds: filters.equipmentIds || undefined,
        locationTypes: filters.locationTypes || undefined,
        embedStatus: filters.embedStatus !== '' ? filters.embedStatus : undefined,
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

  const handleEditClick = async (item) => {
    try {
      setIsFetchingDetail(true);
      const fullDetail = await getExerciseById(item.id);
      
      const mappedData = {
        id: fullDetail.id,
        name: fullDetail.name,
        description: fullDetail.description,
        descriptionSource: fullDetail.descriptionSource || 0,
        categoryId: fullDetail.category?.id || '',
        imageUrl: fullDetail.imageUrl,
        imageThumbnailUrl: fullDetail.imageThumbnailUrl,
        isFrontImage: fullDetail.isFrontImage,
        locationType: fullDetail.locationTypes || [],
        muscles: [
          ...(fullDetail.primaryMuscles?.map(m => ({ muscleId: m.id, isPrimary: true })) || []),
          ...(fullDetail.secondaryMuscles?.map(m => ({ muscleId: m.id, isPrimary: false })) || [])
        ],
        equipmentIds: fullDetail.equipments?.map(e => e.id) || []
      };

      setEditingItem(mappedData);
      setIsModalOpen(true);
    } catch (err) {
      alert("Error decoding protocol narrative: " + err.message);
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

      {/* Loading Overlay */}
      {isFetchingDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-black uppercase tracking-[0.3em] mt-4 text-[10px]">Accessing Bio-Protocol Narrative...</p>
        </div>
      )}

      <main className="md:ml-64 min-h-screen relative z-10">
        <AdminHeader />
        
        <div className="p-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <nav className="flex gap-2 text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] mb-2 font-bold">
                <span className="hover:text-primary cursor-pointer transition-colors">Protocol</span>
                <span>/</span>
                <span className="text-primary italic">Exercise Library</span>
              </nav>
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Advanced <span className="text-primary">Library</span></h2>
              <div className="h-1 w-20 bg-primary mt-2"></div>
            </div>
            <button 
              onClick={handleAddClick}
              className="bg-primary text-on-primary px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-[1.05] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(177,255,36,0.3)] uppercase text-[10px]"
            >
              <span className="material-symbols-outlined font-bold text-[18px]">add</span>
              Initialize Exercise
            </button>
          </div>

          <ExerciseFilter 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            lookups={lookups} 
            isAdmin={true} 
          />

          {/* Table Area */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(177,255,36,0.3)]"></div>
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
