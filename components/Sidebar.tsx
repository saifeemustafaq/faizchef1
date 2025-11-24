'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, PlusCircle } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.appTitle}>Community Kitchen</h1>
      </div>
      
      <nav className={styles.nav}>
        <Link
          href="/items"
          className={`${styles.navItem} ${pathname === '/items' ? styles.navItemActive : ''}`}
        >
          <Package size={20} strokeWidth={2} />
          <span>Items</span>
        </Link>
        
        <Link
          href="/cart"
          className={`${styles.navItem} ${pathname === '/cart' ? styles.navItemActive : ''}`}
        >
          <ShoppingCart size={20} strokeWidth={2} />
          <span>Cart</span>
        </Link>
        
        <Link
          href="/extra-items"
          className={`${styles.navItem} ${pathname === '/extra-items' ? styles.navItemActive : ''}`}
        >
          <PlusCircle size={20} strokeWidth={2} />
          <span>Extra Items</span>
        </Link>
      </nav>
    </aside>
  );
}

