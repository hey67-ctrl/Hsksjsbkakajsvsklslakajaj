const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // 8080 ONLY — WORKS 100%

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log("🔥 RUNNING ON PORT", PORT);
});
