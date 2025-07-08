const express = require('express');
const cors = require('cors');
const storyLines = require('./storyLines');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const clients = new Map(); // { clientId: { res, index, timeout, broadcasting } }

// SSE endpoint
app.get('/stream', (req, res) => {
  const clientId = req.query.id;
  if (!clientId) return res.status(400).send('Client ID required');

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.flushHeaders();

  clients.set(clientId, {
    res,
    index: 0,
    broadcasting: false,
    timeout: null
  });

  console.log(`Client connected: ${clientId}`);

  req.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    const client = clients.get(clientId);
    if (client?.timeout) clearTimeout(client.timeout);
    clients.delete(clientId);
  });
});

// Trigger the story
app.post('/start', (req, res) => {
  const clientId = req.body.id;
  if (!clientId || !clients.has(clientId)) {
    return res.status(400).json({ error: 'No client connected with this ID' });
  }

  const client = clients.get(clientId);
  if (client.broadcasting) {
    clearTimeout(client.timeout);
    client.index = 0;
  }

  client.broadcasting = true;

  function sendLine() {
    if (!clients.has(clientId)) return;

    const c = clients.get(clientId);
    if (!c.res) return;

    if (c.index < storyLines.length) {
      const line = storyLines[c.index++];
      c.res.write(`data: ${line}\n\n`);
      if (c.res.flush) c.res.flush();

      c.timeout = setTimeout(sendLine, 500);
    } else {
      c.res.end();
      clients.delete(clientId);
      console.log(`Finished streaming to client: ${clientId}`);
    }
  }

  sendLine();
  res.json({ status: 'started', clientId });
});

app.listen(PORT, () => {
  console.log(`✅ SSE server running on http://localhost:${PORT}`);
});
 