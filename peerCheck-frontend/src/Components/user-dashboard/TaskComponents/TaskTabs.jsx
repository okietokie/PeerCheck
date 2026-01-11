// TaskTabs.jsx
import React, { useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

const TaskTabs = ({ activeTab = "all", onTabChange, tasks, userId, onFilterTasks }) => {
  // Map tab values to indices for MUI Tabs
  const tabIndex = { all: 0, my: 1, managed: 2 };
  const indexToTab = ["all", "my", "managed"];

  const handleChange = (event, newValue) => {
    onTabChange(indexToTab[newValue]);
  };
  
  useEffect(() => {
    if (onFilterTasks) {
      const filtered = tasks.filter(task => {
        if (activeTab === "all") return true;
        if (activeTab === "my") return task.assignedTo?._id === userId;
        if (activeTab === "managed") return task.assignedTo?._id !== userId;
        return false;
      });
      onFilterTasks(filtered);
    }
  }, [activeTab, tasks, userId, onFilterTasks]);

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
      <Tabs
        value={tabIndex[activeTab] || 0}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        aria-label="task tabs"
      >
        <Tab label="All Tasks" />
        <Tab label="My Tasks" />
        <Tab label="Tasks Managed by Me" />
      </Tabs>
    </Box>
  );
};

export default TaskTabs;