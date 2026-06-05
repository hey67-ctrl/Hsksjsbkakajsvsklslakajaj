const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve all files from this folder
app.use(express.static(__dirname));

// Start server
app.listen(port, () => {
  console.log(`✅ Running on port ${port}`);
});

