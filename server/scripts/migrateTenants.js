require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Workspace = require('../src/models/Workspace');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');
const Campaign = require('../src/models/Campaign');
const Segment = require('../src/models/Segment');
const Order = require('../src/models/Order');
const Message = require('../src/models/Message');
const Opportunity = require('../src/models/Opportunity');
const Learning = require('../src/models/Learning');
const Persona = require('../src/models/Persona');
const Anomaly = require('../src/models/Anomaly');
const AuditLog = require('../src/models/AuditLog');
const FailedCallback = require('../src/models/FailedCallback');

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Get an admin user to be the owner of the default workspace
    let owner = await User.findOne({ role: 'admin' });
    if (!owner) owner = await User.findOne();
    if (!owner) {
      console.log('No users found. Creating a dummy owner for migration.');
      owner = await User.create({ name: 'Admin', email: 'admin@xeno.in', password: 'hashedpassword', role: 'admin' });
    }

    // 2. Find or Create Default Workspace
    let defaultWorkspace = await Workspace.findOne({ name: 'Default Workspace' });
    if (!defaultWorkspace) {
      defaultWorkspace = await Workspace.create({ name: 'Default Workspace', ownerId: owner._id });
      console.log(`Created Default Workspace: ${defaultWorkspace._id}`);
    } else {
      console.log(`Found Default Workspace: ${defaultWorkspace._id}`);
    }

    const wsId = defaultWorkspace._id;

    // 3. Migrate Users
    const userRes = await User.updateMany(
      { $or: [{ activeWorkspace: { $exists: false } }, { activeWorkspace: null }] },
      { $set: { activeWorkspace: wsId }, $addToSet: { workspaces: wsId } }
    );
    console.log(`Migrated ${userRes.modifiedCount} Users.`);

    // 4. Migrate Core Models
    const modelsToMigrate = [
      { name: 'Customers', model: Customer },
      { name: 'Campaigns', model: Campaign },
      { name: 'Segments', model: Segment },
      { name: 'Orders', model: Order },
      { name: 'Messages', model: Message },
      { name: 'Opportunities', model: Opportunity },
      { name: 'Learnings', model: Learning },
      { name: 'Personas', model: Persona },
      { name: 'Anomalies', model: Anomaly },
      { name: 'AuditLogs', model: AuditLog },
      { name: 'FailedCallbacks', model: FailedCallback },
    ];

    for (const { name, model } of modelsToMigrate) {
      if (!model) continue;
      const res = await model.updateMany(
        { $or: [{ workspaceId: { $exists: false } }, { workspaceId: null }] },
        { $set: { workspaceId: wsId } }
      );
      console.log(`Migrated ${res.modifiedCount} ${name}.`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
