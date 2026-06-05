const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // ONLY USE 8080

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log("Running on port", PORT);
});
