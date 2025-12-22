import { FolderOpen, InfoOutlined } from '@mui/icons-material'
import { Box, Button, Paper, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function MyProjectNull() {
    const navigate = useNavigate();

return ( 
 <Box
    sx={{  
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      p: 3,
      textAlign: 'center',
      bgcolor: 'background.paper',
    }}
  >
    <Box sx={{ mb: 2 }}>
      <InfoOutlined
        sx={{ 
          fontSize: 48, 
          color: 'primary.main',
          opacity: 0.8 
        }} 
      />
    </Box>
    
    <Typography 
      variant="h6" 
      color="text.primary"
      sx={{ mb: 3, fontWeight: 500 }}
    >
      No Project Selected
    </Typography>

    <Paper
      variant="outlined"
      sx={{
        p: 3,
        bgcolor: 'background.default',
        maxWidth: 400,
        width: '100%'
      }}
    >
        
      <Stack spacing={2}>
        <Typography variant="body1" color="text.secondary">
          To get started, please select a project:
        </Typography>
        
        <Stepper orientation="vertical"> 
          <Step active>
            <StepLabel>
              <Typography variant="body1" fontWeight="medium">
                Go to Projects Tab
              </Typography>
            </StepLabel>
          </Step>
          <Step active>
            <StepLabel>
              <Typography variant="body1" fontWeight="medium">
                Double click on a project
              </Typography>
            </StepLabel>
          </Step>
          <Step active>
            <StepLabel>
              <Typography variant="body1" fontWeight="medium">
                View project details here
              </Typography>
            </StepLabel>
          </Step>
        </Stepper>
        
        <Button
          variant="contained"
          startIcon={<FolderOpen />}
          onClick={() => {
            navigate('/user-app/projects')
          }}
          sx={{ mt: 2 }}
        >
          Browse Projects
        </Button>
      </Stack>
    </Paper>
  </Box>
  
)
}
