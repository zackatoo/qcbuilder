// This file contains all of the interaction between the webpage and the render & qvm modules
"use strict";

const Render = getRender();

const STATE_LABELS = ["|-i⟩", "|0⟩", "|-⟩", "|i⟩", "|1⟩", "|+⟩"];

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
    //      "id": 0,
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

	const singleQubitGates = [
        {"name": "Hadamard", "id": 1, "symbol": "H", "description": "Simple superposition gate.", "matrix": "mat", "gate": undefined},
        {"name": "Pauli-X", "id": 2, "symbol": "X", "description": "NOT gate.", "matrix": "mat", "gate": undefined},
        {"name": "Pauli-Y", "id": 3, "symbol": "Y", "description": "NOT & Phase flip gate.", "matrix": "mat", "gate": undefined},
		{"name": "Pauli-Z", "id": 4, "symbol": "Z", "description": "Phase flip gate.", "matrix": "mat", "gate": undefined}
    ];
    const multiQubitGates = [
        {"name": "C-Not", "id": 5, "symbol": "⊕", "description": "Work In Progress", "matrix": "mat", "gate": undefined},
		{"name": "SWAP", "id": 6, "symbol": "✖", "description": "Work In Progress", "matrix": "mat", "gate": undefined},
    ];

	// in future will be populated with more than just gates
	// ex: measurements, transforms, part of c-not and others
	const dropbaritems = [ //please come up with a better name
		{
			"name": "Single Qubit Gates",
			"items": singleQubitGates
		},
		{ 
			"name": "Multi Qubit Gates",
			"items": multiQubitGates
		}
	];

	dropbaritems.forEach(dropdown => {
		const bar = addDropdown(dropdown.name);

		// add gates to div
		dropdown.items.forEach(gate => {
			const dragBody = document.createElement('div');
			dragBody.style.setProperty('cursor', 'pointer');
			dragBody.classList.add('dragBody');
			
			const symbol = document.createElement('p');
			symbol.classList.add('gateSymbol');
			symbol.innerHTML = gate.symbol;
			dragBody.appendChild(symbol);
			const name = document.createElement('p');
			name.classList.add('gateName');
			name.innerHTML = gate.name;
			dragBody.appendChild(name);
	
			const ttc = document.createElement('div');
			ttc.classList.add('ttc');
			const desc = document.createElement('p');
			desc.classList.add('tooltip');
			desc.innerHTML = gate.description.replace('\n', '<br />'); 
			ttc.appendChild(desc);
			dragBody.appendChild(ttc);
	
            //TODO: make gate draggable to canvas
            dragBody.onmousedown = (event) => {
                let dragGate = document.createElement('div');
                dragGate.style.width = PACKAGE_SIZE + "px";
                dragGate.style.height = PACKAGE_SIZE + "px";
                dragGate.style.left = (event.clientX - PACKAGE_SIZE / 2) + "px";
                dragGate.style.top = (event.clientY - PACKAGE_SIZE / 2) + "px";
                let symbolClone = symbol.cloneNode(true);
                symbolClone.style.fontWeight = "normal";
                symbolClone.style.marginTop = (PACKAGE_SIZE / 10) + "px";
                dragGate.appendChild(symbolClone);
                dragGate.classList.add('dragGate');

                let mouseMove = (event) => {
                    let canviBounds = document.getElementById("canvi").getBoundingClientRect();
                    const yOffset = (allCircuits[activeCanvas].width + 1) * PACKAGE_SIZE * 2;

                    if (event.clientX > canviBounds.left + 3 * PACKAGE_SIZE 
                     && event.clientY > canviBounds.top + PACKAGE_SIZE 
                     && event.clientY < canviBounds.top + PACKAGE_SIZE + yOffset)
                    {
                        // 'Sticky' dragging tries to snap the gate into a position on the circuit
                        let diffX = Math.round((event.clientX - canviBounds.left) / PACKAGE_SIZE) * PACKAGE_SIZE;
                        let diffY = Math.round((event.clientY - canviBounds.top) / (PACKAGE_SIZE * 2)) * PACKAGE_SIZE * 2;
                        dragGate.style.left = (diffX + canviBounds.left - PACKAGE_SIZE / 2) + "px";
                        dragGate.style.top = (diffY + canviBounds.top - PACKAGE_SIZE / 2) + "px";
                    }
                    else
                    {
                        // Allow smooth dragging when outside the circuit
                        dragGate.style.left = (event.clientX - PACKAGE_SIZE / 2) + "px";
                        dragGate.style.top = (event.clientY - PACKAGE_SIZE / 2) + "px";
                    }
                };
                let mouseUp = (event) => {
                    let canviBounds = document.getElementById("canvi").getBoundingClientRect();
                    const yOffset = (allCircuits[activeCanvas].width + 1) * PACKAGE_SIZE * 2;

                    body.removeEventListener('mousemove', mouseMove);
                    body.removeEventListener('mouseup', mouseUp);
                    body.removeChild(dragGate);

                    if (event.clientX > canviBounds.left + 3 * PACKAGE_SIZE 
                        && event.clientY > canviBounds.top + PACKAGE_SIZE 
                        && event.clientY < canviBounds.top + PACKAGE_SIZE + yOffset)
                    {
                        // Place the gate into the circuit where it belongs
                        let lineIndex = Math.round((event.clientY - canviBounds.top) / (PACKAGE_SIZE * 2)) - 1;
                        let gateIndex = Math.round((event.clientX - canviBounds.left) / PACKAGE_SIZE) - 3;
                        allCircuits[activeCanvas].insertGate(lineIndex, gateIndex, gate.id, gate.symbol);
                        updateCurrentCircuit();
                    }
                }

                body.addEventListener('mousemove', mouseMove);
                body.addEventListener('mouseup', mouseUp);
                body.append(dragGate);
            };
	
			bar.appendChild(dragBody);
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

    canvas.onclick = () => {
        if (activeStateSelector != undefined)
        {
            activeStateSelector.selector.deleteSelf();
            activeStateSelector = undefined;
            updateCurrentCircuit();
        }
    };

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
    if (activeStateSelector != undefined)
    {
        Render.drawStateSelector(ctx, activeStateSelector.selector, -1, STATE_LABELS, activeStateSelector.hbox);
    }
}

var activeStateSelector;
function buildInitStateSelector(lineIndex, hitbox, onDelete)
{
    if (activeStateSelector != undefined)
    {
        activeStateSelector.selector.deleteSelf();
        activeStateSelector = undefined;
        updateCurrentCircuit();
    }

    let ctx = allContexts[activeCanvas];
    let wrap = allCanvasWraps[activeCanvas];

    let onEnter = (index) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Render.drawQuantumCircuit(ctx, allCircuits[activeCanvas]);
        Render.drawStateSelector(ctx, pieSelector, index, STATE_LABELS, hitbox);
    };
    let onLeave = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Render.drawQuantumCircuit(ctx, allCircuits[activeCanvas]);
        Render.drawStateSelector(ctx, pieSelector, -1, STATE_LABELS, hitbox);
    };
    let onClick = (index) => {
        activeStateSelector = undefined;
        allCircuits[activeCanvas].setInitalQubit(lineIndex, index);
        pieSelector.deleteSelf();
        updateCurrentCircuit();
    };

    var pieSelector = new PieSelector(hitbox.midX, hitbox.midY, PACKAGE_SIZE + BOX_SIZE, STATE_LABELS.length, wrap, onEnter, onLeave, onClick);
    pieSelector.setOnDelete(onDelete);
    activeStateSelector = {selector: pieSelector, hbox: hitbox};
    Render.drawStateSelector(ctx, pieSelector, -1, STATE_LABELS, hitbox);
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
