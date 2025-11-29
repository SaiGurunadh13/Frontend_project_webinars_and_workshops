import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(process.cwd(), 'server', 'data', 'db.json');
const MONGO_URI = process.env.MONGO_URI || '';
const MONGO_DB = process.env.MONGO_DB || 'webinar_db';

let mongoClient = null;
let mongoDB = null;
let useMongo = false;

async function initMongo() {
  if (!MONGO_URI) return;
  try {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    mongoDB = mongoClient.db(MONGO_DB);
    useMongo = true;
    console.log('Connected to MongoDB', MONGO_URI, 'db:', MONGO_DB);
    await Promise.all([
      mongoDB.createCollection('users').catch(()=>{}),
      mongoDB.createCollection('webinars').catch(()=>{}),
      mongoDB.createCollection('registrations').catch(()=>{}),
      mongoDB.createCollection('messages').catch(()=>{}),
      mongoDB.createCollection('loginLogs').catch(()=>{})
    ]);
    try { await mongoDB.collection('users').createIndex({ username: 1 }, { unique: true }); } catch(e){}
  } catch (e) {
    console.error('Failed to init MongoDB', e);
    useMongo = false;
  }
}

initMongo();

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
  if (useMongo) {
    mongoDB.collection('users').find({}, { projection: { password: 1, username: 1, id: 1 } }).toArray()
      .then(list => res.json(list || []))
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  const db = readDB();
  res.json(db.users);
});

// Registrations
app.get('/api/registrations', (req, res) => {
  const db = readDB();
  res.json(db.registrations || []);
});

