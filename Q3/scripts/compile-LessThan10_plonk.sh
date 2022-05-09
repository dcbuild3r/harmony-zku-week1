#!/bin/bash

cd contracts/circuits

mkdir LessThan10_plonk

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling LessThan10.circom..."

# compile circuit

circom LessThan10.circom --r1cs --wasm --sym -o LessThan10_plonk
snarkjs r1cs info LessThan10_plonk/LessThan10.r1cs

# Start a new zkey and make a contribution

snarkjs plonk setup LessThan10_plonk/LessThan10.r1cs powersOfTau28_hez_final_10.ptau LessThan10_plonk/circuit_final.zkey

# Skip contribution step as plonk has a universal setup

snarkjs zkey export verificationkey LessThan10_plonk/circuit_final.zkey LessThan10_plonk/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier LessThan10_plonk/circuit_final.zkey ../LessThan10Verifier_plonk.sol

cd ../..
