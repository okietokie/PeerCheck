import { AccessAlarm, AttachFile, CalendarMonth, Circle, EditCalendarTwoTone, Error, ErrorOutline, Expand, Person, PlayArrow, Settings, SignalWifiStatusbar1BarTwoTone, Task, Title, TrendingUp, Warning } from '@mui/icons-material'
import { alpha, Checkbox, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import React from 'react'

export default function TaskTableHeader({
  allSelected,
  selectedTasks,
  handleSelectAll,
  theme,
  showProjectColumn = false
}) {
  const headers = [
    { label: '', width: '2%' },
    { label: 'TASK TITLE', width: showProjectColumn ? '20%' : '25%' },
    ...(showProjectColumn ? [{ label: 'PROJECT', width: '14%' }] : []),
    { label: 'STATUS', width: '12%' },
    { label: 'ASSIGNEE', width: '15%' },
    { label: 'PRIORITY', width: '10%' },
    { label: 'DUE', width: '10%' },
    { label: 'EFFICIENCY', width: '10%' },
    { label: 'ACTIONS', width: '10%' },
  ];

  return (
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'transparent' }}>
                    <TableCell 
                      padding="checkbox"
                      sx={{
                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.background.paper, 0.8)
                          : alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(10px)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        borderRadius: '12px 0 0 0',
                      }}
                    >
                      <Checkbox
                        checked={allSelected}
                        indeterminate={selectedTasks.size > 0 && !allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: theme.palette.primary.main,
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                          '&.MuiCheckbox-indeterminate': {
                            color: theme.palette.primary.main,
                          }
                        }}
                      />
                    </TableCell>
                    {headers.map((header, index) => (
                      <TableCell 
                        key={header.label}
                        sx={{
                          width: header.width,
                          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.background.paper, 0.8)
                            : alpha(theme.palette.background.paper, 0.9),
                          backdropFilter: 'blur(10px)',
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                          ...(index === headers.length - 1 && { borderRadius: '0 12px 0 0' })
                        }}
                      >
                        <Typography
                          variant="subtitle2" 
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            fontFamily: '"Inter", sans-serif',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {index === 0 }
                          {index === 1 }
                          {header.label === 'PROJECT' && <Task fontSize="small" />}
                          {header.label === 'STATUS' && <SignalWifiStatusbar1BarTwoTone fontSize="small" />}
                          {header.label === 'ASSIGNEE' && <Person  fontSize="small" />}
                          {header.label === 'PRIORITY' && <Error fontSize="small" />}
                          {header.label === 'DUE' && <ErrorOutline fontSize='small' /> } 
                          {header.label === 'EFFICIENCY' && <AccessAlarm fontSize='small'/>}
                          {header.label === 'ACTIONS' && <PlayArrow fontSize="small" />}

                          {header.label}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>  
  )
}
