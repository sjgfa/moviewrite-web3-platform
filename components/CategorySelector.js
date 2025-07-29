import { useState, useEffect } from 'react';

const defaultCategories = [
  { id: 1, name: 'Technology', slug: 'technology', color: '#3B82F6' },
  { id: 2, name: 'Blockchain', slug: 'blockchain', color: '#8B5CF6' },
  { id: 3, name: 'Movies', slug: 'movies', color: '#EF4444' },
  { id: 4, name: 'Entertainment', slug: 'entertainment', color: '#F59E0B' },
  { id: 5, name: 'Tutorial', slug: 'tutorial', color: '#10B981' },
  { id: 6, name: 'Opinion', slug: 'opinion', color: '#6366F1' }
];

export default function CategorySelector({ 
  selectedCategories = [], 
  onChange,
  maxSelections = 3 
}) {
  const [categories] = useState(defaultCategories);
  const [selected, setSelected] = useState(selectedCategories);

  useEffect(() => {
    setSelected(selectedCategories);
  }, [selectedCategories]);

  const toggleCategory = (categorySlug) => {
    let newSelected;
    
    if (selected.includes(categorySlug)) {
      // 移除类别
      newSelected = selected.filter(slug => slug !== categorySlug);
    } else {
      // 添加类别（检查上限）
      if (selected.length >= maxSelections) {
        return; // 达到上限，不添加
      }
      newSelected = [...selected, categorySlug];
    }
    
    setSelected(newSelected);
    if (onChange) {
      onChange(newSelected);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Categories
        </label>
        <span className="text-xs text-gray-500">
          {selected.length}/{maxSelections} selected
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selected.includes(category.slug);
          const isDisabled = !isSelected && selected.length >= maxSelections;
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.slug)}
              disabled={isDisabled}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isSelected 
                  ? 'text-white shadow-md transform scale-105' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                backgroundColor: isSelected ? category.color : undefined,
                borderColor: isSelected ? category.color : undefined
              }}
            >
              {category.name}
              {isSelected && (
                <span className="ml-1">✓</span>
              )}
            </button>
          );
        })}
      </div>
      
      {selected.length === maxSelections && (
        <p className="text-xs text-gray-500 mt-1">
          Maximum {maxSelections} categories can be selected
        </p>
      )}
    </div>
  );
}