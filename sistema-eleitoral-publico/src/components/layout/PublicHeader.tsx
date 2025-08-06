import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button,
  Container,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { 
  Menu as MenuIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Groups as GroupsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Gavel as GavelIcon,
  HowToVote as VoteIcon
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Public menu items (visible to all)
const publicMenuItems = [
  { label: 'Início', path: '/', icon: null },
  { label: 'Eleições', path: '/eleicoes', icon: null },
  { label: 'Chapas', path: '/chapas', icon: null },
  { label: 'Calendários', path: '/calendarios', icon: null },
  { label: 'Resultados', path: '/resultados', icon: null },
  { label: 'Documentos', path: '/documentos', icon: null }
]

// Authenticated user menu items
const authenticatedMenuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Votação', path: '/voting-status', icon: <VoteIcon fontSize="small" /> },
  { label: 'Minhas Chapas', path: '/meus-processos', icon: <GroupsIcon fontSize="small" /> },
  { label: 'Criar Chapa', path: '/criar-chapa', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Impugnações', path: '/impugnacoes', icon: <GavelIcon fontSize="small" /> },
  { label: 'Substituições', path: '/substituicoes', icon: <PersonIcon fontSize="small" /> },
  { label: 'Denúncias', path: '/denuncias', icon: <AssignmentIcon fontSize="small" /> }
]

// Commission member additional items
const commissionMenuItems = [
  { label: 'Comissão Eleitoral', path: '/comissao-eleitoral', icon: <GroupsIcon fontSize="small" /> }
]

export function PublicHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, isAuthenticated, logout } = useAuth()
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    handleMenuClose()
    handleUserMenuClose()
  }

  const handleLogout = async () => {
    await logout()
    handleUserMenuClose()
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Determine which menu items to show based on authentication and roles
  const getMenuItems = () => {
    if (!isAuthenticated) {
      return publicMenuItems
    }

    // For authenticated users, combine public and authenticated items
    let items = [...publicMenuItems, ...authenticatedMenuItems]

    // Add commission items if user has commission role
    if (user?.roles?.includes('COMISSAO')) {
      items = [...items, ...commissionMenuItems]
    }

    return items
  }

  const menuItems = getMenuItems()

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/logo.png" 
              alt="CAU Logo" 
              style={{ height: 40, marginRight: 16, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
                display: { xs: 'none', sm: 'block' }
              }}
              onClick={() => navigate('/')}
            >
              Sistema Eleitoral CAU
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {menuItems.map((item) => (
                  <MenuItem 
                    key={item.path} 
                    onClick={() => handleNavigation(item.path)}
                    selected={isActive(item.path)}
                  >
                    {item.icon && (
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                    )}
                    <ListItemText>{item.label}</ListItemText>
                  </MenuItem>
                ))}
                {isAuthenticated && (
                  <>
                    <Divider />
                    <MenuItem onClick={() => handleNavigation('/perfil')}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Meu Perfil</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Sair</ListItemText>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                {menuItems.slice(0, 6).map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={{
                      fontWeight: isActive(item.path) ? 600 : 400,
                      backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={Boolean(userMenuAnchor) ? 'user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={Boolean(userMenuAnchor) ? 'true' : undefined}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {user?.nome?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="user-menu"
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    onClick={handleUserMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {user?.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                    <Divider />
                    {authenticatedMenuItems.slice(0, 3).map((item) => (
                      <MenuItem key={item.path} onClick={() => handleNavigation(item.path)}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.label}</ListItemText>
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={() => handleNavigation('/perfil')}>
                      <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Meu Perfil</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Sair</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="inherit"
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    Entrar
                  </Button>
                  <Button
                    color="inherit"
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      }
                    }}
                  >
                    Cadastrar
                  </Button>
                </Box>
              )}
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}