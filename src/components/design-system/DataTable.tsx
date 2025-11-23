import React, { useMemo, useState } from 'react';
import styles from './DataTable.module.css';
import '../../styles/designSystem.css';

export type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  width?: string | number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  renderCell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Function to get a stable row id */
  getRowId: (row: T, index: number) => string;
  /** Optional initial sort configuration */
  initialSort?: {
    columnId: string;
    direction: SortDirection;
  };
  /** Called when sort changes */
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  /** Render expanded content for a row. If provided, rows become expandable. */
  renderExpandedContent?: (row: T) => React.ReactNode;
}

function DataTableInner<T>({
  columns,
  data,
  getRowId,
  initialSort,
  onSortChange,
  renderExpandedContent,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(
    initialSort?.columnId ?? null
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialSort?.direction ?? 'asc'
  );
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(
    () => new Set()
  );

  const handleHeaderClick = (column: DataTableColumn<T>) => {
    if (!column.sortable || !column.id) return;

    setSortColumn((prevColumn) => {
      if (prevColumn === column.id) {
        setSortDirection((prevDirection) =>
          prevDirection === 'asc' ? 'desc' : 'asc'
        );
        const nextDirection =
          sortDirection === 'asc' ? ('desc' as SortDirection) : 'asc';
        onSortChange?.(column.id, nextDirection);
        return prevColumn;
      }

      setSortDirection('asc');
      onSortChange?.(column.id, 'asc');
      return column.id;
    });
  };

  const toggleRow = (rowId: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    const column = columns.find((c) => c.id === sortColumn);
    if (!column) return data;

    const getValue = (row: T) => {
      if (typeof column.accessor === 'function') {
        return column.accessor(row);
      }
      if (typeof column.accessor === 'string') {
        return (row as Record<string, unknown>)[column.accessor as string];
      }
      return null;
    };

    const directionFactor = sortDirection === 'asc' ? 1 : -1;

    return [...data].sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1 * directionFactor;
      if (bValue == null) return -1 * directionFactor;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * directionFactor;
      }

      const aStr = String(aValue).toLocaleLowerCase();
      const bStr = String(bValue).toLocaleLowerCase();
      if (aStr < bStr) return -1 * directionFactor;
      if (aStr > bStr) return 1 * directionFactor;
      return 0;
    });
  }, [data, columns, sortColumn, sortDirection]);

  const hasExpansion = !!renderExpandedContent;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((column) => {
              const isNumeric = column.align === 'right';
              const isSorted = sortColumn === column.id;
              const sortIcon =
                column.sortable && isSorted
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : column.sortable
                    ? '▲'
                    : null;

              return (
                <th
                  key={column.id}
                  className={[
                    styles.th,
                    column.sortable ? styles.thSortable : '',
                    isNumeric ? styles.thNumeric : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    width: column.width,
                    textAlign: column.align ?? 'left',
                  }}
                  onClick={() => handleHeaderClick(column)}
                >
                  <span>
                    {column.header}
                    {sortIcon && (
                      <span className={styles.sortIcon}>{sortIcon}</span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowId = getRowId(row, index);
            const isExpanded = expandedRowIds.has(rowId);
            const expandableContent = hasExpansion
              ? renderExpandedContent?.(row)
              : null;

            return (
              <React.Fragment key={rowId}>
                <tr
                  className={[
                    styles.tbodyRow,
                    hasExpansion ? styles.tbodyRowHoverable : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (hasExpansion) {
                      toggleRow(rowId);
                    }
                  }}
                  style={{ cursor: hasExpansion ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const isNumeric = column.align === 'right';
                    let content: React.ReactNode = null;
                    if (column.renderCell) {
                      content = column.renderCell(row);
                    } else if (typeof column.accessor === 'function') {
                      content = column.accessor(row);
                    } else if (typeof column.accessor === 'string') {
                      content = (row as Record<string, unknown>)[
                        column.accessor as string
                      ] as React.ReactNode;
                    }

                    return (
                      <td
                        key={column.id}
                        className={[
                          styles.td,
                          isNumeric ? styles.tdNumeric : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{ textAlign: column.align ?? 'left' }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
                {hasExpansion && isExpanded && expandableContent && (
                  <tr className={styles.expandedRow}>
                    <td
                      className={styles.expandedCell}
                      colSpan={columns.length}
                    >
                      <div className={styles.expandedContent}>
                        {expandableContent}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {sortedData.length === 0 && (
            <tr>
              <td
                className={styles.td}
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  color: 'var(--macos-text-secondary)',
                }}
              >
                No hay datos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Generic wrapper to preserve generics when exporting default
function DataTable<T>(props: DataTableProps<T>) {
  return <DataTableInner {...props} />;
}

export default DataTable;
