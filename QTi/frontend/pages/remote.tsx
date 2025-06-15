import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { Layout } from '../components/Layout';
import RemoteStorage from '../components/RemoteStorage';

const RemotePage: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Remote Storage Management
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Manage your remote storage connections and synchronize files between local and remote storage.
          </Typography>
        </Paper>
        <RemoteStorage />
      </Container>
    </Layout>
  );
};

export default RemotePage; 