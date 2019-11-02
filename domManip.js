// This file contains all of the interaction between the webpage and the render & qvm modules
"use strict";

const Render = getRender();

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
	// A gate is taken in as a JSON object
	// It looks like:
	// {
	// 		"name": "Hadmard",
	// 		"symbol": "H",
	//		"description:": "DESC_HERE",
	//		"matrix": "Store matrix somehow if used (Image?)"
	//		"gate": function/class that is the gate (used when dragging and spawning)
	// }
	
    const dragbar = document.getElementById("dragbar");

	const toggleChildren = (elem) => {
		//TODO: make arrow on side to show if toggled
		const items = elem.target.parentNode.childNodes;
		console.log(items);

		items.forEach(child => {
			if (child.nodeName !== 'P') { //dont wanna remove label
				if (child.style.display === 'none') {
					// flex is initial display style
					child.style.display = 'flex';
				} else {
					child.style.display = 'none';
				}
			}
		});
	};

	const addDropdown = (name) => {
		const bar = document.createElement('div');
		bar.classList.add('dropdown');

		const label = document.createElement('p');
		label.innerHTML = name;
		label.classList.add('dropLabel');
		label.addEventListener('click', toggleChildren, bar);
	
		bar.appendChild(label);
		dragbar.appendChild(bar);
		return bar;
	};

	//const gates = (await (await fetch('localhost:9001/gates')).json()).gates; // just for now, need to set up on real server

	const gates = [
		{"name": "Hadamard", "symbol": "H", "description": "desc", "matrix": "mat", "gate": undefined},
		{"name": "Pauli-Z", "symbol": "Z", "description": "desc", "matrix": "mat", "gate": undefined},
		{"name": "Pauli-Y", "symbol": "Y", "description": "desc", "matrix": "mat", "gate": undefined}
	];

	// in future will be populated with more than just gates
	// ex: measurements, transforms, part of c-not and others
	const dropbaritems = [ //please come up with a better name
		{
			"name": "Gates",
			"items": gates
		},
		{ 
			"name": "Gates",
			"items": gates
		}
	];

	dropbaritems.forEach(dropdown => {
		const bar = addDropdown(dropdown.name);

		// add gates to div
		dropdown.items.forEach(gate => {
			const body = document.createElement('div');
			body.classList.add('dragBody');
			
			const symbol = document.createElement('p');
			symbol.classList.add('gateSymbol');
			symbol.innerHTML = gate.symbol;
			const name = document.createElement('p');
			name.classList.add('gateName');
			name.innerHTML = gate.name;
	
			//TODO: add mouseover evt listener for description and matrix
	
			//TODO: make gate draggable to canvas
	
			body.appendChild(symbol);
			body.appendChild(name);
	
			bar.appendChild(body);
		});
	});
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

function buildInitStateSelector(lineIndex)
{
    // TODO. Issue #5.
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
