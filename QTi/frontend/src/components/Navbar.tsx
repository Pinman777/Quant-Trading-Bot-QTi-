import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Close as CloseIcon,
  AccountCircle
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const pages = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { title: 'Exchanges', path: '/exchanges', icon: <DashboardIcon /> },
  { title: 'Bots', path: '/bots', icon: <DashboardIcon /> },
  { title: 'Alerts', path: '/alerts', icon: <DashboardIcon /> },
  { title: 'Remote', path: '/remote', icon: <DashboardIcon /> },
];

const settings = [
  { title: 'Profile', icon: <AccountCircle />, path: '/profile' },
  { title: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { title: 'Logout', icon: <LogoutIcon />, action: 'logout' },
];

const Navbar: React.FC = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleUserMenuAction = async (action: string) => {
    handleCloseUserMenu();
    if (action === 'logout') {
      await logout();
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    handleCloseUserMenu();
    router.push(path);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box
          component="img"
          src="/logo.svg"
          alt="QTi Logo"
          sx={{ width: 40, height: 40 }}
        />
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem
            button
            key={page.title}
            onClick={() => handleNavigation(page.path)}
            selected={router.pathname === page.path}
          >
            <ListItemIcon>{page.icon}</ListItemIcon>
            <ListItemText primary={page.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!user) {
    return (
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              QTi
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.title}
                    onClick={() => {
                      handleCloseNavMenu();
                      router.push(page.path);
                    }}
                  >
                    <Typography textAlign="center">{page.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Typography
              variant="h5"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              QTi
            </Typography>

            <Box sx={{ flexGrow: 0 }}>
              <Button
                color="inherit"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button
                color="inherit"
                onClick={() => router.push('/register')}
                sx={{ ml: 1 }}
              >
                Register
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Мобильное меню */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Логотип */}
          <Box
            component="img"
            src="/logo.svg"
            alt="QTi Logo"
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              display: { xs: 'none', md: 'flex' }
            }}
          />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            QTi
          </Typography>

          {/* Десктопное меню */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => handleNavigation(page.path)}
                sx={{
                  my: 2,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  ...(router.pathname === page.path && {
                    color: 'primary.main'
                  })
                }}
              >
                {page.icon}
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Меню пользователя */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user.name} src="/avatar.png">
                  {user.name[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.title}
                  onClick={() => {
                    if (setting.action) {
                      handleUserMenuAction(setting.action);
                    } else if (setting.path) {
                      router.push(setting.path);
                    }
                    handleCloseUserMenu();
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {setting.icon}
                    <Typography textAlign="center" sx={{ ml: 1 }}>
                      {setting.title}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>

      {/* Мобильное меню */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 }
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 