const express = require("express");
let mutation_result = require("./mutation.json");

const app = express();
const port = 7787;

app.get("/api/v2/mutation", (req, res) => {
  if (req.query.result == "error") {
    return res.status(401).send({ error: "No Authorization" });
  } else if (req.query.result == "notfound") {
    return res.send({ data: [] });
  }

  return res.send(mutation_result);
});

app.listen(port, () => {
  console.log(`Mock API listening on port ${port}`);
});
