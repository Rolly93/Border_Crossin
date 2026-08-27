import React from "react";
import { Table, Skeleton } from "@mantine/core";

export const TableSkeletonRows = ({ rows = 5, columns = 6, height = 20, radius = 'xl' }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Table.Tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Table.Td key={colIndex}>
              <Skeleton height={height} radius={radius} />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </>
  )
}