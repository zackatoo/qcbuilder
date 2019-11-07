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

	const toggleChildren = (elem) => { //if reusing func, add in targetclass as second param
		// function is used from multiple levels, and I always want to target the same tag
		let dropdown = elem.target.parentNode;
		while (!dropdown.classList.contains('dropdown')) { // classList is a DOMtokenlist, not array
			dropdown = dropdown.parentNode;
		}
		const items = dropdown.childNodes;
		console.log(items);

		const alreadyHidden = dropdown.lastChild.style.display === 'none';
		items.forEach(child => {
			if (child.nodeName === 'P') {
				// rotate triangle
				const triangle = child.lastChild;
				if (alreadyHidden) {
					triangle.style.transform = 'rotate(0deg)';
				} else {
					triangle.style.transform = 'rotate(90deg)';
				}
			} else {
				if (alreadyHidden) {
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
		label.style.setProperty('cursor', 'pointer');
		label.addEventListener('click', toggleChildren);
		bar.appendChild(label);

		//create triangle to show if open or closed
		const tri = document.createElement('img');
		tri.setAttribute('src', './images/triangle.png');
		label.appendChild(tri);
	
		dragbar.appendChild(bar);
		return bar;
	};

	//const gates = (await (await fetch('localhost:9001/gates')).json()).gates; // just for now, need to set up on real server

	const gates = [
		{"name": "Hadamard", "symbol": "H", "description": "desc", "matrix": "mat", "gate": undefined},
		{"name": "Pauli-Z", "symbol": "Z", "description": "desc", "matrix": "mat", "gate": undefined},
		{"name": "Pauli-Y", "symbol": "Y", "description": "desc\nription", "matrix": "mat", "gate": undefined}
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
			body.style.setProperty('cursor', 'pointer');
			body.classList.add('dragBody');
			
			const symbol = document.createElement('p');
			symbol.classList.add('gateSymbol');
			symbol.innerHTML = gate.symbol;
			body.appendChild(symbol);
			const name = document.createElement('p');
			name.classList.add('gateName');
			name.innerHTML = gate.name;
			body.appendChild(name);
	
			const ttc = document.createElement('div');
			ttc.classList.add('ttc');
			const desc = document.createElement('p');
			desc.classList.add('tooltip');
			desc.innerHTML = gate.description.replace('\n', '<br />'); 
			ttc.appendChild(desc);
			body.appendChild(ttc);
	
			//TODO: make gate draggable to canvas
	
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
    allCanvasWraps[id] = canvasWrap;

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
    // TODO: doesn't survive a window resize
    let ctx = allContexts[activeCanvas];
    let labels = ["|0⟩", "|-⟩", "|i⟩", "|1⟩", "|+⟩", "|-i⟩"];

    let onEnter = (index) => {
        updateCurrentCircuit()
        Render.drawStateSelector(ctx, pieSelector, index, labels, hitbox);
    };
    let onLeave = (index) => {
        updateCurrentCircuit()
        Render.drawStateSelector(ctx, pieSelector, -1, labels, hitbox);
    };
    let onClick = (index) => {
        allCircuits[activeCanvas].setInitalQubit(lineIndex, index);
        updateCurrentCircuit();
    };

    var pieSelector = new PieSelector(hitbox.midX, hitbox.midY, PACKAGE_SIZE + BOX_SIZE, labels.length, allCanvasWraps[activeCanvas], onEnter, onLeave, onClick);
    Render.drawStateSelector(ctx, pieSelector, -1, labels, hitbox);
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
