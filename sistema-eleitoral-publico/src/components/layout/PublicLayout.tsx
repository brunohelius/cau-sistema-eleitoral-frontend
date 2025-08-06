import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'

export function PublicLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#f5f5f5',
          py: 4
        }}
      >
        <Outlet />
      </Box>
      
      <PublicFooter />
    </Box>
  )
}