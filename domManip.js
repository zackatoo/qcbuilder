// This file contains all of the interaction between the webpage and the render & qvm modules
"use strict";

const Render = getRender();
//const QVM = getQVM();

var allCanvasElements = [];
var allCanvasWraps = [];
var allContexts = [];
var allCircuits = [];
var activeCanvas = 0;

var body;
var baseCanvas;

const BOX_SIZE = Math.floor(screen.height / 100);
const PACKAGE_SIZE = BOX_SIZE * 5;
const GATE_SPACE = PACKAGE_SIZE * 2;

window.onload = function ()
{
    // this is called when body is loaded. It initilizes all of the elements needed to run the app.
    body = document.getElementsByTagName("body")[0];
    if (!buildCanvas()) return;
    buildDragbar();
    buildBaseCanvas();
    window.addEventListener("resize", () => {
        // The grid gets funky when the window resizes so this will draw a new smooth grid.
        resizeActiveCanvas();
        resizeBaseCanvas();
    });
}

function buildDragbar()
{
    var dragbar = document.getElementById("dragbar");
}

function buildCanvas()
{
    // Builds a new canvas to build a circuit in, then insert into the document
    var canvi = document.getElementById("canvi");

    // Since we cannot place things directly into a canvas we need a wrapper to hold both the canvas 
    // and all of it's hitboxes
    var canvasWrap = document.createElement("div");
    canvasWrap.className = "canvaswrap";

    var canvas = document.createElement("canvas");
    if (!canvas.getContext) return unsupported();

    var id = allCanvasElements.length;
    canvas.id = "canvas-" + id;
    canvas.className = "canvas";
    var ctx = canvas.getContext("2d");
    allCanvasElements[id] = canvas;
    allContexts[id] = ctx;

    canvi.append(canvasWrap);
    canvasWrap.append(canvas);

    allCircuits[id] = new QuantumCircuit(2, canvasWrap);

    resizeActiveCanvas();
    return true;
}

function resizeActiveCanvas()
{
    var canvas = allCanvasElements[activeCanvas];
    canvas.width = canvi.offsetWidth;
    canvas.height = canvi.offsetHeight;

    updateCurrentCircuit();
}

function buildBaseCanvas()
{
    baseCanvas = document.getElementById("canvas-base");
    resizeBaseCanvas();
}

function resizeBaseCanvas()
{
    var ctx = baseCanvas.getContext("2d");
    baseCanvas.width = canvi.offsetWidth;
    baseCanvas.height = canvi.offsetHeight;

    Render.drawGrid(ctx, "#eaeaea", baseCanvas.width, baseCanvas.height, BOX_SIZE);
    Render.drawGrid(ctx, "#bababa", baseCanvas.width, baseCanvas.height, PACKAGE_SIZE);
}

function updateCurrentCircuit()
{
    var ctx = allContexts[activeCanvas];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    Render.drawQuantumCircuit(ctx, allCircuits[activeCanvas]);
}

function buildInitStateSelector(lineIndex, hitbox)
{
    // TODO. Issue #5.
    var pieSelector = new PieSelector(hitbox.midX, hitbox.midY, PACKAGE_SIZE, 6);
}

function unsupported()
{
    // User's browser is not up-to-date so we shut down the webapp.
    activeCanvas = -1;
    var unsupportedDiv = document.createElement("div");
    unsupportedDiv.id = "unsupported";
    unsupportedDiv.innerHTML = "Your browser does not support this website. Please update to a newer version.";
    body.append(unsupportedDiv);
    return false;
}
