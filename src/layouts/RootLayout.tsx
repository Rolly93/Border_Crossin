import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { authService } from '../services/api';
import styles from '../modules/RootLayout.module.css'; // Import the new styles

const RootLayout: React.FC = () => {
  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <nav className={styles.sidebar}>
        <h2>xBorder App</h2>
        
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link to="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
          </li>
           <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>

        </ul>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Log Out
        </button>
      </nav>


      <main className={styles.mainContent}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default RootLayout;