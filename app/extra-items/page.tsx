'use client';

import { PlusCircle } from 'lucide-react';
import styles from './extra-items.module.css';

export default function ExtraItemsPage() {
  return (
    <div className={styles.emptyState}>
      <PlusCircle size={48} strokeWidth={2} />
      <h2>No extra items yet</h2>
      <p>Add special or one-time items here</p>
    </div>
  );
}

