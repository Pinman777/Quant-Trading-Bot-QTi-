import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { ServerList } from '../components/remote/ServerList';
import { BotList } from '../components/remote/BotList';
import { Server } from '../services/remote';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`server-tabpanel-${index}`}
      aria-labelledby={`server-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `server-tab-${index}`,
    'aria-controls': `server-tabpanel-${index}`,
  };
}

const ServersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  const handleServerSelect = (server: Server): void => {
    setSelectedServer(server);
    setActiveTab(1);
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          QTi Server Management
        </Typography>

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="server management tabs"
          >
            <Tab label="Servers" {...a11yProps(0)} />
            <Tab
              label="QTi Bots"
              {...a11yProps(1)}
              disabled={!selectedServer}
            />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <ServerList onServerSelect={handleServerSelect} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {selectedServer ? (
              <BotList serverId={selectedServer.id} />
            ) : (
              <Typography>Please select a server to manage QTi bots</Typography>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ServersPage; 