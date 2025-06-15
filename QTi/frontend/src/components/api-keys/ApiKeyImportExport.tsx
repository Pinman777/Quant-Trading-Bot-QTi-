import React, { useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';

interface ApiKey {
  id: string;
  name: string;
  exchange: string;
  apiKey: string;
  secretKey: string;
  permissions: string[];
  status: 'active' | 'inactive';
  lastUsed: string;
  createdAt: string;
}

interface ApiKeyImportExportProps {
  open: boolean;
  onClose: () => void;
  apiKeys: ApiKey[];
  onImport: (keys: ApiKey[]) => void;
  onExport: (keys: ApiKey[]) => void;
}

const ApiKeyImportExport: React.FC<ApiKeyImportExportProps> = ({
  open,
  onClose,
  apiKeys,
  onImport,
  onExport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleSelectAll = () => {
    if (selectedKeys.length === apiKeys.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(apiKeys.map((key) => key.id));
    }
  };

  const handleSelectKey = (id: string) => {
    if (selectedKeys.includes(id)) {
      setSelectedKeys(selectedKeys.filter((keyId) => keyId !== id));
    } else {
      setSelectedKeys([...selectedKeys, id]);
    }
  };

  const handleExport = () => {
    const keysToExport = apiKeys.filter((key) => selectedKeys.includes(key.id));
    const data = JSON.stringify(keysToExport, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-keys-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExport(keysToExport);
    onClose();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedKeys = JSON.parse(content) as ApiKey[];
        
        // Валидация импортируемых ключей
        const isValid = importedKeys.every((key) => {
          return (
            key.name &&
            key.exchange &&
            key.apiKey &&
            key.secretKey &&
            Array.isArray(key.permissions)
          );
        });

        if (!isValid) {
          setError('Некорректный формат файла');
          return;
        }

        onImport(importedKeys);
        onClose();
      } catch (err) {
        setError('Ошибка при чтении файла');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Экспорт/Импорт API ключей</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Выберите ключи для экспорта
          </Typography>
          <List>
            <ListItem button onClick={handleSelectAll}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedKeys.length === apiKeys.length}
                  indeterminate={
                    selectedKeys.length > 0 && selectedKeys.length < apiKeys.length
                  }
                />
              </ListItemIcon>
              <ListItemText primary="Выбрать все" />
            </ListItem>
            {apiKeys.map((key) => (
              <ListItem
                key={key.id}
                button
                onClick={() => handleSelectKey(key.id)}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedKeys.includes(key.id)}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={key.name}
                  secondary={`${key.exchange} - ${key.permissions.join(', ')}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImport}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          startIcon={<ImportIcon />}
          onClick={() => fileInputRef.current?.click()}
        >
          Импорт
        </Button>
        <Button
          startIcon={<ExportIcon />}
          variant="contained"
          color="primary"
          onClick={handleExport}
          disabled={selectedKeys.length === 0}
        >
          Экспорт
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiKeyImportExport; 