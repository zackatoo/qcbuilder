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
        var style = this.div.style;
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
