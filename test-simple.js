// Ultra simple test
console.log('1. Starting...');

const express = require('express');
console.log('2. Express loaded');

const app = express();
console.log('3. App created');

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
console.log('4. Route added');

app.listen(4000, () => {
  console.log('5. ✅ Server running on port 4000');
});
console.log('6. Listen called');
