import React, { useState, useEffect, useCallback } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import ExerciseFilter from '../../components/common/exercise/ExerciseFilter';
import ExerciseDetailModal from '../../components/customer/ExerciseDetailModal';
import Pagination from '../../components/common/Pagination';
import { getExercises, getExerciseById } from '../../services/api/exercise.service';
import { getExerciseCategories } from '../../services/api/exerciseCategory.service';
import { getMuscleGroups } from '../../services/api/muscleGroup.service';
import { getEquipments } from '../../services/api/equipment.service';

const INITIAL_FILTERS = {
  searchTerm: '',
  categoryIds: '',
  muscleGroupIds: '',
  equipmentIds: '',
  locationTypes: '',
  sortBy: 'Name',
  sortDescending: false
};

const CustomerExercisesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookups, setLookups] = useState({
    categories: [],
    muscles: [],
    equipment: []
  });
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleExerciseClick = async (id) => {
    try {
      const detail = await getExerciseById(id);
      setSelectedExercise(detail);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch exercise detail", err);
    }
  };

  return (
    <CustomerLayout title="KINETIC AI">
      <header className="mb-10">
        <h1 className="text-[2.5rem] font-headline font-black italic tracking-tighter uppercase leading-none mb-2">
          Movement <span className="text-primary">Library</span>
        </h1>
        <p className="text-on-surface-variant font-medium text-sm tracking-wide opacity-70">
          Discover advanced protocols and perfect your form with our neural database.
        </p>
      </header>

      <ExerciseFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        lookups={lookups} 
        isAdmin={false} 
      />

      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Accessing Neural Archive...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 opacity-20">search_off</span>
            <p className="text-on-surface-variant font-bold text-sm">No protocols match your current search parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((ex) => (
              <div 
                key={ex.id}
                onClick={() => handleExerciseClick(ex.id)}
                className="group relative bg-[#1a1919] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all cursor-pointer hover:translate-y-[-4px]"
              >
                <div className="aspect-square bg-[#0e0e0e] relative overflow-hidden flex items-center justify-center">
                  {ex.gifUrl || ex.imageUrl || ex.imageThumbnailUrl ? (
                    <img 
                      src={ex.gifUrl || ex.imageUrl || ex.imageThumbnailUrl} 
                      alt={ex.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-6xl opacity-5">fitness_center</span>
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <p className="text-[8px] font-black uppercase text-primary tracking-widest">{ex.category?.nameVN || ex.category?.name}</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors">
                    {ex.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {ex.primaryMuscles?.slice(0, 2).map(m => (
                      <span key={m.id} className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">
                        {m.nameVN || m.nameEN}
                      </span>
                    ))}
                    {ex.primaryMuscles?.length > 2 && (
                      <span className="text-[8px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">
                        +{ex.primaryMuscles.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination 
            pagination={pagination}
            onPageChange={(page) => fetchData(page)}
          />
        </div>
      )}

      <ExerciseDetailModal 
        exercise={selectedExercise}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </CustomerLayout>
  );
};

export default CustomerExercisesPage;
