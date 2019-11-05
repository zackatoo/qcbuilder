// This file contains all the drawing functions for drawing on a canvas
"use strict";

function getRender() 
{
    return {
        drawGrid,
        drawStateSelector,
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

function drawStateSelector(context, pieSelector, selectedSector, labels, centerHitbox)
{
    // This draws a circular pie selector around a center hitbox (without drawing overtop of the hitbox)
    // The pie selector should completely encapsulate the hitbox
    // The hitbox may be of any width & height and the pie selector may have any number of slices >= 3

    context.font = "20px serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.beginPath();
    context.arc(pieSelector.x, pieSelector.y, pieSelector.radius, 0, Math.PI * 2, false);
    context.lineWidth = 2;
    context.stroke();
    context.lineWidth = 1;

    // Psi is the angle to the next corner of the center hitbox
    let psi = -Math.atan(centerHitbox.height / 2 / (centerHitbox.width / 2));
    let incr = 2 * Math.PI / pieSelector.numSlices;
    let hypot = pieSelector.radius / Math.cos(incr / 2);

    // Due to CSS context stacking messing with the zIndex, we need to start at -pi instead of zero
    let theta = -Math.PI;

    function getX(i, theta)
    {
        return (i % 2) ? pieSelector.x + centerHitbox.height / 2 * Math.tan(i * Math.PI / 2 - theta * (i - 2))
                       : pieSelector.x + centerHitbox.width / 2 * (i % 4 - 1);
    }

    function getY(i, theta)
    {
        return (i % 2) ? pieSelector.y + centerHitbox.height / 2 * (i - 2)
                       : pieSelector.y + centerHitbox.width / 2 * Math.tan(theta * (i % 4 - 1));
    }

    // This outer loop runs 5 times, one for each side of the center hitbox and then one last time to come back to zero
    for (let i = 0, sector = 0; i <= 4; i++)
    {
        psi = i * Math.PI - psi;
        let phi = psi - Math.PI;
        // Necessary error must be added in here because of how floating point computation rounds
        // Unless it is drawing a pie selector with over a hundred slices this error won't impact the drawing
        while (sector != pieSelector.numSlices && theta < phi)
        {
            // Fill in the slices
            context.beginPath();
            let x = getX(i, theta);
            let y = getY(i, theta);
            context.moveTo(x, y);
            if (theta + incr > phi)
            {
                context.lineTo(getX(i, phi), getY(i, phi));
                context.lineTo(getX(i + 1, theta + incr), getY(i + 1, theta + incr));
            }
            else
            {
                context.lineTo(getX(i, theta + incr), getY(i, theta + incr));
            }

            let circlePos = fromPolar(pieSelector.radius, theta);
            circlePos.x += pieSelector.x;
            circlePos.y += pieSelector.y;

            context.lineTo(pieSelector.radius * Math.cos(theta + incr) + pieSelector.x, pieSelector.radius * Math.sin(theta + incr) + pieSelector.y);
            let hypotPos = fromPolar(hypot, theta + incr / 2);
            context.arcTo(hypotPos.x + pieSelector.x, hypotPos.y + pieSelector.y, circlePos.x, circlePos.y, pieSelector.radius);
            context.lineTo(x, y);

            let isSelected = selectedSector == (sector + pieSelector.numSlices - 1) % pieSelector.numSlices;
            context.fillStyle = "rgba(206,206,206," + (isSelected ? 0.4 : 1) + ")";
            
            context.fill();

            // Draw the outline
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(circlePos.x, circlePos.y);
            context.stroke();

            // Draw the text
            context.fillStyle = "rgba(0,0,0," + (isSelected ? 0.4 : 1) + ")";
            let textPos = fromPolar(pieSelector.radius * 0.74, theta + incr / 2);
            context.fillText(labels[sector], textPos.x + pieSelector.x, textPos.y + pieSelector.y);

            theta += incr;
            sector++;
        }
    }

    context.strokeRect(centerHitbox.cornerX, centerHitbox.cornerY, centerHitbox.width, centerHitbox.height);
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

// UTILITY FUNCTIONS

function fromPolar(r, theta)
{
    return {x: r * Math.cos(theta), y: r * Math.sin(theta)};
}