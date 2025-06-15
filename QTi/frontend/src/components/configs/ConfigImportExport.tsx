import React, { useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  FileUpload as UploadIcon,
} from '@mui/icons-material';

interface ConfigImportExportProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

const ConfigImportExport: React.FC<ConfigImportExportProps> = ({
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={onExport}
      >
        Экспорт
      </Button>
      <Button
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={handleImportClick}
      >
        Импорт
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default ConfigImportExport; 