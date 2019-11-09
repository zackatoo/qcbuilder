// This files contains all of the quantum virtual machine simulation code
"use strict";

// If we make Render a module we need to import it here too

var rat = 1 / Math.sqrt(2);

class QuantumCircuit
{
    constructor(width, canvasWrap)
    {
		this.lines = [];
        this.width = width;

        for (let i = 0; i < width; i++)
        {
            this.lines[i] = new QuantumLine(i, "0", canvasWrap);
        }
    }

    setInitalQubit(lineIndex, stateIndex)
    {
        this.lines[lineIndex].setInitalQubit(this.createParameterArray(stateIndex), this.createQubitName(stateIndex));
    }

    createParameterArray(stateIndex)
    {
        switch(stateIndex)
        {
            case 0: return [1, 0, 0, 0];        // |0⟩
            case 1: return [rat, 0, -rat, 0];   // |-⟩
            case 2: return [rat, 0, 0, rat];    // |i⟩
            case 3: return [0, 0, 1, 0];        // |1⟩
            case 4: return [rat, 0, rat, 0];    // |+⟩
            case 5: return [rat, 0, 0, -rat];   // |-i⟩
        }
    }

    createQubitName(stateIndex)
    {
        switch(stateIndex)
        {
            case 0: return "|0⟩";
            case 1: return "|-⟩";
            case 2: return "|i⟩";
            case 3: return "|1⟩";
            case 4: return "|+⟩";
            case 5: return "|-i⟩";
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
    constructor(index, initalQubitName, canvasWrap)
    {
		this.length = 1;
    	this.gates = []; // list of all gates in the line, undefined is a 'blank gate'
        this.index = index; // index is the location of the line in the circuit
        this.canvasWrap = canvasWrap;
        this.canHover = true;

        var initHitbox = new Hitbox(GATE_SPACE, GATE_SPACE * (index + 1), PACKAGE_SIZE, PACKAGE_SIZE, canvasWrap, true);
        this.gates[0] = new QuantumGate(0, GATES.init, "|" + initalQubitName + "⟩", new Qubit([1, 0, 0, 0]), 0, initHitbox);

        initHitbox.setOnMouseEnter( () =>
        {
            if (this.canHover)
            {
                this.gates[0].setTransparency(0.4);
                updateCurrentCircuit();
            }
        });

        initHitbox.setOnMouseLeave( () =>
        {
            if (this.canHover)
            {
                this.gates[0].setTransparency(1);
                updateCurrentCircuit();
            }
        });

        initHitbox.setOnClick( () => 
        {
            this.canHover = false;
            this.gates[0].setTransparency(1);
            updateCurrentCircuit();
            buildInitStateSelector(index, initHitbox, () => {this.canHover = true;});
        });

        initHitbox.div.style.cursor = "pointer";
    }

    setInitalQubit(parameterArray, name)
    {
        this.gates[0].setQubit(parameterArray);
        this.gates[0].name = name;
    }
}

class QuantumGate
{
    constructor(index, gate, name, inputQubit, probability, hitbox)
    {
        this.index = index; // index is the location of the quantum gate on the line
        this.gate = gate;
        this.name = name;
        this.probability = probability;
        this.hitbox = hitbox;

        this.applyGate(inputQubit);  // this.qubit gets set in here

        this.transparency = 1;
        this.setColor();
    }

    setQubit(parameterArray)
    {
        this.qubit.setQubit(parameterArray);
        this.setColor();
        this.probability = this.qubit.getProbability();
    }

    setColor()
    {
        // Returns a CSS color string which represents the phase of the qubit.
        // Green is no phase shift, blue is positive, red is negative
        function rgbString(r, g, b, a)
        {
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        }
        function bound(x)
        {
            return Math.max(0, Math.ceil(x));
        }
        
        // If the qubit is in the state |0> then just set the color to green (it won't be displayed anyways)
        // because we don't want the program to divide by zero
        if (this.qubit.alpha.real == 1) 
        {
            this.color = rgbString(0, 255, 0, this.transparency);
            return;
        }

        let denom = Math.sqrt(1 - Math.pow(this.qubit.alpha.real, 2));
        let sinphi = this.qubit.beta.imag / denom;
        let cosphi = this.qubit.beta.real / denom;

        this.color = rgbString(bound(-165 * sinphi) + 90, bound(165 * Math.abs(cosphi)) + 90, bound(255 * sinphi), this.transparency);  
    }

    setTransparency(newTransparency)
    {
        this.transparency = newTransparency;
        this.setColor();
    }

    applyGate(inputQubit)
    {
        switch (this.gate)  // This is the qubit state after the gate is applied to it
        {
            case GATES.init: this.qubit = inputQubit; break;
            case GATES.h: this.applyHGate(inputQubit); break;
        }
    }

    applyHGate(inputQubit)
    {
        this.qubit = inputQubit.clone();
        var top = this.qubit.alpha.multiplyWithReal(1 / rat);
        var bot = this.qubit.beta.multiplyWithReal(1 / rat);
        this.qubit.alpha = top.addWith(bot);
        this.qubit.beta = top.addWith(bot.neg());
    }
}

class Qubit
{
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

    clone()
    {
        return JSON.parse(JSON.stringify(this));
    }

    getProbability()
    {
        return 1 - Math.pow(this.alpha.real, 2);
    }
}

class Complex
{
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

    multiplyWithReal(otherReal)
    {
        return new Complex(this.real * otherReal, this.imag * otherReal);
    }

    neg()
    {
        return new Complex(-this.real, -this.imag);
    }

    getProbability()
    {
        return Math.abs();
    }
}
 