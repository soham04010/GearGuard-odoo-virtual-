import express from 'express';
import cors from 'cors';
import { db } from './db/index.js';
import { requests, equipment } from './db/schema.js';
import { eq } from 'drizzle-orm';

const app = express();
app.use(cors());
app.use(express.json());

// Flow 1: Breakdown (Auto-fill Team)
app.post('/api/requests', async (req, res) => {
  const { equipmentId, subject, type } = req.body;
  const asset = await db.query.equipment.findFirst({ where: eq(equipment.id, equipmentId) });
  
  const [newRequest] = await db.insert(requests).values({
    subject,
    type,
    equipmentId,
    status: 'New'
  }).returning();
  
  res.json({ ...newRequest, teamId: asset?.maintenanceTeamId });
});

app.listen(3001, () => console.log("Backend on port 3001"));