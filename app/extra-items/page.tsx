'use client';

import { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import styles from './extra-items.module.css';

type RowData = {
  name: string;
  store: string;
  quantity: string;
  unit: string;
  category: string;
};

const emptyRow: RowData = {
  name: '',
  store: '',
  quantity: '',
  unit: 'lbs',
  category: '',
};

export default function ExtraItemsPage() {
  const { 
    data, 
    extraItemsHistory, 
    addExtraItemToCart,
    updateExtraItemHistory,
    deleteExtraItemFromHistory,
    quickAddExtraItem
  } = useCart();

  const [rows, setRows] = useState<RowData[]>([
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
  ]);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    unit: '',
    store: '',
    category: '',
  });

  const [quickAddQuantities, setQuickAddQuantities] = useState<Record<string, string>>({});

  const handleRowChange = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const handleAddToCart = async () => {
    const filledRows = rows.filter(row => row.name.trim() && row.quantity);

    if (filledRows.length === 0) {
      alert('Please fill in at least one item with name and quantity');
      return;
    }

    for (const row of filledRows) {
      const quantity = parseFloat(row.quantity);
      if (quantity <= 0) {
        alert(`Invalid quantity for ${row.name}`);
        return;
      }

      await addExtraItemToCart(
        row.name.trim(),
        row.unit,
        quantity,
        row.store.trim() || undefined,
        row.category.trim() || undefined
      );
    }

    // Clear all rows
    setRows([
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
    ]);

    alert(`${filledRows.length} item(s) added to cart!`);
  };

  const handleStartEdit = (item: any) => {
    setEditingItemId(item.id);
    setEditFormData({
      name: item.name,
      unit: item.unit,
      store: item.store || '',
      category: item.category || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditFormData({ name: '', unit: '', store: '', category: '' });
  };

  const handleSaveEdit = async () => {
    if (!editingItemId) return;
    if (!editFormData.name.trim()) {
      alert('Item name is required');
      return;
    }

    await updateExtraItemHistory(
      editingItemId,
      editFormData.name.trim(),
      editFormData.unit,
      editFormData.store.trim() || undefined,
      editFormData.category.trim() || undefined
    );

    handleCancelEdit();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item from history?')) {
      await deleteExtraItemFromHistory(itemId);
    }
  };

  const handleQuickAdd = (itemId: string) => {
    const quantity = parseFloat(quickAddQuantities[itemId] || '1');
    if (quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    quickAddExtraItem(itemId, quantity);
    setQuickAddQuantities(prev => ({ ...prev, [itemId]: '' }));
    alert('Item added to cart!');
  };

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${hours}:${minutes}`;
  };

  if (!data) {
    return <div className={styles.loadingContainer}><p>Loading...</p></div>;
  }

  return (
    <div className={styles.container}>
      {/* Left Section - Input Table */}
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Add Custom Items</h2>
        <p className={styles.sectionDescription}>
          Fill in one or more rows to add custom items to your cart
        </p>

        <div className={styles.tableContainer}>
          {/* Header Row */}
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>Item Name *</div>
            <div className={styles.headerCell}>Store</div>
            <div className={styles.headerCell}>Qty *</div>
            <div className={styles.headerCell}>Unit *</div>
            <div className={styles.headerCell}>Category</div>
          </div>

          {/* Data Rows */}
          {rows.map((row, index) => (
            <div key={index} className={styles.tableRow}>
              <div className={styles.tableCell} data-label="Item Name">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                  placeholder="Enter item name"
                  className={styles.tableInput}
                />
              </div>
              <div className={styles.tableCell} data-label="Store">
                <input
                  type="text"
                  value={row.store}
                  onChange={(e) => handleRowChange(index, 'store', e.target.value)}
                  placeholder="Optional"
                  className={styles.tableInput}
                />
              </div>
              <div className={styles.tableCell} data-label="Quantity">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.quantity}
                  onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                  placeholder="0"
                  className={styles.tableInput}
                />
              </div>
              <div className={styles.tableCell} data-label="Unit">
                <select
                  value={row.unit}
                  onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                  className={styles.tableSelect}
                >
                  {data.units.map((unit) => (
                    <option key={unit.abbreviation} value={unit.abbreviation}>
                      {unit.abbreviation}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.tableCell} data-label="Category">
                <input
                  type="text"
                  value={row.category}
                  onChange={(e) => handleRowChange(index, 'category', e.target.value)}
                  placeholder="Optional"
                  className={styles.tableInput}
                />
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleAddToCart} className={styles.submitButton}>
          <PlusCircle size={20} strokeWidth={2} />
          Add to Cart
        </button>
      </div>

      {/* Vertical Divider */}
      <div className={styles.divider} />

      {/* Right Section - History */}
      <div className={styles.historySection}>
        <h2 className={styles.sectionTitle}>Previously Added Items</h2>
        
        {extraItemsHistory.length === 0 ? (
          <div className={styles.emptyHistory}>
            <PlusCircle size={48} strokeWidth={2} />
            <p>No history yet</p>
            <span>Items you add will appear here</span>
          </div>
        ) : (
          <div className={styles.historyList}>
            {extraItemsHistory.slice().reverse().map((item) => (
              <div key={item.id} className={styles.historyCard}>
                {editingItemId === item.id ? (
                  // Edit Mode
                  <div className={styles.editMode}>
                    <div className={styles.editFields}>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        placeholder="Item name"
                        className={styles.editInput}
                      />
                      <select
                        value={editFormData.unit}
                        onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                        className={styles.editSelect}
                      >
                        {data.units.map((unit) => (
                          <option key={unit.abbreviation} value={unit.abbreviation}>
                            {unit.abbreviation}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editFormData.store}
                        onChange={(e) => setEditFormData({ ...editFormData, store: e.target.value })}
                        placeholder="Store (optional)"
                        className={styles.editInput}
                      />
                      <input
                        type="text"
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        placeholder="Category (optional)"
                        className={styles.editInput}
                      />
                    </div>
                    <div className={styles.editActions}>
                      <button onClick={handleSaveEdit} className={styles.saveButton}>
                        <Save size={17} />
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className={styles.cancelButton}>
                        <X size={17} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className={styles.historyHeader}>
                      <div className={styles.historyHeaderLeft}>
                        <h4 className={styles.historyItemName}>{item.name}</h4>
                        <span className={styles.historyDate}>{formatDate(item.addedAt)}</span>
                      </div>
                      <div className={styles.historyActions}>
                        <button
                          onClick={() => handleStartEdit(item)}
                          className={styles.historyActionButton}
                          title="Edit"
                        >
                          <Edit2 size={17} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className={`${styles.historyActionButton} ${styles.deleteButton}`}
                          title="Delete"
                        >
                          <Trash2 size={17} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.historyDetails}>
                      <div className={styles.historyDetail}>
                        <span className={styles.historyLabel}>Unit:</span>
                        <span className={styles.historyValue}>{item.unit}</span>
                      </div>
                      {item.store && (
                        <div className={styles.historyDetail}>
                          <span className={styles.historyLabel}>Store:</span>
                          <span className={styles.historyValue}>{item.store}</span>
                        </div>
                      )}
                      {item.category && (
                        <div className={styles.historyDetail}>
                          <span className={styles.historyLabel}>Category:</span>
                          <span className={styles.historyValue}>{item.category}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.quickAddSection}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quickAddQuantities[item.id] || ''}
                        onChange={(e) => setQuickAddQuantities(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Qty"
                        className={styles.quickAddInput}
                      />
                      <button
                        onClick={() => handleQuickAdd(item.id)}
                        className={styles.quickAddButton}
                        title="Quick add to cart"
                      >
                        <Plus size={17} strokeWidth={2} />
                        Quick Add
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
