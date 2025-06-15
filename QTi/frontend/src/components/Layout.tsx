import { ReactNode, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AutoGraph as BotIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Bots', icon: <BotIcon />, path: '/bots' },
  { text: 'Backtesting', icon: <AssessmentIcon />, path: '/backtesting' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show layout on login page
  if (router.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar
            position="fixed"
            sx={{
              zIndex: theme.zIndex.drawer + 1,
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              ...(open && {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              }),
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={{ marginRight: 5 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                QTi - Quant Trading Bot
              </Typography>
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {user.username}
                  </Typography>
                  <Button
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              )}
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              ...(open && {
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                  boxSizing: 'border-box',
                },
              }),
              ...(!open && {
                '& .MuiDrawer-paper': {
                  transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                  }),
                  overflowX: 'hidden',
                  width: theme.spacing(7),
                  boxSizing: 'border-box',
                },
              }),
            }}
          >
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
              }}
            >
              <IconButton onClick={handleDrawerToggle}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  href={item.path}
                  selected={router.pathname === item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItem>
              ))}
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              mt: '64px',
            }}
          >
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </ProtectedRoute>
  );
} 