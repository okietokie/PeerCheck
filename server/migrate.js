import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import OLD schema (temporary - we'll query directly)
const oldProjectSchema = new mongoose.Schema({}, { strict: false });
const OldProject = mongoose.model('OldProject', oldProjectSchema, 'peerCheck_projects');

// NEW model
import Project from './models/projects.js';
import User from './models/user.js';

const migrateProjects = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all old projects
    const oldProjects = await OldProject.find();
    console.log(`📦 Found ${oldProjects.length} projects to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const oldProject of oldProjects) {
      try {
        console.log(`🔄 Migrating project: ${oldProject.name}`);
        
        // Build new project structure
        const newProjectData = {
          name: oldProject.name,
          description: oldProject.description,
          endDate: oldProject.endDate,
          status: oldProject.status,
          createdAt: oldProject.createdAt,
          updatedAt: oldProject.updatedAt,
          requirements: oldProject.requirements || []
        };

        // Convert createdBy
        if (oldProject.createdBy && oldProject.createdBy.user) {
          // Check if it's a valid ObjectId format
          if (mongoose.Types.ObjectId.isValid(oldProject.createdBy.user)) {
            newProjectData.createdBy = oldProject.createdBy.user;
          } else {
            console.log(`⚠️ Invalid createdBy ID for project ${oldProject.name}, using fallback`);
            // Find a valid user to use as fallback
            const fallbackUser = await User.findOne();
            if (fallbackUser) {
              newProjectData.createdBy = fallbackUser._id;
            }
          }
        }

        // Convert members
        newProjectData.members = [];
        if (oldProject.members && Array.isArray(oldProject.members)) {
          for (const oldMember of oldProject.members) {
            if (oldMember.user && mongoose.Types.ObjectId.isValid(oldMember.user)) {
              newProjectData.members.push({
                user: oldMember.user,
                role: oldMember.userRole || 'project-member',
                joinedAt: oldMember.joinedAt || new Date()
              });
            }
          }
        }

        // Add creator as member if not already included
        const creatorIsMember = newProjectData.members.some(member => 
          member.user.toString() === newProjectData.createdBy.toString()
        );
        
        if (!creatorIsMember && newProjectData.createdBy) {
          newProjectData.members.push({
            user: newProjectData.createdBy,
            role: 'project-lead',
            joinedAt: oldProject.createdAt || new Date()
          });
        }

        // Convert tasks
        newProjectData.tasks = [];
        if (oldProject.tasks && Array.isArray(oldProject.tasks)) {
          for (const taskId of oldProject.tasks) {
            if (mongoose.Types.ObjectId.isValid(taskId)) {
              newProjectData.tasks.push(taskId);
            }
          }
        }

        // Create new project document
        const newProject = new Project(newProjectData);
        await newProject.save();
        
        migratedCount++;
        console.log(`✅ Migrated: ${oldProject.name}`);

      } catch (error) {
        errorCount++;
        console.log(`❌ Failed to migrate project ${oldProject.name}:`, error.message);
      }
    }

    console.log('\n🎉 MIGRATION SUMMARY:');
    console.log(`✅ Successfully migrated: ${migratedCount} projects`);
    console.log(`❌ Failed: ${errorCount} projects`);
    console.log(`📊 Total processed: ${oldProjects.length} projects`);

  } catch (error) {
    console.log('🚨 Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run migration
migrateProjects();