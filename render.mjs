// This file contains all the drawing functions for drawing on a canvas
"use strict";

function getRender() 
{
    return {
        drawGrid,
        drawQuantumCircuit
    };
}

function drawGrid(context, color, width, height, increment)
{
    // Grid draw from https://stackoverflow.com/questions/11735856/draw-grid-table-on-canvas-html5
    context.beginPath();
    for (let x = 0; x <= width; x += increment)
    {
        context.moveTo(0.5 + x, 0);
        context.lineTo(0.5 + x, height);
    }

    for (let y = 0; y <= height; y += increment)
    {
        context.moveTo(0, 0.5 + y);
        context.lineTo(width, 0.5 + y);
    }
    context.strokeStyle = color;
    context.stroke();
}

function drawQuantumCircuit(context, circuit)
{
    for (let i = 0; i < circuit.width; i++)
    {
        drawQuantumLine(context, circuit.lines[i], {y: GATE_SPACE * (i + 1)});
    }
}

function drawQuantumLine(context, line, startPos)
{
    var lineStarts = [];
    lineStarts[0] = startPos.x + PACKAGE_SIZE / 2;
    var lineEnds = [];
    for (let i = 0; i < line.length; i++)
    {
        startPos.x = GATE_SPACE * line.gates[i].index + GATE_SPACE;
        lineStarts[i + 1] = startPos.x + PACKAGE_SIZE / 2;
        lineEnds[i] = startPos.x - PACKAGE_SIZE / 2;
        drawQuantumGate(context, line.gates[i], startPos);
    }

    context.beginPath();
    let i = 0;
    for (; i < lineEnds.length; i++)
    {
        context.moveTo(0.5 + lineStarts[i], 0.5 + startPos.y);
        context.lineTo(0.5+ lineEnds[i], 0.5 + startPos.y);
    }

    context.moveTo(0.5 + lineStarts[i], 0.5 + startPos.y);
    context.lineTo(context.canvas.width, 0.5 + startPos.y);
    context.stroke();
}

function drawQuantumGate(context, gate, pos)
{
    var corner = pair(pos.x - PACKAGE_SIZE / 2, pos.y - PACKAGE_SIZE / 2);
    context.fillStyle = "#ffffff";
    context.fillRect(corner.x, corner.y, PACKAGE_SIZE, PACKAGE_SIZE * (1 - gate.probability));
    context.fillStyle = gate.color;
    context.fillRect(corner.x, corner.y + PACKAGE_SIZE * (1 - gate.probability), PACKAGE_SIZE, PACKAGE_SIZE * gate.probability);
    context.strokeRect(corner.x, corner.y, PACKAGE_SIZE, PACKAGE_SIZE);
    context.font = "30px serif";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(gate.name, pos.x, pos.y);
}

function pair(x, y)
{
    return {x: x, y: y};
}