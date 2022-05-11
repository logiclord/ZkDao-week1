const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

describe("HelloWorld", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] Add comments to explain what each line is doing

    // Generating the Proof for the a=1 and b=2 inputs for HelloWorld circuit using the wasm and the zkey.
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    // Printing the output of the circuit to console.
    console.log("1x2 =", publicSignals[0]);

    // Converting output from string to BigInt
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    // Converting strings numbers within the proofs from string to BigInt
    const editedProof = unstringifyBigInts(proof);
    // Encode proof and public signals (output in this case) to Solidity call data
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    // Converting strings numbers within the call from string to BigInt
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    // split a input from call data
    const a = [argv[0], argv[1]];
    // split b input from call data
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    // split c input from call data
    const c = [argv[6], argv[7]];

    // Get 8th element in arv array
    const Input = argv.slice(8);

    // Call verifier to verify that the proof is valid.
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with Groth16", function () {
  let Multiplier3Verifier;
  let multiplier3Verifier;

  beforeEach(async function () {
    Multiplier3Verifier = await ethers.getContractFactory(
      "Multiplier3Verifier"
    );
    multiplier3Verifier = await Multiplier3Verifier.deploy();
    await multiplier3Verifier.deployed();
    //[assignment] insert your script here
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2", c: "5" },
      "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3/circuit_final.zkey"
    );

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];

    const Input = argv.slice(8);

    expect(await multiplier3Verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await multiplier3Verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with PLONK", function () {
  let Multiplier3PlonkVerifier;
  let multiplier3PlonkVerifier;

  beforeEach(async function () {
    Multiplier3PlonkVerifier = await ethers.getContractFactory("PlonkVerifier");
    multiplier3PlonkVerifier = await Multiplier3PlonkVerifier.deploy();
    await multiplier3PlonkVerifier.deployed();
    //[assignment] insert your script here
  });

  it("Should return true for correct proof", async function () {
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1", b: "2", c: "5" },
      "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
    );

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await plonk.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );
    const argv = calldata.replace(/["[\]\s]/g, "").split(",");
    const Input = argv.slice(1);

    // Call verifier to verify that the proof is valid.
    expect(await multiplier3PlonkVerifier.verifyProof(argv[0], Input)).to.be
      .true;
  });
  it("Should return false for invalid proof", async function () {
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1", b: "2", c: "5" },
      "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
    );

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await plonk.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );
    const argv = calldata.replace(/["[\]\s]/g, "").split(",");
    // Changing the value of public signals from 10 to 0.
    expect(await multiplier3PlonkVerifier.verifyProof(argv[0], ["0x0"])).to.be
      .false;
  });
});
