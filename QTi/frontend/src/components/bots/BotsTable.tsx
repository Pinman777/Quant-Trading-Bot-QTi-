import React from 'react';
import { Chip, IconButton, Tooltip } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import DataTable from '../common/DataTable';

interface Bot {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  status: 'running' | 'stopped' | 'error';
  pnl: number;
  pnlPercentage: number;
  openPositions: number;
  lastUpdate: string;
}

interface BotsTableProps {
  bots: Bot[];
  loading?: boolean;
  error?: string;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BotsTable: React.FC<BotsTableProps> = ({
  bots,
  loading,
  error,
  onStart,
  onStop,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      id: 'name' as keyof Bot,
      label: 'Name',
      minWidth: 150,
      filterable: true,
      sortable: true,
    },
    {
      id: 'exchange' as keyof Bot,
      label: 'Exchange',
      minWidth: 100,
      filterable: true,
      sortable: true,
    },
    {
      id: 'symbol' as keyof Bot,
      label: 'Symbol',
      minWidth: 100,
      filterable: true,
      sortable: true,
    },
    {
      id: 'strategy' as keyof Bot,
      label: 'Strategy',
      minWidth: 120,
      filterable: true,
      sortable: true,
    },
    {
      id: 'status' as keyof Bot,
      label: 'Status',
      minWidth: 100,
      align: 'center' as const,
      filterable: true,
      sortable: true,
      format: (value: Bot['status']) => (
        <Chip
          label={value}
          color={
            value === 'running'
              ? 'success'
              : value === 'stopped'
              ? 'warning'
              : 'error'
          }
          size="small"
        />
      ),
    },
    {
      id: 'pnl' as keyof Bot,
      label: 'PnL',
      minWidth: 120,
      align: 'right' as const,
      sortable: true,
      format: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      id: 'pnlPercentage' as keyof Bot,
      label: 'PnL %',
      minWidth: 100,
      align: 'right' as const,
      sortable: true,
      format: (value: number) => (
        <span style={{ color: value >= 0 ? '#00C4B4' : '#FF5252' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </span>
      ),
    },
    {
      id: 'openPositions' as keyof Bot,
      label: 'Positions',
      minWidth: 100,
      align: 'center' as const,
      sortable: true,
    },
    {
      id: 'lastUpdate' as keyof Bot,
      label: 'Last Update',
      minWidth: 150,
      sortable: true,
      format: (value: string) => new Date(value).toLocaleString(),
    },
    {
      id: 'actions' as keyof Bot,
      label: 'Actions',
      minWidth: 120,
      align: 'center' as const,
      format: (value: any, row: Bot) => (
        <Box>
          {row.status === 'running' ? (
            <Tooltip title="Stop">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onStop(row.id);
                }}
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Start">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  onStart(row.id);
                }}
              >
                <PlayIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.id);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={bots}
      loading={loading}
      error={error}
      title="Bots"
      defaultSort={{ column: 'name', direction: 'asc' }}
    />
  );
};

export default BotsTable; 