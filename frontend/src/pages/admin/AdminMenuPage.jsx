import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { adminService } from '../../services/api';
import { getMenuItemImageUrl } from '../../utils/menuImageResolver';

export default function AdminMenuPage() {
  useDocumentTitle('AFLAX Restaurant — Maamulka Menu-ga');
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'categories'

  // Items State
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    isAvailable: true,
    sortOrder: 0,
    image: '',
  });
  const [itemImagePreview, setItemImagePreview] = useState('');
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [itemFormError, setItemFormError] = useState('');

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '🍽️',
    sortOrder: 0,
    isActive: true,
  });
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState('');

  // Fetch menu items and categories
  const fetchMenuData = async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await adminService.getMenu({
        category: selectedCategory !== 'all' ? selectedCategory : '',
        search: searchTerm,
      });

      if (res && res.success) {
        setItems(res.data || []);
        if (res.categories) {
          setCategories(res.categories);
        }
      } else {
        throw new Error(res?.message || 'Failed to load menu items');
      }

      // Also refresh categories with count
      const catRes = await adminService.getCategories();
      if (catRes && catRes.success) {
        setCategories(catRes.data || []);
      }
    } catch (err) {
      console.error('Menu load error:', err);
      setError(err.message || 'Unable to fetch menu data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMenuData();
  };

  const handleToggleAvailability = async (item) => {
    setUpdatingId(item._id);
    try {
      const newAvailability = !item.isAvailable;
      const res = await adminService.toggleMenuItemAvailability(item._id, newAvailability);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, isAvailable: newAvailability } : i))
        );
      }
    } catch (err) {
      console.error('Toggle error:', err);
      alert('Failed to update availability: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // --- ITEM MODAL HANDLERS ---
  const handleOpenAddItemModal = () => {
    setEditingItem(null);
    setItemFormData({
      name: '',
      category: categories.length > 0 ? categories[0]._id : '',
      description: '',
      price: '',
      isAvailable: true,
      sortOrder: items.length + 1,
      image: '',
    });
    setItemImagePreview('');
    setItemFormError('');
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (item) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name || '',
      category: item.category?._id || item.category || '',
      description: item.description || '',
      price: item.price !== undefined ? item.price : '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      sortOrder: item.sortOrder || 0,
      image: '', // keep blank so existing image is preserved unless replaced
    });
    setItemImagePreview(item.image || '');
    setItemFormError('');
    setIsItemModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemFormData((prev) => ({ ...prev, image: reader.result }));
        setItemImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItemSubmit = async (e) => {
    e.preventDefault();
    setItemSubmitting(true);
    setItemFormError('');

    try {
      if (!itemFormData.name.trim()) {
        throw new Error('Menu item name is required');
      }
      if (!itemFormData.category) {
        throw new Error('Please select a category');
      }
      const numPrice = Number(itemFormData.price);
      if (isNaN(numPrice) || numPrice < 0) {
        throw new Error('Price must be a valid number (e.g. 3.50)');
      }

      if (editingItem) {
        // Update item
        const payload = {
          name: itemFormData.name.trim(),
          category: itemFormData.category,
          description: itemFormData.description.trim(),
          price: numPrice,
          isAvailable: itemFormData.isAvailable,
          sortOrder: Number(itemFormData.sortOrder) || 0,
        };
        if (itemFormData.image) {
          payload.image = itemFormData.image;
        }

        const res = await adminService.updateMenuItem(editingItem._id, payload);
        if (res && res.success) {
          setIsItemModalOpen(false);
          fetchMenuData();
        } else {
          throw new Error(res?.message || 'Failed to update menu item');
        }
      } else {
        // Create item
        const payload = {
          name: itemFormData.name.trim(),
          category: itemFormData.category,
          description: itemFormData.description.trim(),
          price: numPrice,
          isAvailable: itemFormData.isAvailable,
          sortOrder: Number(itemFormData.sortOrder) || 0,
          image: itemFormData.image || undefined,
        };

        const res = await adminService.createMenuItem(payload);
        if (res && res.success) {
          setIsItemModalOpen(false);
          fetchMenuData();
        } else {
          throw new Error(res?.message || 'Failed to create menu item');
        }
      }
    } catch (err) {
      console.error('Save item error:', err);
      setItemFormError(err.message || 'Error saving menu item');
    } finally {
      setItemSubmitting(false);
    }
  };

  // --- CATEGORY MODAL HANDLERS ---
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      icon: '🍽️',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setCategoryFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name || '',
      description: cat.description || '',
      icon: cat.icon || '🍽️',
      sortOrder: cat.sortOrder !== undefined ? cat.sortOrder : 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setCategoryFormError('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategorySubmit = async (e) => {
    e.preventDefault();
    setCategorySubmitting(true);
    setCategoryFormError('');

    try {
      if (!categoryFormData.name.trim()) {
        throw new Error('Category name is required');
      }

      const payload = {
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim(),
        icon: categoryFormData.icon.trim() || '🍽️',
        sortOrder: Number(categoryFormData.sortOrder) || 0,
        isActive: categoryFormData.isActive,
      };

      if (editingCategory) {
        const res = await adminService.updateCategory(editingCategory._id, payload);
        if (res && res.success) {
          setIsCategoryModalOpen(false);
          fetchMenuData();
        } else {
          throw new Error(res?.message || 'Failed to update category');
        }
      } else {
        const res = await adminService.createCategory(payload);
        if (res && res.success) {
          setIsCategoryModalOpen(false);
          fetchMenuData();
        } else {
          throw new Error(res?.message || 'Failed to create category');
        }
      }
    } catch (err) {
      console.error('Save category error:', err);
      setCategoryFormError(err.message || 'Error saving category');
    } finally {
      setCategorySubmitting(false);
    }
  };

  return (
    <div className="admin-menu-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2>Menu & Category Management</h2>
          <p className="admin-page-subtitle">
            Manage AFLAX dishes, prices, categories, and Cloudinary menu images
          </p>
        </div>
        <div className="admin-header-actions">
          {activeTab === 'items' ? (
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleOpenAddItemModal}
            >
              ➕ Add Menu Item
            </button>
          ) : (
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleOpenAddCategoryModal}
            >
              ➕ Add Category
            </button>
          )}
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={() => fetchMenuData(true)}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="admin-tab-nav">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          🍽️ Menu Items
          <span className="admin-badge-count">{items.length}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📁 Categories
          <span className="admin-badge-count">{categories.length}</span>
        </button>
      </div>

      {/* ================= TAB 1: MENU ITEMS ================= */}
      {activeTab === 'items' && (
        <>
          {/* Filter and Search Bar */}
          <div className="admin-controls-card">
            <form onSubmit={handleSearchSubmit} className="admin-search-form">
              <input
                type="text"
                placeholder="Search by food name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              <button type="submit" className="admin-search-btn">
                🔍 Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  className="admin-clear-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setTimeout(() => fetchMenuData(), 0);
                  }}
                >
                  Clear
                </button>
              )}
            </form>

            <div className="admin-filter-group">
              <label htmlFor="category-select">Category:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="admin-select"
              >
                <option value="all">All Categories ({items.length})</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon || '🍽️'} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="admin-loading-container">
              <div className="admin-spinner"></div>
              <p>Loading menu items...</p>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <span className="error-icon">⚠️</span>
              <h3>Error loading menu</h3>
              <p>{error}</p>
              <button
                type="button"
                className="hero-btn primary"
                onClick={() => fetchMenuData(true)}
              >
                🔄 Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="admin-empty-state">
              <span>🍽️</span>
              <h3>No menu items found</h3>
              <p>Try resetting your search or category filter, or click "Add Menu Item" above.</p>
            </div>
          ) : (
            /* Menu Items Table */
            <div className="admin-panel-card">
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Image</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Price (USD)</th>
                      <th>Status</th>
                      <th>Availability</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="admin-item-thumb">
                            {getMenuItemImageUrl(item) ? (
                              <img src={getMenuItemImageUrl(item)} alt={item.name} />
                            ) : (
                              <span className="placeholder-thumb">🍽️</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong className="item-name-text">{item.name}</strong>
                          <div className="item-slug-text">{item.slug}</div>
                        </td>
                        <td>
                          <span className="admin-category-pill">
                            {item.category?.icon || '🍽️'}{' '}
                            {item.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="font-bold text-emerald">
                          ${Number(item.price).toFixed(2)} USD
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              item.isAvailable ? 'status-confirmed' : 'status-cancelled'
                            }`}
                          >
                            {item.isAvailable ? 'Available' : "Sold Out (Waa go'day)"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`availability-toggle-btn ${
                              item.isAvailable ? 'btn-disable' : 'btn-enable'
                            }`}
                            onClick={() => handleToggleAvailability(item)}
                            disabled={updatingId === item._id}
                          >
                            {updatingId === item._id
                              ? '...'
                              : item.isAvailable
                              ? 'Out of Stock'
                              : 'Set Available'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-action-btn-sm"
                            onClick={() => handleOpenEditItemModal(item)}
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= TAB 2: CATEGORIES ================= */}
      {activeTab === 'categories' && (
        <div className="admin-panel-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Icon</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Items Attached</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td style={{ fontSize: '20px' }}>{cat.icon || '🍽️'}</td>
                    <td>
                      <strong>{cat.name}</strong>
                      {cat.description && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {cat.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <code>{cat.slug}</code>
                    </td>
                    <td>
                      <span className="admin-badge-count">
                        {cat.itemCount !== undefined ? cat.itemCount : '—'} items
                      </span>
                    </td>
                    <td>{cat.sortOrder ?? 0}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          cat.isActive ? 'status-confirmed' : 'status-cancelled'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="admin-action-btn-sm"
                        onClick={() => handleOpenEditCategoryModal(cat)}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MENU ITEM MODAL ================= */}
      {isItemModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsItemModalOpen(false)}>
          <div
            className="admin-modal-content"
            style={{ maxWidth: '620px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>{editingItem ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsItemModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItemSubmit}>
              <div className="admin-modal-body">
                {itemFormError && (
                  <div className="admin-error-banner" style={{ marginBottom: '16px' }}>
                    ⚠️ {itemFormError}
                  </div>
                )}

                <div className="admin-form-group">
                  <label htmlFor="item-name">
                    Item Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="item-name"
                    type="text"
                    required
                    placeholder="e.g. Isisaar bariis"
                    value={itemFormData.name}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, name: e.target.value })
                    }
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="item-category">
                      Category <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      id="item-category"
                      required
                      value={itemFormData.category}
                      onChange={(e) =>
                        setItemFormData({ ...itemFormData, category: e.target.value })
                      }
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.icon || '🍽️'} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="item-price">
                      Price in USD ($) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="item-price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="e.g. 4.50"
                      value={itemFormData.price}
                      onChange={(e) =>
                        setItemFormData({ ...itemFormData, price: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="item-desc">Description (Somali / English)</label>
                  <textarea
                    id="item-desc"
                    rows="2"
                    placeholder="Short description of ingredients or preparation..."
                    value={itemFormData.description}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, description: e.target.value })
                    }
                  />
                </div>

                {/* Image Upload with Preview */}
                <div className="admin-form-group">
                  <label>Item Image</label>
                  <div className="admin-image-upload-box">
                    <div className="admin-preview-wrapper">
                      {itemImagePreview ? (
                        <img
                          src={itemImagePreview}
                          alt="Preview"
                          className="admin-preview-img"
                        />
                      ) : (
                        <span className="admin-preview-placeholder">🍽️</span>
                      )}
                    </div>
                    <div className="admin-file-input-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                      />
                      <p className="admin-file-help">
                        {editingItem
                          ? 'Leave empty to preserve existing Cloudinary / dish image.'
                          : 'Select an image file (JPG, PNG, WebP up to 5MB).'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="admin-form-row" style={{ marginTop: '12px' }}>
                  <div className="admin-form-group">
                    <label htmlFor="item-sort">Display Sort Order</label>
                    <input
                      id="item-sort"
                      type="number"
                      value={itemFormData.sortOrder}
                      onChange={(e) =>
                        setItemFormData({
                          ...itemFormData,
                          sortOrder: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div
                    className="admin-form-group"
                    style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}
                  >
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={itemFormData.isAvailable}
                        onChange={(e) =>
                          setItemFormData({
                            ...itemFormData,
                            isAvailable: e.target.checked,
                          })
                        }
                      />
                      Available for Ordering (Diyaar)
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setIsItemModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={itemSubmitting}
                >
                  {itemSubmitting
                    ? 'Saving...'
                    : editingItem
                    ? 'Update Menu Item'
                    : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CATEGORY MODAL ================= */}
      {isCategoryModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
          <div
            className="admin-modal-content"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>{editingCategory ? '✏️ Edit Category' : '➕ Add New Category'}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategorySubmit}>
              <div className="admin-modal-body">
                {categoryFormError && (
                  <div className="admin-error-banner" style={{ marginBottom: '16px' }}>
                    ⚠️ {categoryFormError}
                  </div>
                )}

                <div className="admin-form-row">
                  <div className="admin-form-group" style={{ flex: 2 }}>
                    <label htmlFor="cat-name">
                      Category Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="cat-name"
                      type="text"
                      required
                      placeholder="e.g. Cunto Fudud"
                      value={categoryFormData.name}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label htmlFor="cat-icon">Icon (Emoji)</label>
                    <input
                      id="cat-icon"
                      type="text"
                      placeholder="e.g. 🥪"
                      value={categoryFormData.icon}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          icon: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="cat-desc">Description</label>
                  <textarea
                    id="cat-desc"
                    rows="2"
                    placeholder="Short description for customer menu..."
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="cat-sort">Sort Order</label>
                    <input
                      id="cat-sort"
                      type="number"
                      value={categoryFormData.sortOrder}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          sortOrder: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div
                    className="admin-form-group"
                    style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}
                  >
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={categoryFormData.isActive}
                        onChange={(e) =>
                          setCategoryFormData({
                            ...categoryFormData,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      Active (Visible to Customers)
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={categorySubmitting}
                >
                  {categorySubmitting
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update Category'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
