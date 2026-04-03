import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();
app.use(cors());
app.use(express.json());

// Helpers to read/write JSON securely
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const defaultData = { tasks: [], currentTaskId: null };
      await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    throw error;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task is required' });

    const data = await readData();
    data.tasks = [task, ...data.tasks];
    await writeData(data);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    data.tasks = data.tasks.filter(t => t.id !== id);
    if (data.currentTaskId === id) {
        data.currentTaskId = null;
    }
    await writeData(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.put('/api/tasks/current', async (req, res) => {
  try {
    const { currentTaskId } = req.body;
    const data = await readData();
    data.currentTaskId = currentTaskId;
    await writeData(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update current task' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