app.post('/api/registrations', (req, res) => {
  if (useMongo) {
    const item = { id: uuidv4(), timestamp: new Date().toISOString(), ...req.body };
    mongoDB.collection('registrations').insertOne(item)
      .then(r => res.status(201).json(item))
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  const db = readDB();
  const item = { id: uuidv4(), timestamp: new Date().toISOString(), ...req.body };
  db.registrations = db.registrations || [];
  db.registrations.unshift(item);
  writeDB(db);
  res.status(201).json(item);
});

app.delete('/api/registrations/:id', (req, res) => {
  if (useMongo) {
    mongoDB.collection('registrations').findOneAndDelete({ id: req.params.id })
      .then(result => {
        if (!result.value) return res.status(404).json({ error: 'Not found' });
        res.json(result.value);
      })
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
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
  if (useMongo) {
    mongoDB.collection('messages').find({}).toArray()
      .then(list => res.json(list || []))
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  const db = readDB();
  res.json(db.messages || []);
});

app.post('/api/messages', (req, res) => {
  if (useMongo) {
    const item = { id: uuidv4(), timestamp: new Date().toISOString(), ...req.body };
    mongoDB.collection('messages').insertOne(item)
      .then(r => res.status(201).json(item))
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  const db = readDB();
  const item = { id: uuidv4(), timestamp: new Date().toISOString(), ...req.body };
  db.messages = db.messages || [];
  db.messages.unshift(item);
  writeDB(db);
  res.status(201).json(item);
});

app.delete('/api/messages/:id', (req, res) => {
  if (useMongo) {
    mongoDB.collection('messages').findOneAndDelete({ id: req.params.id })
      .then(result => {
        if (!result.value) return res.status(404).json({ error: 'Not found' });
        res.json(result.value);
      })
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
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

// Simple CAPTCHA endpoints (server-side challenge store)
const captchaStore = new Map();
function cleanupCaptchas() {
  const now = Date.now();
  for (const [k, v] of captchaStore.entries()) {
    if (v.expires < now) captchaStore.delete(k);
  }
}
setInterval(cleanupCaptchas, 60 * 1000);

app.get('/api/captcha', (req, res) => {
  // generate a random alphanumeric captcha and return an SVG image data URL
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid confusing chars
  let txt = '';
  for (let i = 0; i < 6; i++) txt += chars.charAt(Math.floor(Math.random() * chars.length));
  const id = uuidv4();
  captchaStore.set(id, { answer: String(txt), expires: Date.now() + 5 * 60 * 1000 });
  // create simple SVG with some noise lines
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'>\n  <rect width='100%' height='100%' fill='#f6f7fb'/>\n  <g font-family='Tahoma, Arial' font-size='34' font-weight='700' fill='#222'>\n    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' transform='rotate(${(Math.random()*10)-5} 100 35)'>${txt}</text>\n  </g>\n  <g stroke='#c8cde8' stroke-width='1'>\n    <line x1='0' y1='10' x2='200' y2='10' opacity='0.3'/>\n    <line x1='0' y1='60' x2='200' y2='60' opacity='0.2'/>\n  </g>\n</svg>`;
  const b64 = Buffer.from(svg).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${b64}`;
  res.json({ id, image: dataUrl });
});

app.post('/api/captcha/verify', (req, res) => {
  const { id, answer } = req.body || {};
  if (!id) return res.status(400).json({ ok: false, error: 'id required' });
  const entry = captchaStore.get(id);
  if (!entry) return res.json({ ok: false, error: 'not found or expired' });
  const ok = String(answer || '').trim() === String(entry.answer).trim();
  // consume captcha
  captchaStore.delete(id);
  res.json({ ok });
});

app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (useMongo) {
    const usersCol = mongoDB.collection('users');
    usersCol.findOne({ username }).then(found => {
      if (found) return res.status(409).json({ error: 'User exists' });
      const user = { id: uuidv4(), username, password };
      usersCol.insertOne(user).then(() => res.status(201).json({ ok: true, user: { id: user.id, username: user.username } }))
        .catch(err => res.status(500).json({ error: err.message }));
    }).catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  const db = readDB();
  if (db.users.find(u => u.username === username)) return res.status(409).json({ error: 'User exists' });
  const user = { id: uuidv4(), username, password };
  db.users.push(user);
  writeDB(db);
  res.status(201).json({ ok: true, user: { id: user.id, username: user.username } });
});

app.delete('/api/users/:username', (req, res) => {
  if (useMongo) {
    mongoDB.collection('users').findOneAndDelete({ username: req.params.username })
      .then(result => {
        if (!result.value) return res.status(404).json({ error: 'Not found' });
        res.json(result.value);
      })
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
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
    // log admin login
    if (useMongo) {
      mongoDB.collection('loginLogs').insertOne({ id: uuidv4(), username, success: true, timestamp: new Date().toISOString(), ip: req.ip }).catch(()=>{});
    }
    return res.json({ ok: true, role: 'admin' });
  }
  if (useMongo) {
    mongoDB.collection('users').findOne({ username, password }).then(found => {
      const log = { id: uuidv4(), username, success: !!found, timestamp: new Date().toISOString(), ip: req.ip };
      mongoDB.collection('loginLogs').insertOne(log).catch(()=>{});
      if (!found) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json({ ok: true, role: 'student', user: { id: found.id, username: found.username } });
    }).catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  const db = readDB();
  const found = db.users.find(u => u.username === username && u.password === password);
  // log attempt
  const logs = db.loginLogs || [];
  logs.unshift({ id: uuidv4(), username, success: !!found, timestamp: new Date().toISOString(), ip: req.ip });
  db.loginLogs = logs;
  writeDB(db);
  if (!found) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ ok: true, role: 'student', user: { id: found.id, username: found.username } });
});

// Get login logs
app.get('/api/login-logs', (req, res) => {
  if (useMongo) {
    mongoDB.collection('loginLogs').find({}).sort({ timestamp: -1 }).toArray()
      .then(list => res.json(list || []))
      .catch(err => res.status(500).json({ error: err.message }));
    return;
  }
  const db = readDB();
  res.json(db.loginLogs || []);
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
