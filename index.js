const express = require("express");
let { ReclaimClient } = require("@reclaimprotocol/zk-fetch");
let { Reclaim } = require("@reclaimprotocol/js-sdk");
const dotenv = require("dotenv");
let mutation_result = require("./mutation.json");

dotenv.config();

const reclaimClient = new ReclaimClient(
  process.env.APP_ID,
  process.env.APP_SECRET,
  true
);

const app = express();
const port = 7787;

async function generateProof(url) {
  try {
    const proof = await reclaimClient.zkFetch(
      url,
      {
        method: "GET",
      },
      3,
      5000
    );

    if (!proof) {
      return {
        success: false,
        error: "Failed to generate proof",
      };
    }

    const isValid = await Reclaim.verifySignedProof(proof);
    if (!isValid) {
      return {
        success: false,
        error: "Proof is invalid",
      };
    }

    // const proofData = await Reclaim.transformForOnchain(proof);

    return {
      success: true,
      data: proof,
    };
  } catch (err) {
    console.log(err);

    return {
      success: false,
      error: err.message,
    };
  }
}

app.post("/generateTransferProof", async (req, res) => {
  try {
    const result = await generateProof(
      `https://mock.blocknaut.xyz/api/v2/mutation`
    );

    if (!result.success) {
      console.log(result);
      return res.status(400).send(result.error);
    }

    return res.status(200).json(result.data);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

app.get("/api/v2/mutation", (req, res) => {
  if (req.query.result == "error") {
    return res.status(401).send({ error: "No Authorization" });
  } else if (req.query.result == "notfound") {
    return res.send({ data: [] });
  } else if (req.query.id != undefined) {
    let item = {};

    function search(value, index, array) {
      if (value.id == req.query.id) {
        item = value;
      }
    }

    mutation_result.data.forEach(search);
    res.send({ data: [item] });
  }

  return res.send(mutation_result);
});

app.listen(port, () => {
  console.log(`Mock API listening on port ${port}`);
});
