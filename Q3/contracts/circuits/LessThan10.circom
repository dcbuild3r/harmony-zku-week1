pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template LessThan10() {
    signal input in;
    signal output out;

    // LessThan(n), n is the bitsize of input in
    component lt = LessThan(32); 

    // in[0] will have the item we want to compare against in[1], 10 in our case
    lt.in[0] <== in;
    lt.in[1] <== 10;

    // in[1] we then take the output of the LessThan() circuit and output it in LessThan10(). 0 - False, 1 - True
    out <== lt.out;
}

component main = LessThan10();
