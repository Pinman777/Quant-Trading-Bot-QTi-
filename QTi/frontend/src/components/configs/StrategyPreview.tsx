import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const PreviewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

interface StrategyParameter {
  name: string;
  value: string | number;
  description: string;
}

interface StrategyPreviewProps {
  open: boolean;
  onClose: () => void;
  strategy: string;
  parameters: StrategyParameter[];
}

const StrategyPreview: React.FC<StrategyPreviewProps> = ({
  open,
  onClose,
  strategy,
  parameters,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Предпросмотр стратегии: {strategy}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Параметры стратегии
          </Typography>
          <Grid container spacing={2}>
            {parameters.map((param) => (
              <Grid item xs={12} md={6} key={param.name}>
                <PreviewPaper>
                  <Typography variant="subtitle1" gutterBottom>
                    {param.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {param.description}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {param.value}
                  </Typography>
                </PreviewPaper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StrategyPreview; 