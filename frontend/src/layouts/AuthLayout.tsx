import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from "../modules/RootLayout.module.css"
const AuthLayout: React.FC = () => {
  return (
    <div className={styles.AuthLayout}>
      <div >
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;