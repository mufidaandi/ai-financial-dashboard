import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Pill } from "./pill";

// Base Table Container
export const Table = ({ children, className = "", allowOverflow = false, ...props }) => {
  return (
    <div className={`w-full ${allowOverflow ? 'overflow-visible' : 'overflow-auto'}`}>
      <table
        className={`text-sm w-full bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

// Table Header
export const TableHeader = ({ children, className = "", ...props }) => {
  return (
    <thead className={`uppercase text-xs border-b dark:border-gray-700 ${className}`} {...props}>
      {children}
    </thead>
  );
};

// Table Body
export const TableBody = ({ children, className = "", ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

// Table Row
export const TableRow = ({ children, className = "", hover = true, ...props }) => {
  return (
    <tr
      className={`border-b dark:border-gray-700 ${
        hover ? "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

// Table Header Cell with Sorting
export const TableHead = ({ 
  children, 
  className = "", 
  sortable = false, 
  sortKey = null,
  currentSort = null,
  onSort = null,
  align = "left",
  ...props 
}) => {
  const alignClass = {
    left: "text-left",
    center: "text-center", 
    right: "text-right"
  }[align];

  const handleSort = () => {
    if (sortable && onSort && sortKey) {
      onSort(sortKey);
    }
  };

  const getSortIcon = () => {
    if (!sortable) return null;
    
    if (currentSort?.key === sortKey) {
      return currentSort.direction === 'asc' ? 
        <ArrowUp className="h-4 w-4" /> : 
        <ArrowDown className="h-4 w-4" />;
    }
    
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  if (sortable) {
    return (
      <th className={`p-3 ${alignClass} dark:text-gray-100 ${className}`} {...props}>
        <button
          onClick={handleSort}
          className="flex uppercase text-xs items-center gap-1 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:text-blue-400 transition-colors"
        >
          {children}
          {getSortIcon()}
        </button>
      </th>
    );
  }

  return (
    <th className={`p-3 ${alignClass} dark:text-gray-100 font-medium ${className}`} {...props}>
      {children}
    </th>
  );
};

// Table Data Cell
export const TableCell = ({ 
  children, 
  className = "", 
  align = "left",
  ...props 
}) => {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  }[align];

  return (
    <td className={`p-3 ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  );
};

// Enhanced Table Component with built-in features
export const DataTable = ({
  data = [],
  columns = [],
  sortConfig = null,
  onSort = null,
  pagination = null,
  loading = false,
  emptyMessage = "No data available",
  className = "",
  allowOverflow = false,
  ...props
}) => {
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table className={className} allowOverflow={allowOverflow} {...props}>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={column.key || index}
                sortable={column.sortable}
                sortKey={column.key}
                currentSort={sortConfig}
                onSort={onSort}
                align={column.align}
                className={column.headerClassName}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex}>
              {columns.map((column, colIndex) => {
                const cellValue = column.render 
                  ? column.render(row[column.key], row, rowIndex)
                  : row[column.key];
                
                return (
                  <TableCell
                    key={`${rowIndex}-${column.key || colIndex}`}
                    align={column.align}
                    className={column.cellClassName}
                  >
                    {cellValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && (
        <TablePagination {...pagination} />
      )}
    </div>
  );
};

// Pagination Component
export const TablePagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange = () => {},
  showInfo = true,
  showPageNumbers = true,
  maxPageNumbers = 5
}) => {
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const halfRange = Math.floor(maxPageNumbers / 2);
    
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-between items-center mt-6">
      {showInfo && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {/* First page */}
            {pageNumbers[0] > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  className="w-8 h-8 p-0"
                >
                  1
                </Button>
                {pageNumbers[0] > 2 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
              </>
            )}
            
            {/* Visible page numbers */}
            {pageNumbers.map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
            
            {/* Last page */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
        )}
        
        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Badge component for status/category indicators (now using Pill)
export const TableBadge = ({ 
  children, 
  variant = "default", 
  className = "",
  ...props 
}) => {
  return (
    <Pill variant={variant} size="sm" className={className} {...props}>
      {children}
    </Pill>
  );
};

// Action buttons for table rows
export const TableActions = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DataTable,
  TablePagination,
  TableBadge,
  TableActions
};