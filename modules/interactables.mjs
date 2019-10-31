// This file contains all the code for the user interactions with the elements of the canvases
"use strict";

class Hitbox
{
    x;
    y;
    width;
    height;
    onclick;
    onhover;
    div;

    constructor(x, y, width, height, onclick, onhover, parent)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.onclick = onclick;
        this.onhover = onhover;

        this.div = document.createElement("div");
        var style = this.div.style;
        style.position = "absolute";
        style.width = width;
        style.height = height;
        style.left = x;
        style.top = y;

        this.div.onclick = onclick;
        this.div.onhover = onhover;

        parent.append(this.div);
    }
}
