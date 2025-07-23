const express = require('express');
const path = require('path');
const app = express();

let failedAttempts = {};
const ATTEMPT_LIMIT = 3;
const BLOCK_TIME_MS = 60 * 1000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const currentTime = Date.now();
  const userData = failedAttempts[username] || { count: 0, lastFail: 0, blockedUntil: 0 };

  if (userData.blockedUntil && currentTime < userData.blockedUntil) {
    return res.status(403).json({ message: 'Account temporarily locked. Try again later.' });
  }

  if (username === 'admin' && password === 'secure123') {
    failedAttempts[username] = { count: 0, lastFail: 0, blockedUntil: 0 };
    return res.json({ success: true, message: 'Login successful!' });
  } else {
    userData.count++;
    userData.lastFail = currentTime;

    if (userData.count >= ATTEMPT_LIMIT) {
      userData.blockedUntil = currentTime + BLOCK_TIME_MS;
    }

    failedAttempts[username] = userData;
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`SecureLogin running at http://localhost:${PORT}`));