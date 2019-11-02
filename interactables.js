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

        this.div = document.createElement("div");
        let style = this.div.style;
        style.position = "absolute";
        style.width = width + "px";
        style.height = height + "px";
        style.left = this.cornerX + "px";
        style.top = this.cornerY + "px";

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

    setOnClick(onClick)
    {
        this.div.onclick = onClick;
    }

    getCornerPosition()
    {
        return {x: this.cornerX, y: this.cornerY};
    }

    getMidPosition()
    {
        return {x: this.midX, y: this.midY};
    }
}

class PieSelector
{
    // Adapted from https://stackoverflow.com/questions/11487557/how-can-i-make-a-circular-sector-using-css
    constructor(x, y, radius, numSlices, parent)
    {
        this.x = x; // Coordniates of middle of the circle
        this.y = y;
        this.radius = radius;
        this.numSlices = numSlices;

        let selector = document.createElement("div");
        selector.style.borderRadius = "50%";
        selector.style.overflow = "hidden";
        selector.style.position = "absolute";
        selector.style.left = (x - radius) + "px";
        selector.style.top = (y - radius) + "px";
        selector.style.width = (radius * 2) + "px";
        selector.style.height = (radius * 2) + "px";

        let lastWrapper = document.createElement("div");

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
            slice.style.paddingLeft = "1px";
            slice.style.zIndex = i + 1;
        
            slice.style.backgroundColor = "#00ff00";

            let angle = (i != numSlices - 1) ? (i + 1) * 360 / numSlices : -360 / numSlices / 2;
            slice.style.transform = "rotate(" + angle + "deg)";

            (i != numSlices - 1 ? selector : lastWrapper).append(slice);
        }

        applyStyle(lastWrapper);
        selector.append(lastWrapper);
        parent.append(selector);
    }
}