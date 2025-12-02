import axiosClient from '@/api/axiosClient';
import { AddCircleOutline, RateReview, Schedule } from '@mui/icons-material';
import { Button, Checkbox, Dialog, IconButton, Slider } from '@mui/material';
import { Box, Stack } from '@mui/system';
import React, { useState, useEffect } from 'react'; 


export default function Projects() {
  const [createTask, setCreateTask] = useState(false);

const projects= [
{
    id: "proj_001",

    projectName: "PeerCheck – Activity Based Evaluation System",

    description:
      "A web-based system that evaluates student projects using task activity, peer review, and anti-fake work checks without invading user privacy.",

    startDate: "2025-02-01",
    endDate: "2025-04-15",

    createdBy: "Kalyani",

    status: "ongoing",
    tags: ["web design", "assignment"],

    team: [
      "Kalyani",
      "Ayaan",
      "Sara",
      "Rohit"
    ],
    teamName: 'team 1',

    milestones: [
      {
        id: "m1",
        title: "Planning & Research",
        dueDate: "2025-02-15"
      },
      {
        id: "m2",
        title: "Development",
        dueDate: "2025-03-20"
      },
      {
        id: "m3",
        title: "Testing & Evaluation",
        dueDate: "2025-04-05"
      },
      {
        id: "m4",
        title: "Final Submission",
        dueDate: "2025-04-15"
      }
    ]
  }

];
  
  const handleTaskCreation = async () => {
    setCreateTask(true)
  }

  useEffect(() => {
    handleTaskCreation();
  }, []);
  

  return (
    <div>

      {projects.map((project) => (
       <Button
          variant='text'
          sx={{
            width:'100%',
            borderRadius:0,
            justifyContent:'flex-start'
            
          }}
          >
          <Box 
            sx={{
              width: '100%',
              display:'flex',
              textAlign: 'left',
              alignItems: 'center',
              gap:2
            }}>
            <Checkbox/>
            <Box sx={{
                  p:2,
                  maxWidth:"50%"
                }}>
                  {project.projectName}
            </Box>
            <Stack direction="row" spacing={0.1}>
              <IconButton
                onClick={handleTaskCreation}
                >
                <AddCircleOutline />
              </IconButton>
              <IconButton>
                <Schedule />
              </IconButton>
              <IconButton>
                <RateReview />
              </IconButton>
            </Stack>

            <Box 
              sx={{
                p:1
              }}
              >
              {project.teamName}
            </Box>
            <Box 
              sx={{
                p:1
              }}
              >
              {project.status}
            </Box>
            <Box 
              sx={{
                p:1
              }}
              >
              TAGS
            </Box>
            <Box 
              sx={{
                p:1
              }}
              >
              <Slider/>  {/**it will be fixed and cannot be tampred with ny the user, will provide the logic */}
              Progress  {/*small handwriting just to let the user know or it could be a hover as well whenthe progress is shown kinda works like a label or aria label or wtvs */}

            </Box>


          </Box>

        </Button>
      ))}
      
      {createTask === true && (
        <Dialog
          
          >

        </Dialog>
      )}

    </div>
  )
}