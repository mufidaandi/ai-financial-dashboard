// Example usage of the Table components

import React, { useState } from 'react';
import { 
  DataTable, 
  TableBadge, 
  TableActions,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from './table';
import { Button } from './button';
import { Pencil, Trash2 } from 'lucide-react';

// Example 1: Using DataTable with built-in features
export const TransactionsTableExample = () => {
  const [data, setData] = useState([
    { id: 1, description: 'Grocery Shopping', amount: 125.50, category: 'Groceries', date: '2025-10-01' },
    { id: 2, description: 'Gas Station', amount: 45.00, category: 'Transportation', date: '2025-10-02' }
  ]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const columns = [
    {
      key: 'description',
      title: 'Description',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (value) => (
        <TableBadge variant="primary">{value}</TableBadge>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (_, row) => (
        <TableActions>
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableActions>
      )
    }
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      sortConfig={sortConfig}
      onSort={handleSort}
      pagination={{
        currentPage,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
        onPageChange: setCurrentPage
      }}
    />
  );
};

// Example 2: Using individual table components for custom layouts
export const CustomTableExample = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead sortable sortKey="name">Name</TableHead>
          <TableHead align="center">Status</TableHead>
          <TableHead align="right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell align="center">
            <TableBadge variant="success">Active</TableBadge>
          </TableCell>
          <TableCell align="right">$1,234.56</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell align="center">
            <TableBadge variant="warning">Pending</TableBadge>
          </TableCell>
          <TableCell align="right">$987.65</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};