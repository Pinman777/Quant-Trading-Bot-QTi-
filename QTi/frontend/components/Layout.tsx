import React from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, useTheme, ThemeProvider, createTheme, CssBaseline, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SmartToy as BotIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Cloud as CloudIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const drawerWidth = 240;

interface MainProps {
  open?: boolean;
  theme?: Theme;
}

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<MainProps>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [open, setOpen] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const router = useRouter();
  const theme = useTheme();

  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1A2B44',
      },
      secondary: {
        main: '#00C4B4',
      },
      error: {
        main: '#FF5252',
      },
    },
  });

  const menuItems: MenuItem[] = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
    { text: 'Рынок', icon: <TimelineIcon />, path: '/market' },
    { text: 'Боты', icon: <BotIcon />, path: '/bots' },
    { text: 'Бэктестинг', icon: <TimelineIcon />, path: '/backtest' },
    { text: 'Удаленные серверы', icon: <CloudIcon />, path: '/remote' },
    { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(!open)}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ ml: 2, flexGrow: 1 }}>
              QTi - Quant Trading Bot
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setDarkMode(!darkMode)}
              edge="end"
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <Toolbar />
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                onClick={() => router.push(item.path)}
                selected={router.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: muiTheme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                  '&:hover': {
                    backgroundColor: muiTheme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.08)',
                  },
                  cursor: 'pointer',
                }}
              >
                <ListItemIcon sx={{ color: router.pathname === item.path ? muiTheme.palette.primary.main : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    color: router.pathname === item.path ? 'primary' : 'inherit',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Main open={open}>
          <Toolbar />
          {children}
        </Main>
      </Box>
    </ThemeProvider>
  );
}; 