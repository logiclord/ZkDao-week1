const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegex = /contract Verifier/;

function bumpSolidityVersion(filepath, verifier) {
  let content = fs.readFileSync(filepath, {
    encoding: "utf-8",
  });
  let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0");
  bumped = bumped.replace(verifierRegex, "contract " + verifier);

  fs.writeFileSync(filepath, bumped);
}

bumpSolidityVersion("./contracts/HelloWorldVerifier.sol", "HelloWorldVerifier");
bumpSolidityVersion(
  "./contracts/Multiplier3Verifier.sol",
  "Multiplier3Verifier"
);
bumpSolidityVersion(
  "./contracts/Multiplier3Verifier_plonk.sol",
  "PlonkVerifier"
);

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment
