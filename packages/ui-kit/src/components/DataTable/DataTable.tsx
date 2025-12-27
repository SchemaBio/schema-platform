import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../utils/cn';

// Types
export type RowDensity = 'compact' | 'default' | 'comfortable';
export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  /** Unique column identifier */
  id: string;
  /** Column header content */
  header: string | React.ReactNode;
  /** Data accessor - key or function */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Column width in pixels */
  width?: number;
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Pin column to left or right */
  pinned?: 'left' | 'right';
  /** Column visibility */
  visible?: boolean;
}

export interface DataTableProps<T> {
  /** Table data array */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Unique row identifier */
  rowKey: keyof T | ((row: T) => string);

  // Selection
  /** Enable row selection */
  selectable?: boolean;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  /** Currently selected row keys */
  selectedRows?: Set<string>;
  /** Selection change callback */
  onSelectionChange?: (selectedRows: Set<string>) => void;

  // Expansion
  /** Enable row expansion */
  expandable?: boolean;
  /** Currently expanded row keys */
  expandedRows?: Set<string>;
  /** Expansion change callback */
  onExpandChange?: (expandedRows: Set<string>) => void;
  /** Render function for expanded content */
  renderExpandedRow?: (row: T) => React.ReactNode;

  // Sorting
  /** Current sort column id */
  sortColumn?: string;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort change callback */
  onSortChange?: (column: string, direction: SortDirection) => void;

  // Appearance
  /** Row density mode */
  density?: RowDensity;
  /** Enable zebra striping */
  striped?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;

  // Virtualization
  /** Row count threshold for virtualization */
  virtualizeThreshold?: number;
  /** Row height for virtualization */
  rowHeight?: number;

  // Events
  /** Row click callback */
  onRowClick?: (row: T) => void;
  /** Row double click callback */
  onRowDoubleClick?: (row: T) => void;

  // Column resize
  /** Column widths state */
  columnWidths?: Map<string, number>;
  /** Column width change callback */
  onColumnWidthChange?: (columnId: string, width: number) => void;

  /** Additional CSS classes */
  className?: string;
}

// Row height constants
const ROW_HEIGHTS: Record<RowDensity, number> = {
  compact: 40,
  default: 48,
  comfortable: 56,
};

// Helper to get row key
function getRowKey<T>(row: T, rowKey: keyof T | ((row: T) => string)): string {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }
  return String(row[rowKey]);
}

// Helper to get cell value
function getCellValue<T>(row: T, accessor: keyof T | ((row: T) => React.ReactNode)): React.ReactNode {
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  return row[accessor] as React.ReactNode;
}

// Sort icon component
const SortIcon: React.FC<{ direction: SortDirection }> = ({ direction }) => (
  <svg
    className={cn(
      'w-4 h-4 ml-1 inline-block transition-transform',
      direction === null && 'opacity-30'
    )}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {direction === 'asc' ? (
      <path d="M12 5v14M5 12l7-7 7 7" />
    ) : direction === 'desc' ? (
      <path d="M12 19V5M5 12l7 7 7-7" />
    ) : (
      <>
        <path d="M8 10l4-4 4 4" opacity="0.5" />
        <path d="M8 14l4 4 4-4" opacity="0.5" />
      </>
    )}
  </svg>
);

// Checkbox component for selection
const Checkbox: React.FC<{
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  'aria-label'?: string;
}> = ({ checked, indeterminate, onChange, 'aria-label': ariaLabel }) => {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={ariaLabel}
      className={cn(
        'w-4 h-4 rounded border-border-default',
        'text-accent-emphasis focus:ring-accent-emphasis focus:ring-2',
        'cursor-pointer'
      )}
    />
  );
};

// Expand icon component
const ExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    className={cn(
      'w-4 h-4 transition-transform duration-fast',
      expanded && 'rotate-90'
    )}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// Column resize handle component
const ResizeHandle: React.FC<{
  onResize: (delta: number) => void;
}> = ({ onResize }) => {
  const [isResizing, setIsResizing] = React.useState(false);
  const startXRef = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      startXRef.current = moveEvent.clientX;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={cn(
        'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize',
        'hover:bg-accent-emphasis',
        isResizing && 'bg-accent-emphasis'
      )}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  );
};

