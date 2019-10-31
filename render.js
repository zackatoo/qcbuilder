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
        drawQuantumLine(context, circuit.lines[i]);
    }
}

function drawQuantumLine(context, line)
{
    var hitbox = line.gates[0].hitbox;
    var lineStarts = [];
    lineStarts[0] = hitbox.cornerX + hitbox.width;
    var lineEnds = [];
    var lineIndex = 0;

    for (let i = 0; i < line.length; i++)
    {
        if (line.gates[i] != undefined)
        {
            if (i != 0)
            {
                var thisHitbox = line.gates[i].hitbox;
                lineStarts[lineIndex + 1] = thisHitbox.cornerX + thisHitbox.width;
                lineEnds[i] = line.gates[i].hitbox.cornerX;
                lineIndex++;
            }
            drawQuantumGate(context, line.gates[i]);
        }
    }

    // Draws the black lines connecting each of the gates on the same quantum line
    context.beginPath();
    let i = 0;
    for (; i < lineEnds.length; i++)
    {
        context.moveTo(0.5 + lineStarts[i], 0.5 + hitbox.midY);
        context.lineTo(0.5+ lineEnds[i], 0.5 + hitbox.midY);
    }

    context.moveTo(0.5 + lineStarts[i], 0.5 + hitbox.midY);
    context.lineTo(context.canvas.width, 0.5 + hitbox.midY);
    context.stroke();
}

function drawQuantumGate(context, gate)
{
    var hitbox = gate.hitbox;
    var corner = hitbox.getCornerPosition();

    context.fillStyle = "rgba(255,255,255," + gate.transparency + ")";
    context.fillRect(corner.x, corner.y, hitbox.width, hitbox.height * (1 - gate.probability));
    context.fillStyle = gate.color;
    context.fillRect(corner.x, corner.y + hitbox.height * (1 - gate.probability), hitbox.width, hitbox.height * gate.probability);
    context.strokeRect(corner.x, corner.y, hitbox.width, hitbox.height);

    context.font = "30px serif";
    context.fillStyle = "rgba(0,0,0," + gate.transparency + ")";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(gate.name, hitbox.midX, hitbox.midY);
}