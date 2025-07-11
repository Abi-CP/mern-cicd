import express from 'express';
import { randomUUID } from 'crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT;
const userItems = {}; // In-memory storage: { sessionId: [{ id, name }, ...], sessionId: [{ id, name } }

// console.log(process.env.PORT);
// console.log(process.env.CORS_ALLOWED_LIST);


app.use(cors({ origin: [ process.env.CORS_ALLOWED_LIST.split(',') ], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Middleware to ensure sessionId is set
app.use((req, res, next) => {
  let sessionId = req.cookies.sessionId;
  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 3600 * 1000 });
  }
  // Initialize items array for new sessionId
  if (!userItems[sessionId]) {
    userItems[sessionId] = [];
  }
  req.sessionId = sessionId;
  next();
});

// GET all items for the user
app.get('/items', (req, res) => {
  const items = userItems[req.sessionId];
  res.json({ items, sessionId: req.sessionId });
});

// POST a new item for the user
app.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const item = { id: randomUUID(), name };
  userItems[req.sessionId].push(item);
  res.status(201).json(item);
});

// PUT (update) an item for the user
app.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const items = userItems[req.sessionId];
  const item = items.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  item.name = name;
  res.json(item);
});

// DELETE an item for the user
app.delete('/items/:id', (req, res) => {
  const { id } = req.params;
  const items = userItems[req.sessionId];
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  items.splice(index, 1);
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});