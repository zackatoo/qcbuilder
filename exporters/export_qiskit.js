// This file contains the code to export a circuit as python Qiskit code

class QiskitExporter
{
    constructor(quantumCircuit)
    {
        this.quantumCircuit = quantumCircuit;
    }

    getCode()
    {
        return "from qiskit import *\n\n" +
               "circ = QuantumCircuit(" + this.quantumCircuit.width + ", " + this.quantumCircuit.width + ")\n\n" + 
               this.writeCircuit(this.quantumCircuit) + this.writePost(this.quantumCircuit.width);
    }

    writeCircuit(circ)
    {
        let str = "";
        for (let i = 0; i < circ.width; i++)
        {
            str += this.writeLine(circ.lines[i]) + "\n";
        }
        return str;
    }

    writeLine(line)
    {
        let str = "";
        for (let i = 0; i < line.length; i++)
        {
            if (line.gates[i] != undefined)
            {
                str += this.writeGate(line.gates[i], line.index) + "\n";
            }
        }
        return str;
    }

    writeGate(gate, qubitIndex)
    {
        return "circ." + this.getQiskitGateName(gate.gate) + "(" + qubitIndex + ")";
    }

    getQiskitGateName(gateIndex)
    {
        switch(gateIndex)
        {
            case 1: return "h";
            case 2: return "x";
            case 3: return "y";
            case 4: return "z";
        }
    }

    writePost(width)
    {
        return "r = range(" + width + ")\n" +
               "circ.measure(r,r)\n" +
               "print(circ.draw())\n\n" +
               "sim = Aer.get_backend('qasm_simulator')\n" +
               "result = execute(circ, sim).result()\n" +
               "print('Measurement is:', result.get_counts(reg))";
    }
}