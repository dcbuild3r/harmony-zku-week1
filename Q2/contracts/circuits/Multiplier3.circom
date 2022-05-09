pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

// doesn't work in testing

// template Multiplier3 () {  
// 
//    // Declaration of signals.  
//    signal input a;  
//    signal input b;
//    signal input c;
//    signal output m;
//    signal output d;  
// 
//    // Constraints.  
//    m <== a * b;  
//    d <== m * c;
// }
// 
// component main = Multiplier3();

// from Circom documentation https://docs.circom.io/more-circuits/more-basic-circuits/

// reusable template to multiply 2 numbers
template Multiplier2(){

   //Declaration of signals
   signal input in1;
   signal input in2;
   signal output out;
   out <== in1 * in2;
}

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d;  

   // instantiate two multipliers
   component mult1 = Multiplier2();
   component mult2 = Multiplier2();

   // set inputs for mult1
   mult1.in1 <== a;
   mult1.in2 <== b;
   // set output of mult1 as input for mult2
   mult2.in1 <== mult1.out;
   // add c as the second input for mult2
   mult2.in2 <== c;

   // resulting assign to d and check
   d <== mult2.out;  
}

component main = Multiplier3();