/**
 * DataTable component for displaying tabular data with advanced features.
 * Supports fixed header, column pinning, row selection, expansion, sorting,
 * virtual scrolling, and customizable row density.
 *
 * @example
 * <DataTable
 *   data={users}
 *   columns={[
 *     { id: 'name', header: 'Name', accessor: 'name' },
 *     { id: 'email', header: 'Email', accessor: 'email' },
 *   ]}
 *   rowKey="id"
 *   density="default"
 *   striped
 * />
 */
export function DataTable<T>({
  data,
  columns,
  rowKey,
  selectable = false,
  selectionMode = 'multiple',
  selectedRows = new Set(),
  onSelectionChange,
  expandable = false,
  expandedRows = new Set(),
  onExpandChange,
  renderExpandedRow,
  sortColumn,
  sortDirection,
  onSortChange,
  density = 'default',
  striped = false,
  stickyHeader = true,
  virtualizeThreshold = 1000,
  columnWidths: externalColumnWidths,
  onColumnWidthChange,
  onRowClick,
  onRowDoubleClick,
  className,
}: DataTableProps<T>): JSX.Element {
  const [internalColumnWidths, setInternalColumnWidths] = React.useState<Map<string, number>>(
    new Map()
  );

  // Use external or internal column widths
  const columnWidths = externalColumnWidths ?? internalColumnWidths;

  // Filter visible columns
  const visibleColumns = React.useMemo(
    () => columns.filter((col) => col.visible !== false),
    [columns]
  );

  // Separate pinned columns
  const { leftPinnedColumns, unpinnedColumns, rightPinnedColumns } = React.useMemo(() => {
    const left: Column<T>[] = [];
    const center: Column<T>[] = [];
    const right: Column<T>[] = [];

    visibleColumns.forEach((col) => {
      if (col.pinned === 'left') left.push(col);
      else if (col.pinned === 'right') right.push(col);
      else center.push(col);
    });

    return { leftPinnedColumns: left, unpinnedColumns: center, rightPinnedColumns: right };
  }, [visibleColumns]);

  const rowHeight = ROW_HEIGHTS[density];

  // Handle column resize
  const handleColumnResize = React.useCallback(
    (columnId: string, delta: number) => {
      const currentWidth = columnWidths.get(columnId) ?? 
        columns.find((c) => c.id === columnId)?.width ?? 150;
      const column = columns.find((c) => c.id === columnId);
      const minWidth = column?.minWidth ?? 50;
      const maxWidth = column?.maxWidth ?? 500;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth + delta));

      if (onColumnWidthChange) {
        onColumnWidthChange(columnId, newWidth);
      } else {
        setInternalColumnWidths((prev) => new Map(prev).set(columnId, newWidth));
      }
    },
    [columnWidths, columns, onColumnWidthChange]
  );

  // Handle sort
  const handleSort = React.useCallback(
    (columnId: string) => {
      if (!onSortChange) return;

      let newDirection: SortDirection;
      if (sortColumn !== columnId) {
        newDirection = 'asc';
      } else if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      } else {
        newDirection = 'asc';
      }

      onSortChange(columnId, newDirection);
    },
    [sortColumn, sortDirection, onSortChange]
  );

  // Handle row selection
  const handleRowSelect = React.useCallback(
    (rowId: string, checked: boolean) => {
      if (!onSelectionChange) return;

      const newSelection = new Set(selectedRows);
      if (selectionMode === 'single') {
        newSelection.clear();
        if (checked) newSelection.add(rowId);
      } else {
        if (checked) {
          newSelection.add(rowId);
        } else {
          newSelection.delete(rowId);
        }
      }
      onSelectionChange(newSelection);
    },
    [selectedRows, selectionMode, onSelectionChange]
  );

  // Handle select all
  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return;

      if (checked) {
        const allKeys = new Set(data.map((row) => getRowKey(row, rowKey)));
        onSelectionChange(allKeys);
      } else {
        onSelectionChange(new Set());
      }
    },
    [data, rowKey, onSelectionChange]
  );

  // Handle row expansion
  const handleRowExpand = React.useCallback(
    (rowId: string) => {
      if (!onExpandChange) return;

      const newExpanded = new Set(expandedRows);
      if (newExpanded.has(rowId)) {
        newExpanded.delete(rowId);
      } else {
        newExpanded.add(rowId);
      }
      onExpandChange(newExpanded);
    },
    [expandedRows, onExpandChange]
  );

  // Calculate selection state
  const allSelected = data.length > 0 && data.every((row) => selectedRows.has(getRowKey(row, rowKey)));
  const someSelected = data.some((row) => selectedRows.has(getRowKey(row, rowKey)));
  const isIndeterminate = someSelected && !allSelected;

  // Get column width
  const getColumnWidth = (column: Column<T>): number => {
    return columnWidths.get(column.id) ?? column.width ?? 150;
  };

  // Render header cell
  const renderHeaderCell = (column: Column<T>, isPinned: boolean = false) => {
    const width = getColumnWidth(column);
    const isSortable = column.sortable && onSortChange;
    const isSorted = sortColumn === column.id;

    return (
      <th
        key={column.id}
        className={cn(
          'relative px-3 py-2 text-left text-sm font-semibold text-fg-default',
          'border-b border-border-default bg-canvas-subtle',
          isPinned && 'sticky z-10',
          isSortable && 'cursor-pointer select-none hover:bg-canvas-inset'
        )}
        style={{ width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
        onClick={isSortable ? () => handleSort(column.id) : undefined}
        aria-sort={isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
      >
        <div className="flex items-center">
          {typeof column.header === 'string' ? column.header : column.header}
          {isSortable && <SortIcon direction={isSorted ? (sortDirection ?? null) : null} />}
        </div>
        <ResizeHandle onResize={(delta) => handleColumnResize(column.id, delta)} />
      </th>
    );
  };

  // Render data cell
  const renderDataCell = (row: T, column: Column<T>, isPinned: boolean = false) => {
    const width = getColumnWidth(column);

    return (
      <td
        key={column.id}
        className={cn(
          'px-3 py-2 text-sm text-fg-default',
          'border-b border-border-muted',
          isPinned && 'sticky bg-canvas-default z-10'
        )}
        style={{ width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
      >
        {getCellValue(row, column.accessor)}
      </td>
    );
  };

  // Render row
  const renderRow = (row: T, index: number) => {
    const rowId = getRowKey(row, rowKey);
    const isSelected = selectedRows.has(rowId);
    const isExpanded = expandedRows.has(rowId);

    return (
      <React.Fragment key={rowId}>
        <tr
          className={cn(
            'transition-colors duration-fast',
            striped && index % 2 === 1 && 'bg-canvas-subtle',
            'hover:bg-canvas-inset',
            isSelected && 'bg-accent-subtle hover:bg-accent-muted'
          )}
          style={{ height: rowHeight }}
          onClick={() => onRowClick?.(row)}
          onDoubleClick={() => onRowDoubleClick?.(row)}
          aria-selected={selectable ? isSelected : undefined}
          data-row-id={rowId}
        >
          {/* Expand cell */}
          {expandable && (
            <td className="w-10 px-2 border-b border-border-muted">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowExpand(rowId);
                }}
                className="p-1 rounded hover:bg-canvas-subtle"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
              >
                <ExpandIcon expanded={isExpanded} />
              </button>
            </td>
          )}

          {/* Selection cell */}
          {selectable && (
            <td className="w-10 px-2 border-b border-border-muted">
              <Checkbox
                checked={isSelected}
                onChange={(checked) => handleRowSelect(rowId, checked)}
                aria-label={`Select row ${rowId}`}
              />
            </td>
          )}

          {/* Left pinned columns */}
          {leftPinnedColumns.map((col) => renderDataCell(row, col, true))}

          {/* Unpinned columns */}
          {unpinnedColumns.map((col) => renderDataCell(row, col))}

          {/* Right pinned columns */}
          {rightPinnedColumns.map((col) => renderDataCell(row, col, true))}
        </tr>

        {/* Expanded content */}
        {expandable && isExpanded && renderExpandedRow && (
          <tr className="bg-canvas-subtle">
            <td
              colSpan={
                visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)
              }
              className="px-4 py-3 border-b border-border-muted"
            >
              {renderExpandedRow(row)}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // Check if virtualization should be enabled
  const shouldVirtualize = data.length > virtualizeThreshold;

  // Virtual scrolling setup
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
    enabled: shouldVirtualize,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Render virtualized row
  const renderVirtualRow = (virtualRow: { index: number; start: number; size: number }) => {
    const row = data[virtualRow.index];
    const rowId = getRowKey(row, rowKey);
    const isSelected = selectedRows.has(rowId);
    const isExpanded = expandedRows.has(rowId);

    return (
      <tr
        key={rowId}
        className={cn(
          'transition-colors duration-fast absolute w-full',
          striped && virtualRow.index % 2 === 1 && 'bg-canvas-subtle',
          'hover:bg-canvas-inset',
          isSelected && 'bg-accent-subtle hover:bg-accent-muted'
        )}
        style={{
          height: rowHeight,
          transform: `translateY(${virtualRow.start}px)`,
        }}
        onClick={() => onRowClick?.(row)}
        onDoubleClick={() => onRowDoubleClick?.(row)}
        aria-selected={selectable ? isSelected : undefined}
        data-row-id={rowId}
      >
        {/* Expand cell */}
        {expandable && (
          <td className="w-10 px-2 border-b border-border-muted">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRowExpand(rowId);
              }}
              className="p-1 rounded hover:bg-canvas-subtle"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            >
              <ExpandIcon expanded={isExpanded} />
            </button>
          </td>
        )}

        {/* Selection cell */}
        {selectable && (
          <td className="w-10 px-2 border-b border-border-muted">
            <Checkbox
              checked={isSelected}
              onChange={(checked) => handleRowSelect(rowId, checked)}
              aria-label={`Select row ${rowId}`}
            />
          </td>
        )}

        {/* Left pinned columns */}
        {leftPinnedColumns.map((col) => renderDataCell(row, col, true))}

        {/* Unpinned columns */}
        {unpinnedColumns.map((col) => renderDataCell(row, col))}

        {/* Right pinned columns */}
        {rightPinnedColumns.map((col) => renderDataCell(row, col, true))}
      </tr>
    );
  };

  return (
    <div
      ref={parentRef}
      className={cn(
        'relative overflow-auto border border-border-default rounded-medium',
        className
      )}
      role="region"
      aria-label="Data table"
      tabIndex={0}
    >
      <table 
        className="w-full border-collapse"
        role="grid"
        aria-rowcount={data.length}
        aria-colcount={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
      >
        <thead className={cn(stickyHeader && 'sticky top-0 z-20')}>
          <tr>
            {/* Expand header cell */}
            {expandable && (
              <th className="w-10 px-2 py-2 border-b border-border-default bg-canvas-subtle" />
            )}

            {/* Selection header cell */}
            {selectable && selectionMode === 'multiple' && (
              <th className="w-10 px-2 py-2 border-b border-border-default bg-canvas-subtle">
                <Checkbox
                  checked={allSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {selectable && selectionMode === 'single' && (
              <th className="w-10 px-2 py-2 border-b border-border-default bg-canvas-subtle" />
            )}

            {/* Left pinned columns */}
            {leftPinnedColumns.map((col) => renderHeaderCell(col, true))}

            {/* Unpinned columns */}
            {unpinnedColumns.map((col) => renderHeaderCell(col))}

            {/* Right pinned columns */}
            {rightPinnedColumns.map((col) => renderHeaderCell(col, true))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)
                }
                className="px-4 py-8 text-center text-fg-muted"
              >
                No data available
              </td>
            </tr>
          ) : shouldVirtualize ? (
            <tr>
              <td
                colSpan={
                  visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)
                }
                style={{ height: totalSize, position: 'relative', padding: 0 }}
              >
                <div style={{ position: 'relative', height: totalSize }}>
                  <table className="w-full border-collapse" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <tbody>
                      {virtualRows.map((virtualRow) => renderVirtualRow(virtualRow))}
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => renderRow(row, index))
          )}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = 'DataTable';
