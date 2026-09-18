import { useState, useEffect, useCallback, useMemo } from 'react';
import { menuService, categoryService } from '../services/api';
import { fallbackCategories, fallbackMenuItems } from '../data/fallbackMenu';

/**
 * Custom hook to manage menu data, categories, search, and filtering
 * - Fetches real menu and category data from backend API
 * - Gracefully falls back to confirmed 63 AFLAX items if backend is connecting
 * - Filters instantly by category and search keyword without unnecessary server spam
 */
export function useMenu() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [allMenuItems, setAllMenuItems] = useState(fallbackMenuItems);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Fetch categories and all menu items from API
  useEffect(() => {
    let isMounted = true;

    Promise.all([categoryService.getAll(), menuService.getAll()])
      .then(([catsRes, menuRes]) => {
        if (!isMounted) return;

        if (catsRes && catsRes.data && catsRes.data.length > 0) {
          setCategories(catsRes.data);
        }

        if (menuRes && menuRes.data && menuRes.data.length > 0) {
          setAllMenuItems(menuRes.data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        console.warn('Backend menu sync notice, using confirmed AFLAX menu fallback:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  // Combined client-side filtering (Category + Search)
  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      // 1. Category filter
      if (selectedCategory) {
        const itemCatSlug =
          typeof item.category === 'object' && item.category !== null
            ? item.category.slug
            : item.category;
        if (itemCatSlug !== selectedCategory) {
          return false;
        }
      }

      // 2. Search filter (case-insensitive)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description
          ? item.description.toLowerCase().includes(query)
          : false;
        if (!nameMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allMenuItems, selectedCategory, search]);

  // Compute item counts per category for the UI
  const categoryCounts = useMemo(() => {
    const counts = { all: allMenuItems.length };
    allMenuItems.forEach((item) => {
      const slug =
        typeof item.category === 'object' && item.category !== null
          ? item.category.slug
          : item.category;
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [allMenuItems]);

  const reload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory('');
    setSearch('');
  }, []);

  return {
    items: filteredItems,
    allCount: allMenuItems.length,
    categories,
    categoryCounts,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    search,
    setSearch,
    resetFilters,
    reload,
  };
}

export default useMenu;
