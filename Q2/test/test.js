const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk} = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
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
        // create the proof using 1, and 2 for the parameters a, b
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // log the output of the circuit - 1x2 in our case
        console.log('1x2 =',publicSignals[0]);

        // convert strings into BigInts
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // create calldata for Groth16 Solidity verifier
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        // format arguments correctly and put them into a list as a string
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // decompose array into separate arguments
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);


        // call the verifyProof function with the parameters generated and see whether it does indeed equal to the same output as in the circuit
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    // test invalid input
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // create the proof using 1, 2 and 3 for the parameters a, b, c
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        // log the output of the circuit - 1x2x3 in our case
        console.log('1x2x3 =', publicSignals[0]);

        // convert strings into BigInts
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // create calldata for Groth16 Solidity verifier
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        // format arguments correctly and put them into a list as a string
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // decompose array into separate arguments
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);


        // call the verifyProof function with the parameters generated and see whether it does indeed equal to the same output as in the circuit
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    // test invalid input
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0];
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });

});


describe("Multiplier3 with PLONK", function () {

    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3VerifierPlonk");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // create the proof using 1, 2 and 3 for the parameters a, b, c
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");

        // log the output of the circuit - 1x2x3 in our case
        console.log('1x2x3 =', publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        
        // https://github.com/iden3/snarkjs/blob/master/src/plonk_exportsoliditycalldata.js
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        const [proofCalldata, inputsCalldata] = calldata.split(",");
        const argv = inputsCalldata.replace(/["[\]\s]/g, "").split(",").map((x) => BigInt(x).toString());
        
        // call the verifyProof function with the parameters generated and see whether it does indeed equal to the same output as in the circuit
        expect(await verifier.verifyProof(proofCalldata, argv)).to.be.true;

    });

    // test invalid input
    it("Should return false for invalid proof", async function () {
    
        expect(await verifier.verifyProof(0, [0])).to.be.false;
    });

});
