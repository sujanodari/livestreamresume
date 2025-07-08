# 🧠 Why I Used Server-Sent Events Instead of WebSockets in My Real-Time Project

**By Sujan Odari**

---

## 🛰️ Let’s talk about real-time on the web.

When you hear the phrase *“real-time updates”*, your mind probably jumps straight to **WebSockets**. And for good reason — they’re powerful, bi-directional, and widely supported.

But here’s the thing: **you don’t always need WebSockets**.

In fact, in many real-world scenarios, especially when data flows in one direction (server → client), **Server-Sent Events (SSE)** can be a better, simpler, and more lightweight alternative.

Recently, I built a small project that involved real-time streaming. I wanted to stream content line by line — like a live, animated resume experience — and instead of setting up WebSockets, I used SSE.

And it worked perfectly.

---

## 🧩 What is Server-Sent Events?

**SSE** is a browser-native feature that lets the **server push messages to the client over a single, long-lived HTTP connection**.

Unlike WebSockets:
- It’s one-way (server → client)
- It uses regular HTTP
- It’s super easy to implement
- It automatically reconnects if the connection drops

You don’t need any third-party libraries — just `EventSource` in the browser and a properly set-up route on the server.

### Example (Browser Side)
```js
const evtSource = new EventSource('/stream');
evtSource.onmessage = (event) => {
  console.log('New data from server:', event.data);
};
```

### Server (Node.js + Express)
```js
app.get('/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write(`data: Hello, world!\n\n`);
});
```

That’s it. No handshakes. No socket server. Just works.

---

## ⚡ A Quick Real-World Example: Streaming My Resume

Let me walk you through the project I mentioned earlier.

I wanted to create an interactive developer portfolio — something a bit more engaging than the usual PDF or static HTML. So, I thought:

> “What if I could stream my resume to the user… one line at a time… like ChatGPT responding to a prompt?”

So that’s what I built.

My resume was stored as an array of Markdown strings:

```js
const storyLines = [
  '# 📄 Sujan Odari — Senior Software Engineer',
  '**Location:** Kathmandu, Nepal',
  '**Email:** odarisujan@gmail.com',
  '## Experience',
  '6+ years building full-stack apps...',
  // etc.
];
```

Then, I set up a `/stream` endpoint that sends one line at a time every few hundred milliseconds:

```js
let index = 0;
function sendLine() {
  if (index < storyLines.length) {
    res.write(`data: ${storyLines[index++]}\n\n`);
    setTimeout(sendLine, 400);
  } else {
    res.end();
  }
}
```

On the frontend, I used `marked.js` to render the Markdown and added a typing animation.

### Why SSE was perfect for this:
- I didn’t need two-way communication
- I wanted the server to control the timing
- I wanted simplicity, not socket overhead
- SSE gave me automatic reconnection and browser support out of the box

If I had gone with WebSockets, it would have meant writing more boilerplate for no added benefit.

---

## 🔄 SSE vs WebSockets — When to Use What

| Feature              | SSE                         | WebSockets                   |
|----------------------|-----------------------------|------------------------------|
| Direction            | Server → Client only        | Bi-directional               |
| Browser Support      | Native via `EventSource`    | Needs JS socket code         |
| Reconnection         | Built-in                    | Manual heartbeat logic       |
| Protocol             | HTTP                        | TCP-based                    |
| Use Case             | Feeds, logs, dashboards     | Games, chats, live tools     |

---

## ✅ When to Use SSE

Go with **SSE** if:

- Your server is pushing updates to clients
- You don’t need to receive messages from the client
- You want fewer moving parts (no separate WebSocket server)
- You’re building things like:
  - Real-time dashboards
  - Live notifications
  - Event logs
  - Progressive storytelling / resumes 😉

---

## 🚫 When to Avoid SSE

SSE might not be your best bet if:

- You need **two-way** messaging (like chat or multiplayer games)
- You need to send **binary data** (SSE only supports UTF-8 text)
- Your target audience is using older browsers (e.g., IE11 — which hopefully they’re not)

In those cases, use WebSockets or even WebRTC.

---

## 🧠 Final Thoughts

**SSE is underrated.**

It’s simple, efficient, and works right out of the box for a surprising number of real-time use cases. For me, it was the perfect tool for building a creative, animated resume stream — but it’s just as useful for live logs, data feeds, and more.

Before you reach for WebSockets, pause and ask:

> “Do I *really* need two-way communication?”

If not, **SSE might just be the smarter move**.

---

**About the Author**  
I’m Sujan Odari — a Senior Software Engineer from Kathmandu, Nepal. I build real-world apps powered by Node.js, React, and machine intelligence for U.S. and European companies.  
🔗 [linkedin.com/in/sujan-odari](https://linkedin.com/in/sujan-odari-532ba9152)
