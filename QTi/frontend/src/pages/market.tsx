import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import GlobalMetrics from '../components/market/GlobalMetrics';
import CryptocurrencyList from '../components/market/CryptocurrencyList';
import CryptocurrencyDetails from '../components/market/CryptocurrencyDetails';
import { Cryptocurrency } from '../services/coinmarketcap';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`market-tabpanel-${index}`}
    aria-labelledby={`market-tab-${index}`}
  >
    {value === index && <Box py={3}>{children}</Box>}
  </div>
);

const MarketPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCryptoSelect = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto);
    setActiveTab(2); // Переключение на вкладку с деталями
  };

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Market Overview
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Global Metrics" />
            <Tab label="Cryptocurrencies" />
            {selectedCrypto && <Tab label={`${selectedCrypto.name} Details`} />}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <GlobalMetrics />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <CryptocurrencyList onSelect={handleCryptoSelect} />
        </TabPanel>

        {selectedCrypto && (
          <TabPanel value={activeTab} index={2}>
            <CryptocurrencyDetails cryptocurrency={selectedCrypto} />
          </TabPanel>
        )}
      </Box>
    </Container>
  );
};

export default MarketPage; 