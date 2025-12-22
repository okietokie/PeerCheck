import cron from 'node-cron';
import Project from '../models/projects.js';
import { notifyProjectEvents } from '../controllers/projectController.js';

export const setupDeadlineChecker = () => {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      const today = new Date();
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      
      const projects = await Project.find({
        endDate: {
          $gte: today,
          $lte: threeDaysFromNow
        },
        status: { $in: ['active', 'ongoing'] }
      }).populate('teamId');
      
      for (const project of projects) {
        const daysRemaining = Math.ceil((project.endDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 3) {
          await notifyProjectEvents.deadlineApproaching(
            project._id,
            daysRemaining
          );
        }
      }
      
      console.log(`Checked deadlines for ${projects.length} projects`);
    } catch (error) {
      console.error('Error in deadline checker:', error);
    }
  });
};