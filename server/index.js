import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(process.cwd(), 'server', 'data', 'db.json');

app.use(cors());
app.use(bodyParser.json());

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { webinars: [], users: [], registrations: [], messages: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// Webinars
app.get('/api/webinars', (req, res) => {
  const db = readDB();
  res.json(db.webinars);
});

app.post('/api/webinars', (req, res) => {
  const db = readDB();
  const item = { id: uuidv4(), ...req.body };
  db.webinars.unshift(item);
  writeDB(db);
  res.status(201).json(item);
});

app.put('/api/webinars/:id', (req, res) => {
  const db = readDB();
  const idx = db.webinars.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.webinars[idx] = { ...db.webinars[idx], ...req.body };
  writeDB(db);
  res.json(db.webinars[idx]);
});

app.delete('/api/webinars/:id', (req, res) => {
  const db = readDB();
  const idx = db.webinars.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.webinars.splice(idx, 1)[0];
  writeDB(db);
  res.json(removed);
});

// Users & Auth
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

// Registrations
app.get('/api/registrations', (req, res) => {
  const db = readDB();
  res.json(db.registrations || []);
});

app.post('/api/registrations', (req, res) => {
  const db = readDB();
  const item = { id: uuidv4(), timestamp: new Date().toISOString(), ...req.body };
  db.registrations = db.registrations || [];
  db.registrations.unshift(item);
  writeDB(db);
  res.status(201).json(item);
});

app.delete('/api/registrations/:id', (req, res) => {
  const db = readDB();
  db.registrations = db.registrations || [];
  const idx = db.registrations.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.registrations.splice(idx, 1)[0];
  writeDB(db);
  res.json(removed);
});

// Messages
app.get('/api/messages', (req, res) => {
  const db = readDB();
  res.json(db.messages || []);
});

app.post('/api/messages', (req, res) => {
  const db = readDB();
  const item = { id: uuidv4(), timestamp: new Date().toISOString(), ...req.body };
  db.messages = db.messages || [];
  db.messages.unshift(item);
  writeDB(db);
  res.status(201).json(item);
});

app.delete('/api/messages/:id', (req, res) => {
  const db = readDB();
  db.messages = db.messages || [];
  const idx = db.messages.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.messages.splice(idx, 1)[0];
  writeDB(db);
  res.json(removed);
});

// Reply to a message (admin)
app.post('/api/messages/:id/reply', (req, res) => {
  const db = readDB();
  db.messages = db.messages || [];
  const idx = db.messages.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const reply = { text: req.body.text || '', by: req.body.by || 'admin', timestamp: new Date().toISOString() };
  db.messages[idx].reply = reply;
  writeDB(db);
  res.json(db.messages[idx]);
});

app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const db = readDB();
  if (db.users.find(u => u.username === username)) return res.status(409).json({ error: 'User exists' });
  const user = { id: uuidv4(), username, password };
  db.users.push(user);
  writeDB(db);
  res.status(201).json({ ok: true, user: { id: user.id, username: user.username } });
});

app.delete('/api/users/:username', (req, res) => {
  const db = readDB();
  db.users = db.users || [];
  const idx = db.users.findIndex(u => u.username === req.params.username);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.users.splice(idx, 1)[0];
  writeDB(db);
  res.json(removed);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  // admin shortcut
  if (username === 'admin' && password === 'admin') {
    return res.json({ ok: true, role: 'admin' });
  }

  const db = readDB();
  const found = db.users.find(u => u.username === username && u.password === password);
  if (!found) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ ok: true, role: 'student', user: { id: found.id, username: found.username } });
});

app.post('/api/auth/forgot', (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) return res.status(400).json({ error: 'username and newPassword required' });
  const db = readDB();
  const idx = db.users.findIndex(u => u.username === username);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  db.users[idx].password = newPassword;
  writeDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Webinar API listening on http://localhost:${PORT}`);
});
