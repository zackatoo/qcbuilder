// This files contains all of the quantum virtual machine simulation code
"use strict";

var rat = 1 / Math.sqrt(2);

class QuantumCircuit
{
    lines = [];
    hitboxes = [];
    initalRegister;
    finalRegister;
    width;

    constructor(width)
    {
        this.width = width;
        this.initalRegister = new QuReg(width);

        for (let i = 0; i < width; i++)
        {
            this.setInitalQubit(i, "0");
        }

        for (let i = 0; i < width; i++)
        {
            this.lines[i] = new QuantumLine("0");
        }
    }

    setInitalQubit(index, stateString)
    {
        switch(stateString)
        {
            case "0":  this.initalRegister.setQubit(index, [1, 0, 0, 0]); break;
            case "1":  this.initalRegister.setQubit(index, [0, 0, 1, 0]); break;
            case "+":  this.initalRegister.setQubit(index, [rat, 0, rat, 0]); break;
            case "-":  this.initalRegister.setQubit(index, [rat, 0, -rat, 0]); break;
            case "i":  this.initalRegister.setQubit(index, [rat, 0, 0, rat]); break;
            case "-i": this.initalRegister.setQubit(index, [rat, 0, 0, -rat]); break;
            default: console.log("Error (setInitalQubit) stateString does not match cases.");
        }
    }
}

const GATES = {
    init: 0,
    h: 1,
    x: 2,
    y: 3,
    z: 4
}

class QuantumLine
{
    gates = []; // list of all gates in the line, undefined is a 'blank gate'
    length = 1;

    constructor(initalQubitName)
    {
        this.gates[0] = new QuantumGate(0, GATES.init, "|" + initalQubitName + "⟩", "rgb(0, 255, 0)", 0);
    }
}

class QuantumGate
{
    index;  // index is the location of the quantum gate on the line
    gate;
    name;
    color;
    probability;
    hitbox;

    constructor(index, gate, name, color, probability, hitbox)
    {
        this.index = index;
        this.gate = gate;
        this.name = name;
        this.color = color;
        this.probability = probability;
        this.hitbox = hitbox;
    }
}

class QuReg
{
    // This quantum register class holds all the qubits that will be operated on
    qubits = [];

    constructor(width)
    {
        for (let i = 0; i < width; i++)
        {
            this.qubits[i] = new Qubit([1, 0, 0, 0]);
        }
    }

    setQubit(index, state)
    {
        this.qubits[index].setQubit(state);
    }
}

class Qubit
{
    alpha = new Complex(0, 0);
    beta = new Complex(0, 0);

    constructor(parameterArray)
    {
        this.alpha = new Complex(parameterArray[0], parameterArray[1]);
        this.beta = new Complex(parameterArray[2], parameterArray[3]);
    }

    setQubit(parameterArray)
    {
        // Can pass in an array of length 4 of all the parameters
        this.alpha.real = parameterArray[0];
        this.alpha.imag = parameterArray[1];
        this.beta.real = parameterArray[2];
        this.beta.imag = parameterArray[3];
    }

    getColor()
    {
        // Returns a CSS color string which represents the phase of the qubit.
        // Green is no phase shift, blue is positive, red is negative
        function rgbString(r, g, b)
        {
            return "rgb(" + r + "," + g + "," + b + ")";
        }
        function bound(x)
        {
            return Math.max(0, Math.ceil(x));
        }
        let denom = Math.sqrt(1 - Math.pow(alpha.real, 2));
        let sinphi = beta.imag / denom;
        let cosphi = beta.real / denom;

        return rgbString(bound(-255 * sinphi), bound(255 * Math.abs(cosphi)), bound(255 * sinphi));   
    }
}

class Complex
{
    real;
    imag;

    constructor(real, imag)
    {
        this.real = real;
        this.imag = imag;
    }

    addWith(otherComplex)
    {
        return new Complex(this.real + otherComplex.real, this.imag + otherComplex.imag);
    }

    multiplyWith(otherComplex)
    {
        return new Complex(
            this.real * otherComplex.real - this.imag * otherComplex.imag,
            this.real * otherComplex.imag + this.imag * otherComplex.real
        );
    }
}