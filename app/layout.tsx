import type { Metadata } from "next";
import { CartProvider } from "@/contexts/CartContext";
import Sidebar from "@/components/Sidebar";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Community Kitchen",
  description: "Community Kitchen Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div className={styles.appContainer}>
            <Sidebar />
            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
