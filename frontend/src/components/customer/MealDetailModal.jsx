import React from 'react';

const DEFAULT_MEAL_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';

const MealDetailModal = ({ meal, isOpen, onClose }) => {
  if (!isOpen || !meal) return null;

  const handleImageError = (e) => {
    e.target.src = DEFAULT_MEAL_IMAGE;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface-container w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-20"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col md:flex-row h-full">
            
            {/* Visual Section */}
            <div className="w-full md:w-[45%] bg-[#0e0e0e] relative flex items-center justify-center min-h-[300px] md:min-h-0 border-b md:border-b-0 md:border-r border-white/5">
              <img 
                src={meal.imageUrl || DEFAULT_MEAL_IMAGE} 
                alt={meal.name} 
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
              
              {/* Floating Cuisine Tag */}
              <div className="absolute bottom-6 left-6 bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-2 rounded-2xl">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{meal.cuisineType || 'Global Cuisine'}</p>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 p-8 md:p-12 space-y-10">
              {/* Header */}
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-4 leading-tight">
                  {meal.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {meal.dietTags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[8px] font-bold text-primary uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nutrition Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                   <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Calories</p>
                   <p className="text-xl font-black text-white italic">{meal.calories}<span className="text-[10px] ml-1 not-italic opacity-40">kcal</span></p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                   <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Protein</p>
                   <p className="text-xl font-black text-white italic">{meal.protein}g</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                   <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Carbs</p>
                   <p className="text-xl font-black text-white italic">{meal.carbs}g</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                   <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Fat</p>
                   <p className="text-xl font-black text-white italic">{meal.fat}g</p>
                </div>
              </div>

              {/* Ingredients/Instructions */}
              <div className="space-y-6 pt-8 border-t border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary text-lg">description</span>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Culinary Profile</h3>
                  </div>
                  <div className="text-on-surface-variant text-sm leading-relaxed font-medium opacity-80 whitespace-pre-line">
                    {meal.description || 'No detailed description available for this meal.'}
                  </div>
                </div>

                {meal.recipeSource && (
                   <div className="pt-4 flex items-center gap-2 text-on-surface-variant/40">
                      <span className="material-symbols-outlined text-sm">link</span>
                      <a href={meal.recipeSource} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors">
                        View Full Recipe Source
                      </a>
                   </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;
