import React from 'react';
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import styles from '../modules/NotFound.module.css'; 

const NotFound: React.FC = () => {
  const error = useRouteError();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.textStack}>
          <h1 className={styles.errorCode}>404</h1>
          <h2 className={styles.title}>Página no encontrada</h2>
          <p className={styles.message}>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {isRouteErrorResponse(error) && (
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
            Error: {error.statusText || error.data?.message}
          </p>
        )}

        <Link to="/" className={styles.button}>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;