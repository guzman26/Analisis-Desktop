import React, { useMemo, useState } from 'react';
import { ArrowDownUp, ChevronDown, ChevronUp } from 'lucide-react';

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
  getRowId: (row: T, index: number) => string;
  initialSort?: {
    columnId: string;
    direction: SortDirection;
  };
  onSortChange?: (columnId: string, direction: SortDirection) => void;
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

  const hasExpansion = Boolean(renderExpandedContent);

  const handleHeaderClick = (column: DataTableColumn<T>) => {
    if (!column.sortable || !column.id) return;

    if (sortColumn === column.id) {
      const nextDirection: SortDirection =
        sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(nextDirection);
      onSortChange?.(column.id, nextDirection);
      return;
    }

    setSortColumn(column.id);
    setSortDirection('asc');
    onSortChange?.(column.id, 'asc');
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

    const column = columns.find((item) => item.id === sortColumn);
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

      if (aValue instanceof Date && bValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * directionFactor;
      }

      const aString = String(aValue).toLocaleLowerCase();
      const bString = String(bValue).toLocaleLowerCase();

      if (aString < bString) return -1 * directionFactor;
      if (aString > bString) return 1 * directionFactor;
      return 0;
    });
  }, [columns, data, sortColumn, sortDirection]);

  const renderSortIcon = (column: DataTableColumn<T>) => {
    if (!column.sortable) return null;

    if (sortColumn !== column.id) {
      return <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground/70" />;
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-foreground" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-foreground" />
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  'h-10 whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                  column.sortable &&
                    'cursor-pointer select-none transition-colors hover:text-foreground'
                )}
                style={{
                  width: column.width,
                  textAlign: column.align ?? 'left',
                }}
                onClick={() => handleHeaderClick(column)}
              >
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5',
                    column.align === 'right' && 'justify-end',
                    column.align === 'center' && 'justify-center'
                  )}
                >
                  {column.header}
                  {renderSortIcon(column)}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.map((row, index) => {
            const rowId = getRowId(row, index);
            const isExpanded = expandedRowIds.has(rowId);
            const expandedContent = hasExpansion
              ? renderExpandedContent?.(row)
              : null;

            return (
              <React.Fragment key={rowId}>
                <TableRow
                  className={cn(
                    'transition-colors',
                    hasExpansion && 'cursor-pointer'
                  )}
                  onClick={() => {
                    if (hasExpansion) {
                      toggleRow(rowId);
                    }
                  }}
                >
                  {columns.map((column) => {
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
                          'px-3 py-2 align-middle text-sm',
                          column.align === 'right' && 'text-right tabular-nums',
                          column.align === 'center' && 'text-center'
                        )}
                        style={{ textAlign: column.align ?? 'left' }}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {hasExpansion && isExpanded && expandedContent && (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={columns.length} className="px-3 py-3">
                      {expandedContent}
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
                className="py-8 text-center text-muted-foreground"
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

function DataTable<T>(props: DataTableProps<T>) {
  return <DataTableInner {...props} />;
}

export default DataTable;
