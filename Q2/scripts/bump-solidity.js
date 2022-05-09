const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

const verifierRegex = /contract (Plonk)?Verifier/;

function bump(file, contract) {
  let content = fs.readFileSync(file, {
    encoding: "utf-8",
  });
  let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0");
  bumped = bumped.replace(verifierRegex, `contract ${contract}`);

  fs.writeFileSync(file, bumped);
}

bump("./contracts/HelloWorldVerifier.sol", "HelloWorldVerifier");
bump("./contracts/Multiplier3Verifier.sol", "Multiplier3Verifier");
bump("./contracts/Multiplier3Verifier_plonk.sol", "Multiplier3VerifierPlonk");
