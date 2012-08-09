/**
 * SVG engine.
 */
Ext.define('Ext.draw.engine.Svg', {
    extend: 'Ext.draw.Surface',
    statics: {
        BBoxTextCache: {}
    },

    getElementConfig: function () {
        return {
            reference: 'element',
            style: {
                position: 'absolute'
            },
            children: [
                {
                    reference: 'innerElement',
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'relative'
                    },
                    children: [
                        {
                            tag: 'svg',
                            reference: 'svgElement',
                            namespace: "http:/" + "/www.w3.org/2000/svg",
                            version: 1.1,
                            cls: 'x-surface'
                        }
                    ]
                }
            ]
        };
    },

    constructor: function (config) {
        var me = this;
        me.callParent([config]);
        me.mainGroup = me.createSvgNode("g");
        me.defElement = me.createSvgNode("def");
        me.svgElement.appendChild(me.mainGroup);
        me.svgElement.appendChild(me.defElement);
        me.ctx = new Ext.draw.engine.SvgContext(me);
    },

    updateRegion: function (region) {
        this.callParent([region]);
    },

    createSvgNode: function (type) {
        var node = document.createElementNS("http:/" + "/www.w3.org/2000/svg", type);
        return Ext.get(node);
    },

    setHighPrecision: function () {

    },

    clear: function () {
        this.ctx.clear();
    },

    clearTransform: function () {
        var me = this;
        me.mainGroup.set({transform: me.matrix.toSvg()});
    },

    pathApplier: function (ctx, path, matrix, band) {
        ctx.appendPath(path);
    },

    renderSprite: function (sprite) {
        var me = this,
            region = me.getRegion(),
            ctx = me.ctx;
        sprite.applyTransformations();
        ctx.save();
        if (!sprite.getDirty()) {
            ctx.position++;
            if (sprite.textPositionCount) {
                this.textPosition += sprite.textPositionCount;
            }
        } else if (!sprite.attr.hidden) {
            sprite.useAttributes(ctx);
            sprite.render(this, ctx, region);
            sprite.setDirty(false);
        }
        ctx.restore();
    },

    /**
     * Destroys the Canvas element and prepares it for Garbage Collection.
     */
    destroy: function (path, matrix, band) {
        var me = this;
        me.ctx.destroy();
        me.mainGroup.destroy();
        delete me.mainGroup;
        delete me.zIndex;
        me.callParent(arguments);
    }
});

