import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Добро пожаловать в Qiti!
        </Typography>
        <Typography variant="body1">
          Это главная страница вашего приложения. Вы можете начать редактирование здесь.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 