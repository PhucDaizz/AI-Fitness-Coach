import React, { useState, useEffect, useCallback } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import MealFilter from '../../components/common/meal/MealFilter';
import MealDetailModal from '../../components/customer/MealDetailModal';
import Pagination from '../../components/common/Pagination';
import { getMeals, getMealById } from '../../services/api/meal.service';

const INITIAL_FILTERS = {
  searchTerm: '',
  cuisineType: '',
  dietTags: [],
  caloriesFrom: '',
  caloriesTo: '',
  proteinFrom: '',
  proteinTo: '',
  carbsFrom: '',
  carbsTo: '',
  fatFrom: '',
  fatTo: '',
  sortBy: 'Name',
  sortDescending: false
};

const DEFAULT_MEAL_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';

const CustomerMealsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageError = (e) => {
    e.target.src = DEFAULT_MEAL_IMAGE;
  };

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
        sortBy: filters.sortBy,
        sortDescending: filters.sortDescending
      };
      
      const data = await getMeals(params);
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
      console.error("Failed to fetch meals", err);
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

  const handleMealClick = async (id) => {
    try {
      const detail = await getMealById(id);
      setSelectedMeal(detail);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch meal detail", err);
    }
  };

  return (
    <CustomerLayout title="KINETIC AI">
      <header className="mb-10">
        <h1 className="text-[2.5rem] font-headline font-black italic tracking-tighter uppercase leading-none mb-2">
          Culinary <span className="text-primary">Vault</span>
        </h1>
        <p className="text-on-surface-variant font-medium text-sm tracking-wide opacity-70">
          Fuel your performance with precision-engineered nutrition and gourmet protocols.
        </p>
      </header>

      <MealFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        isAdmin={false} 
      />

      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Accessing Nutritional Grid...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 opacity-20">no_food</span>
            <p className="text-on-surface-variant font-bold text-sm">No culinary elements match your current search parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((meal) => (
              <div 
                key={meal.id}
                onClick={() => handleMealClick(meal.id)}
                className="group relative bg-[#1a1919] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all cursor-pointer hover:translate-y-[-4px]"
              >
                <div className="aspect-[16/10] bg-[#0e0e0e] relative overflow-hidden">
                  {meal.imageUrl ? (
                    <img 
                      src={meal.imageUrl} 
                      alt={meal.name} 
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <img 
                      src={DEFAULT_MEAL_IMAGE} 
                      alt={meal.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <p className="text-[8px] font-black uppercase text-primary tracking-widest">{meal.cuisineType || 'Universal'}</p>
                  </div>
                  
                  {/* Macros Preview Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <div className="flex gap-3">
                        <div className="text-center">
                           <p className="text-[6px] font-black uppercase text-white/50 tracking-tighter">P</p>
                           <p className="text-[10px] font-black text-primary">{meal.protein}g</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[6px] font-black uppercase text-white/50 tracking-tighter">C</p>
                           <p className="text-[10px] font-black text-secondary">{meal.carbs}g</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[6px] font-black uppercase text-white/50 tracking-tighter">F</p>
                           <p className="text-[10px] font-black text-white">{meal.fat}g</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[6px] font-black uppercase text-white/50 tracking-tighter">Energy</p>
                        <p className="text-sm font-black text-white italic">{meal.calories}<span className="text-[8px] ml-0.5 not-italic opacity-50">KCAL</span></p>
                     </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-1">
                    {meal.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.dietTags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">
                        {tag}
                      </span>
                    ))}
                    {meal.dietTags?.length > 3 && (
                      <span className="text-[8px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">
                        +{meal.dietTags.length - 3}
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

      <MealDetailModal 
        meal={selectedMeal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </CustomerLayout>
  );
};

export default CustomerMealsPage;
