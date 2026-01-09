import React from 'react';
import { Avatar, Box, Chip, Divider, Typography, Stack, Zoom, Paper } from '@mui/material';
import { 
  AutoAwesome, Groups, SentimentSatisfiedAlt, 
  LightbulbCircle, Psychology, FactCheck, 
  RecordVoiceOver, Balance, RocketLaunch, 
  Check,
  TrendingUp
} from '@mui/icons-material';

export const welcomeTourSteps = (theme) => [
{
    id: 'welcome',
    title: "Welcome To Peercheck!",
    icon: <AutoAwesome sx={{ color: 'primary.main' }} />,
    element: null,
    position: 'center',
    content: (
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Divider sx={{ mb: 3 }}>
          <Chip 
            icon={<SentimentSatisfiedAlt />} 
            label="Meet Ray" 
            variant="outlined" 
            size="small" 
            sx={{ fontWeight: 'bold', borderColor: 'primary.main', color: 'primary.main' }} 
          />
        </Divider>
        <Stack spacing={2} alignItems="center">
          <Zoom in={true}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 70, 
                height: 70, 
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}` 
              }}
            >
              R
            </Avatar>
          </Zoom>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Hi there! I'm <Chip label="RAY" color="primary" size="small" sx={{ fontWeight: 900, borderRadius: 1 }} />
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 280, lineHeight: 1.6 }}>
            "Because great teamwork shouldn't feel like a group project chore."
          </Typography>
        </Stack>
      </Box>
    )
  },
  {
    id: 'the-why',
    title: "Start with the ‘Why’!",
    icon: <LightbulbCircle sx={{ color: 'secondary.main' }} />,
    element: null,
    position: 'center',
    content: (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary', textAlign: 'center' }}>
          Don’t worry about the <Typography component="span" sx={{ color: 'secondary.main', fontWeight: 900 }}>‘How’</Typography> just yet.
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Understanding why teamwork often fails is the first step to making it better. 
          </Typography>
        </Paper>
        <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'CENTER', fontWeight: 700, color: 'primary.main', letterSpacing: 1, animation: 'pulse 2s infinite'}}>
          REMEMBER: A single fact outweighs a thousand opinions
        </Typography>
      </Box>
    )
  },
    {
    id: 'the-why',
    title: "Start with the ‘Why’!",
    icon: <LightbulbCircle sx={{ color: 'secondary.main' }} />,
    element: null,
    position: 'center',
    content: (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary', textAlign: 'center' }}>
          Don’t worry about the <Typography component="span" sx={{ color: 'secondary.main', fontWeight: 900 }}>‘How’</Typography> just yet.
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2, display: 'block', textAlign: 'CENTER', fontWeight: 700, color: 'primary.main', letterSpacing: 1, animation: 'pulse 2s infinite'}}>
          So ready explore some facts?
        </Typography>
      </Box>
    )
  },
  {
    id: 'fact-1',
    title: "92% Agreement",
    icon: <FactCheck color="success" />,
    element: null,
    position: 'center',
    content: (
      <Box sx={{ 
        textAlign: 'center',
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.success.main}10 0%, ${theme.palette.primary.main}10 100%)`,
        borderRadius: 4,
        border: `2px solid ${theme.palette.success.main}30`
      }}>
        <Typography variant="overline" sx={{ 
          color: theme.palette.text.secondary,
          letterSpacing: 3,
          fontWeight: 600
        }}>
          Harvard Research
        </Typography>
        <Box sx={{
          my: 3,
          position: 'relative',
          display: 'inline-block'
        }}>
          <Typography variant="h1" sx={{ 
            fontWeight: 900, 
            color: theme.palette.success.main,
            fontSize: '5rem',
            textShadow: `0 0 30px ${theme.palette.success.main}60`,
            lineHeight: 1
          }}>
            92%
          </Typography>
          <Box sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: theme.palette.success.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'bounce 1s infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' }
            }
          }}>
            <TrendingUp sx={{ color: 'white', fontSize: 16 }} />
          </Box>
        </Box>
        <Typography variant="h6" sx={{ 
          fontWeight: 700,
          color: theme.palette.text.primary,
          maxWidth: 300,
          mx: 'auto'
        }}>
          of students agree that <span style={{ color: theme.palette.success.main }}>peer reviews</span> ensure equal work.
        </Typography>
      </Box>
    )
  },
  {
    id: 'fact-2',
    title: "Team Power",
    icon: <Groups color="primary" />,
    element: null,
    position: 'center',
    content: (
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ 
            p: 2, 
            borderRadius: '50%',
            bgcolor: theme.palette.secondary.main }}>
          <Psychology sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>64% Longer Focus</Typography>
          <Typography variant="caption" color="text.secondary">
            Stanford (2014) found students in teams focus significantly longer than solo workers.
          </Typography>
        </Box>
      </Stack>
    )
  },
  {
    id: 'fact-3',
    title: "No More Bosses",
    icon: <RecordVoiceOver sx={{ color: 'primary.main' }} />,
    element: null,
    position: 'center',
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Teams are <Typography component="span" fontWeight={800} color="primary.main">67% less likely</Typography> to have a "bossy" member when roles are clear.
        </Typography>
  <Box sx={{ width: '100%', height: 10, bgcolor: theme.palette.divider, borderRadius: 5, overflow: 'hidden', mt: 1 }}>
    <Box sx={{ width: `67%`, height: '100%', bgcolor: `secondary.main`, boxShadow: `0 0 10px ${theme.palette.primary.main}` }} />
  </Box>
          <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
          Source: University of Washington
        </Typography>
      </Box>
    )
  },
  {
    id: 'fact-4',
    title: "Social Intelligence",
    icon: <Balance color="warning" />,
    element: null,
    position: 'center',
    content: (
      <Box sx={{ borderLeft: '4px solid', borderColor: 'warning.main', pl: 2 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          "The most successful teams aren’t the smartest—they’re the ones where everyone listens and shares equally."
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, mt: 1, display: 'block' }}>
          — MIT Research
        </Typography>
      </Box>
    )
  },
  {
    id: 'final',
    title: 'Facts over Feelings',
    icon: <RocketLaunch sx={{ color: 'primary.main' }} />,
    element: null,
    position: 'center',
    content: (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
          The truth of a team is found in the data, not the drama!
        </Typography>
        <Stack spacing={1}>
            {["Fairness", "Transparency", "Collaboration"].map((text) => (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <Chip label={text} variant="soft" color="primary" size='small'/> <Check />
                </Stack>
            ) )}
        </Stack>
        <Typography variant="subtitle2" sx={{ mt: 3, color: 'text.secondary' }}>
          Ready to transform your group projects?
        </Typography>
      </Box>
    )
  }
];