Ext.define('Ext.draw.engine.SvgContext', {
    toSave: ["strokeOpacity", "strokeStyle", "fillOpacity", "fillStyle", "globalAlpha", "lineWidth", "lineCap", "lineJoin", "miterLimit", "shadowOffsetX", "shadowOffsetY", "shadowBlur", "shadowColor", "globalCompositeOperation"],
    "strokeOpacity": 1,
    "strokeStyle": "none",
    "fillOpacity": 1,
    "fillStyle": "none",
    "globalAlpha": 1,
    "lineWidth": 1,
    "lineCap": "miter",
    "lineJoin": "butt",
    "miterLimit": 10,
    "shadowOffsetX": 0,
    "shadowOffsetY": 0,
    "shadowBlur": 0,
    "shadowColor": "none",
    "globalCompositeOperation": "src",

    constructor: function (SvgSurface) {
        this.surface = SvgSurface;
        this.status = [];
        this.matrix = new Ext.draw.Matrix();
        this.path = null;
        this.clear();
    },

    clear: function () {
        this.groups = [];
        this.group = this.surface.mainGroup;
        this.positions = [];
        this.position = 0;
        this.path = null;
    },

    getElement: function (tag) {
        var group = this.group,
            element;
        if (group.dom.childNodes.length > this.position) {
            element = group.dom.childNodes[this.position];
            if (element.tagName != tag) {
                element = null;
            } else {
                element = Ext.get(element);
            }
        }
        if (!element) {
            element = Ext.get(this.surface.createSvgNode(tag));
            if (this.position == 0) {
                group.insertFirst(element);
            } else {
                element.insertAfter(Ext.fly(group.dom.childNodes[this.position - 1]));
            }
            element.cache = {};
        }
        this.position++;
        return element;
    },

    setElementAttributes: function (element, attributes) {
        var dom = element.dom,
            cache = element.cache,
            name, value;
        for (name in attributes) {
            value = attributes[name];
            if (cache[name] !== value) {
                cache[name] = value;
                dom.setAttribute(name, value);
            }
        }
    },

    save: function () {
        var toSave = this.toSave,
            obj = {},
            g = this.getElement('g');

        this.positions.push(this.position);
        this.groups.push(this.group);
        this.position = 0;
        this.group = g;

        for (var i = 0; i < toSave.length; i++) {
            if (toSave[i] in this) {
                obj[toSave[i]] = this[toSave[i]];
            }
        }
        obj.matrix = this.matrix.clone();
        this.status.push(obj);

    },

    restore: function () {
        var toSave = this.toSave,
            obj = this.status.pop(),
            group = this.group;

        for (var i = 0; i < toSave.length; i++) {
            if (toSave[i] in obj) {
                this[toSave[i]] = obj[toSave[i]];
            } else {
                delete this[toSave[i]];
            }
        }

        while (group.dom.childNodes.length > this.position) {
            Ext.fly(group.dom.childNodes[group.dom.childNodes.length - 1]).destroy();
        }
        this.group = this.groups.pop()
        this.position = this.positions.pop();
        this.setTransform.apply(this, obj.matrix.elements);
    },

    transform: function (xx, yx, xy, yy, dx, dy) {
        if (this.path) {
            var inv = Ext.draw.Matrix.fly([xx, yx, xy, yy, dx, dy]).inverse();
            this.path.transform(inv);
        }
        this.matrix.postpend(xx, yx, xy, yy, dx, dy);
    },

    setTransform: function (xx, yx, xy, yy, dx, dy) {
        if (this.path) {
            this.path.transform(this.matrix);
        }
        this.matrix.reset();
        this.transform(xx, yx, xy, yy, dx, dy);
    },

    beginPath: function () {
        this.path = new Ext.draw.path.Path();
    },

    moveTo: function (x, y) {
        if (!this.path) {
            this.beginPath();
        }
        this.path.moveTo(x, y);
    },

    lineTo: function (x, y) {
        if (!this.path) {
            this.beginPath();
        }
        this.path.lineTo(x, y);
    },

    rect: function (x, y, width, height) {
        this.moveTo(x, y);
        this.lineTo(x + width, y);
        this.lineTo(x + width, y + height);
        this.lineTo(x, y + height);
        this.closePath();
    },

    strokeRect: function (x, y, width, height) {
        this.beginPath();
        this.rect(x, y, width, height);
        this.stroke();
    },

    fillRect: function (x, y, width, height) {
        this.beginPath();
        this.rect(x, y, width, height);
        this.fill();
    },

    closePath: function () {
        if (!this.path) {
            this.beginPath();
        }
        this.path.closePath();
    },

    arcSvg: function (r1, r2, rotation, large, swipe, x2, y2) {
        if (!this.path) {
            this.beginPath();
        }
        this.path.arcSvg(r1, r2, rotation, large, swipe, x2, y2);
    },

    normalizeAngle: function (angle) {
        var pie2 = Math.PI * 2;
        if (angle < 0) {
            angle %= pie2;
            angle += pie2;
        }
        if (angle > pie2) {
            angle %= pie2;
        }
        return angle;
    },

    arc: function (x, y, radius, startAngle, endAngle, anticlockwise) {
        if (!this.path) {
            this.beginPath();
        }
        this.path.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    },

    ellipse: function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        if (!this.path) {
            this.beginPath();
        }
        this.path.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    },

    arcTo: function (x1, y1, x2, y2, radius) {
        // TODO: This is incomplete.
        var util = Ext.draw.Draw,
            p0 = this.cursor,
            p1 = [x1, y1],
            p2 = [x2, y2],
            s = util.cross3(p0, p1, p2),
            d0 = util.distance(p0, p1),
            d2 = util.distance(p1, p2),
            a = Math.abs(s) / d0 / d2,
            len2 = radius * (1 + Math.sqrt(1 - a * a)) / a,
            pos0 = [p1[0] + len2 / d0 * (p0[0] - p1[0]),
                    p1[1] + len2 / d0 * (p0[1] - p1[1])],
            pos2 = [p1[0] + len2 / d2 * (p2[0] - p1[0]),
                    p1[1] + len2 / d2 * (p2[1] - p1[1])];
        this.lineTo(pos0[0], pos0[1]);
        this.arcSvg(radius, radius, 0, false, s > 0, pos2[0], pos2[1]);
    },

    bezierCurveTo: function (x1, y1, x2, y2, x3, y3) {
        if (!this.path) {
            this.beginPath();
        }
        this.path.ellipse(x1, y1, x2, y2, x3, y3);
    },

    strokeText: function () {
        // TODO: This is not implemented.
    },

    fillText: function () {
        // TODO: This is not implemented.
    },

    drawImage: function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
        var element = this.getElement('image');
        var x = sx;
        var y = sy;
        var width = sw == null ? image.width : sw;
        var height = sh == null ? image.height : sh;
        var viewBox = null;
        if (!dh == null) {
            viewBox = sx + " " + sy + " " + sw + " " + sh;
            x = dx;
            y = dy;
            width = dw;
            height = dh;
        }
        element.dom.setAttributeNS("http:/" + "/www.w3.org/1999/xlink", "href", image.src);
        this.setElementAttributes(element, {
            viewBox: viewBox,
            x: x,
            y: y,
            width: width,
            height: height,
            opacity: this.globalAlpha,
            transform: this.matrix.toSvg()
        });
    },

    fill: function () {
        if (!this.path) {
            return;
        }
        if (this.fillStyle) {
            var path,
                element = this.path.element;
            if (!element) {
                path = this.path.toString();
                element = this.path.element = this.getElement('path');
                this.setElementAttributes(element, {
                    "d": path,
                    "transform": this.matrix.toSvg()
                });
            }
            this.setElementAttributes(element, {
                "fill": this.fillStyle,
                "fill-opacity": this.fillOpacity * this.globalAlpha
            });
        }
    },

    stroke: function () {
        if (!this.path) {
            return;
        }
        if (this.strokeStyle) {
            var path,
                element = this.path.element;
            if (!element) {
                path = this.path.toString();
                element = this.path.element = this.getElement('path');
                this.setElementAttributes(element, {
                    "fill": "none",
                    "d": path,
                    "transform": this.matrix.toSvg()
                });
            }
            this.setElementAttributes(element, {
                "stroke": this.strokeStyle,
                "stroke-linecap": this.lineCap,
                "stroke-linejoin": this.lineJoin,
                "stroke-width": this.lineWidth,
                "stroke-opacity": this.strokeOpacity * this.globalAlpha
            });

        }
    },

    /**
     * @protected
     *
     * Note: After the method guarantees the transform matrix will be inverted.
     * @param ctx
     * @param attr
     */
    fillStroke: function (attr) {
        var ctx = this,
            fillStyle = ctx.fillStyle,
            strokeStyle = ctx.strokeStyle,
            fillOpacity = ctx.fillOpacity,
            strokeOpacity = ctx.strokeOpacity;

        if (!attr.transformFillStroke) {
            attr.inverseMatrix.toContext(ctx);
        }

        if (fillStyle && fillOpacity != 0) {
            ctx.fill();
        }

        if (strokeStyle && strokeOpacity != 0) {
            ctx.stroke();
        }
    },

    appendPath: function (path) {
        this.path = path;
    },

    createLinearGradient: function () {

    }
});