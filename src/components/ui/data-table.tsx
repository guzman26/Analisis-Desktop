import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { cn } from '@/lib/utils';

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

      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * directionFactor;
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
    <div className="w-full overflow-x-auto bg-white border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-white border-b-2 border-border hover:bg-white">
            {columns.map((column) => {
              const isNumeric = column.align === 'right';
              const isSorted = sortColumn === column.id;
              const showSortIcon = column.sortable;

              return (
                <TableHead
                  key={column.id}
                  className={cn(
                    'font-semibold text-foreground text-xs whitespace-nowrap select-none border-r border-border last:border-r-0',
                    column.sortable && 'cursor-pointer hover:bg-accent/50',
                    isNumeric && 'text-right'
                  )}
                  style={{
                    width: column.width,
                    textAlign: column.align ?? 'left',
                  }}
                  onClick={() => handleHeaderClick(column)}
                >
                  <span className="flex items-center gap-1.5">
                    {column.header}
                    {showSortIcon && (
                      <span className="inline-flex text-[10px] text-muted-foreground">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
                        ) : (
                          <ChevronUp className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    )}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => {
            const rowId = getRowId(row, index);
            const isExpanded = expandedRowIds.has(rowId);
            const expandableContent = hasExpansion
              ? renderExpandedContent?.(row)
              : null;

            return (
              <React.Fragment key={rowId}>
                <TableRow
                  className={cn(
                    'border-b border-border transition-colors',
                    index % 2 === 0 ? 'bg-white' : 'bg-muted/50',
                    hasExpansion && 'cursor-pointer hover:bg-blue-50'
                  )}
                  onClick={() => {
                    if (hasExpansion) {
                      toggleRow(rowId);
                    }
                  }}
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
                      <TableCell
                        key={column.id}
                        className={cn(
                          'py-1.5 px-2.5 align-middle border-r border-border last:border-r-0 text-foreground text-[13px] leading-relaxed',
                          isNumeric && 'text-right tabular-nums'
                        )}
                        style={{ textAlign: column.align ?? 'left' }}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
                {hasExpansion && isExpanded && expandableContent && (
                  <TableRow className="bg-muted/50 border-t border-border hover:bg-muted/50">
                    <TableCell
                      colSpan={columns.length}
                      className="py-3 px-2.5 border-r border-border"
                    >
                      <div className="border-t border-border pt-0">
                        {expandableContent}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
          {sortedData.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground py-8"
              >
                No hay datos para mostrar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Generic wrapper to preserve generics when exporting default
function DataTable<T>(props: DataTableProps<T>) {
  return <DataTableInner {...props} />;
}

export default DataTable;
