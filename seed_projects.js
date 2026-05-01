const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'data');
const dbPath = path.join(dbDir, 'taskmanager.db');

async function seedProjects() {
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);
  
  try {
    // Get Shukla Admin ID (owner)
    const adminQuery = db.exec("SELECT id FROM users WHERE email='shukla@taskmanager.io'");
    let adminId;
    if (adminQuery.length > 0 && adminQuery[0].values.length > 0) {
      adminId = adminQuery[0].values[0][0];
    } else {
        console.log("Could not find admin user.");
        return;
    }

    // Insert Generalist Project
    db.run("INSERT INTO projects (name, description, owner_id) VALUES ('Generalist', 'General tasks', ?)", [adminId]);
    const generalistId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];

    // Insert Evals Project
    db.run("INSERT INTO projects (name, description, owner_id) VALUES ('Evals', 'Evaluation tasks', ?)", [adminId]);
    const evalsId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];
    
    // Add member to projects
    db.run("INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'admin')", [generalistId, adminId]);
    db.run("INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'admin')", [evalsId, adminId]);

    // Save DB
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log("Successfully added Generalist and Evals projects.");

  } catch (err) {
    console.error("Error updating DB", err);
  } finally {
      db.close();
  }
}

seedProjects().catch(console.error);
