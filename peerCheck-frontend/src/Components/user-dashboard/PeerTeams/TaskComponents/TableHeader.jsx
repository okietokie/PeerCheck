//didnt use yet

import { CheckBox } from '@mui/icons-material'
import { TableCell, TableHead, TableRow, Typography, alpha, useTheme } from '@mui/material'

export default function TableHeader() {
    const theme = useTheme();
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
                      <CheckBox
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
                    {[
                      { label: 'TASK TITLE', width: '25%' },
                      { label: 'STATUS', width: '12%' },
                      { label: 'ASSIGNEE', width: '15%' },
                      { label: 'START DATE', width: '12%' },

                      { label: 'DEADLINE', width: '12%' },
                      { label: 'EFFICIENCY', width: '10%' },
                      { label: 'PRIORITY', width: '10%' },
                      { label: 'COMMENTS', width: '10%' },
                      { label: 'PROOF', width: '8%' },
                      { label: 'RISK', width: '10%' },
                      { label: 'ACTIONS', width: '8%' },
                    ].map((header, index) => (
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
                          ...(index === 7 && { borderRadius: '0 12px 0 0' })
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
                          {index === 0 && <Title fontSize="small" />}
                          {index === 1 && <Person fontSize="small" />}
                          {index === 2 && <Circle fontSize="small" />}
                          {index === 3 && <CalendarMonth fontSize="small" />}
                          {index === 4 && <TrendingUp fontSize="small" />}
                          {index === 5 && <Warning fontSize="small" />}
                          {index === 6 && <Task fontSize="small" />}
                          {index === 7 && <Settings fontSize="small" />}
                          {header.label}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                
            
    )
}
