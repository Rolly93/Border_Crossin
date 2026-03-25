import React from 'react';
import styles from '../modules/Table.module.css';

interface TableProps<T> {
  data: T[];
  columns: string[];
  renderRow: (item: T, index: number) => React.ReactNode;
}

export function Table<T>({ data, columns, renderRow }: TableProps<T>) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.baseTable}>
        <thead className={styles.tableHeader}>
          <tr>
            {columns.map((col) => (
              <th key={col} className={styles.headerCell}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={styles.tableRow}>
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}