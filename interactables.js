// This file contains all the code for the user interactions with the elements of the canvases
"use strict";

class Hitbox
{
    constructor(x, y, width, height, parent, middle)
    {
        if (middle != undefined && middle)
        {
            this.cornerX = x - width / 2; // Position of the top left corner
            this.cornerY = y - height / 2;
            this.midX = x; // Position of the middle of the hitbox
            this.midY = y;
        }
        else
        {
            this.cornerX = x;
            this.cornerY = y;
            this.midX = x + width / 2;
            this.midY = y + height / 2;
        }

        this.width = width;
        this.height = height;
        this.canHover = true;
        this.parent = parent;

        if (parent == undefined) return;

        this.div = document.createElement("div");
        let style = this.div.style;
        style.position = "absolute";
        style.width = width + "px";
        style.height = height + "px";
        style.left = this.cornerX + "px";
        style.top = this.cornerY + "px";
        style.zIndex = 10;

        parent.append(this.div); // The dom element 
    }

    setOnMouseEnter(onMouseEnter)
    {
        this.div.onmouseenter = onMouseEnter;
    }

    setOnMouseLeave(onMouseLeave)
    {
        this.div.onmouseleave = onMouseLeave;
    }

    setOnMouseDown(onMouseDown)
    {
        this.div.onmousedown = onMouseDown;
    }

    setOnMouseUp(onMouseUp)
    {
        this.div.onmouseup = onMouseUp;
    }

    setOnClick(onClick)
    {
        this.div.onclick = onClick;
    }

    setZIndex(zIndex)
    {
        this.div.style.zIndex = zIndex;
    }

    setCornerPosition(x, y)
    {
        this.cornerX = x;
        this.cornerY = y;
        this.midX = x + this.width / 2;
        this.midY = y + this.height / 2;

        this.div.style.left = this.cornerX + "px";
        this.div.style.top = this.cornerY + "px";
    }

    setMiddlePosition(x, y)
    {
        this.cornerX = x - this.width / 2;
        this.cornerY = y - this.height / 2;
        this.midX = x;
        this.midY = y;

        this.div.style.left = this.cornerX + "px";
        this.div.style.top = this.cornerY + "px";
    }

    getCornerPosition()
    {
        return {x: this.cornerX, y: this.cornerY};
    }

    getMidPosition()
    {
        return {x: this.midX, y: this.midY};
    }

    deleteSelf()
    {
        this.parent.removeChild(this.div);
    }
}

class PieSelector
{
    // Adapted from https://stackoverflow.com/questions/11487557/how-can-i-make-a-circular-sector-using-css
    // The onhover and onclick events 
    constructor(x, y, radius, numSlices, parent, onEnter, onLeave, onClick)
    {
        this.x = x; // Coordniates of middle of the circle
        this.y = y;
        this.radius = radius;
        this.numSlices = numSlices; // Due to how this works the number of slices must be between [4, 8] inclusive
        this.parent = parent;

        this.selector = document.createElement("div");
        this.selector.style.borderRadius = "50%";
        this.selector.style.overflow = "hidden";
        this.selector.style.position = "absolute";
        this.selector.style.left = (x - radius) + "px";
        this.selector.style.top = (y - radius) + "px";
        this.selector.style.width = (radius * 2) + "px";
        this.selector.style.height = (radius * 2) + "px";

        let lastWrapper = document.createElement("div");
        let theta = 360 / numSlices;
        

        function applyStyle(element)
        {
            element.style.overflow = "hidden";
            element.style.position = "absolute";
            element.style.width = radius + "px";
            element.style.height = radius + "px";
            element.style.transformOrigin = "100% 100%";
        }

        for (let i = 0; i < numSlices; i++)
        {
            let slice = document.createElement("div");
            applyStyle(slice);
            slice.style.zIndex = i + 1;

            slice.onmouseenter = () => {
                onEnter(i);
            };
            slice.onmouseleave = () => {
                onLeave(i);
            };
            slice.onclick = () => {
                onClick(i);
            };
           
            let angle = (i != numSlices - 1) ? (i + 1) * theta : theta - 90;
            slice.style.transform = "rotate(" + angle + "deg)";

            (i != numSlices - 1 ? this.selector : lastWrapper).append(slice);
        }
        this.selector.append(lastWrapper);
        applyStyle(lastWrapper);
        parent.append(this.selector);
    }

    setOnDelete(onDelete)
    {
        this.onDelete = onDelete;
    }

    deleteSelf()
    {
        this.onDelete();
        this.parent.removeChild(this.selector);
    }
}

class DraggableGate
{
    constructor(x, y, parent, gate, symbol)
    {
        let dragGate = document.createElement('div');
        dragGate.style.width = PACKAGE_SIZE + "px";
        dragGate.style.height = PACKAGE_SIZE + "px";
        dragGate.style.left = (x - PACKAGE_SIZE / 2) + "px";
        dragGate.style.top = (y - PACKAGE_SIZE / 2) + "px";
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

            parent.removeEventListener('mousemove', mouseMove);
            parent.removeEventListener('mouseup', mouseUp);
            parent.removeChild(dragGate);

            deleteTempLine();

            if (event.clientX > canviBounds.left + 3 * PACKAGE_SIZE 
                && event.clientY > canviBounds.top + PACKAGE_SIZE 
                && event.clientY < canviBounds.top + PACKAGE_SIZE + yOffset)
            {
                // Place the gate into the circuit where it belongs
                let lineIndex = Math.round((event.clientY - canviBounds.top) / (PACKAGE_SIZE * 2)) - 1;
                let gateIndex = Math.round((event.clientX - canviBounds.left) / PACKAGE_SIZE) - 2;
                allCircuits[activeCanvas].insertGate(lineIndex, gateIndex, gate.id, gate.symbol, symbol);
            }

            updateCurrentCircuit();
        }

        parent.addEventListener('mousemove', mouseMove);
        parent.addEventListener('mouseup', mouseUp);
        parent.append(dragGate);
    }
}