import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface Column<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string | JSX.Element;
  filterable?: boolean;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  defaultSort?: {
    column: keyof T;
    direction: 'asc' | 'desc';
  };
  onRowClick?: (row: T) => void;
  title?: string;
  height?: number | string;
}

function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  error,
  defaultSort,
  onRowClick,
  title,
  height = 400,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    column: keyof T;
    direction: 'asc' | 'desc';
  }>(defaultSort || { column: columns[0].id, direction: 'asc' });
  const [filters, setFilters] = useState<{ [key in keyof T]?: string }>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSort = (column: keyof T) => {
    setSortConfig((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = (column: keyof T, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const filteredData = data.filter((row) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const cellValue = row[key as keyof T];
      return String(cellValue)
        .toLowerCase()
        .includes(value.toLowerCase());
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.column];
    const bValue = b[sortConfig.column];

    if (aValue === bValue) return 0;

    const comparison = aValue < bValue ? -1 : 1;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {title && <Typography variant="h6">{title}</Typography>}
        <Box>
          <Tooltip title={showFilters ? 'Hide Filters' : 'Show Filters'}>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          {Object.keys(filters).length > 0 && (
            <Tooltip title="Clear Filters">
              <IconButton onClick={clearFilters} color="error">
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {showFilters && (
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {columns
            .filter((col) => col.filterable)
            .map((column) => (
              <TextField
                key={String(column.id)}
                label={column.label}
                size="small"
                value={filters[column.id] || ''}
                onChange={(e) => handleFilterChange(column.id, e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            ))}
        </Box>
      )}

      {Object.keys(filters).length > 0 && (
        <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            const column = columns.find((col) => col.id === key);
            return (
              <Chip
                key={key}
                label={`${column?.label}: ${value}`}
                onDelete={() => handleFilterChange(key as keyof T, '')}
                size="small"
              />
            );
          })}
        </Box>
      )}

      <TableContainer sx={{ height }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={String(column.id)}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={sortConfig.column === column.id}
                        direction={
                          sortConfig.column === column.id
                            ? sortConfig.direction
                            : 'asc'
                        }
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={String(column.id)} align={column.align}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default DataTable; 