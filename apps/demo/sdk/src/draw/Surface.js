/**
 * A Surface is an interface to render methods inside a draw {@link Ext.draw.Component}.
 * A Surface contains methods to render sprites, get bounding boxes of sprites, add
 * sprites to the canvas, initialize other graphic components, etc. One of the most used
 * methods for this class is the `add` method, to add Sprites to the surface.
 *
 * Most of the Surface methods are abstract and they have a concrete implementation
 * in VML or SVG engines.
 *
 * A Surface instance can be accessed as a property of a draw component. For example:
 *
 *     drawComponent.getSurface('main').add({
 *         type: 'circle',
 *         fill: '#ffc',
 *         radius: 100,
 *         x: 100,
 *         y: 100
 *     });
 *
 * The configuration object passed in the `add` method is the same as described in the {@link Ext.draw.sprite.Sprite}
 * class documentation.
 *
 * ### Listeners
 *
 * You can also add event listeners to the surface using the `Observable` listener syntax. Supported events are:
 *
 * - 'mouseup'
 * - 'mousedown'
 * - 'mouseover'
 * - 'mouseout'
 * - 'mousemove'
 * - 'mouseenter'
 * - 'mouseleave'
 * - 'click'
 * - 'dblclick'
 * - 'tap'
 * - 'tapstart'
 * - 'tapend'
 * - 'tapcancel'
 * - 'longpress'
 * - 'doubletap'
 * - 'singletap'
 * - 'touchstart'
 * - 'touchmove'
 * - 'touchend'
 * - 'drag'
 * - 'dragstart'
 * - 'dragend'
 * - 'pinch'
 * - 'pinchstart'
 * - 'pinchend'
 * - 'swipe'
 *
 * For example:
 *
 *     drawComponent.getSurface('main').on({
 *        'mousemove': function() {
 *             console.log('moving the mouse over the surface');
 *         }
 *     });
 *
 * ## Example
 *
 *     drawComponent.getSurface('main').add([
 *         {
 *             type: 'circle',
 *             radius: 10,
 *             fill: '#f00',
 *             x: 10,
 *             y: 10,
 *             group: 'circles'
 *         },
 *         {
 *             type: 'circle',
 *             radius: 10,
 *             fill: '#0f0',
 *             x: 50,
 *             y: 50,
 *             group: 'circles'
 *         },
 *         {
 *             type: 'circle',
 *             radius: 10,
 *             fill: '#00f',
 *             x: 100,
 *             y: 100,
 *             group: 'circles'
 *         },
 *         {
 *             type: 'rect',
 *             radius: 10,
 *             x: 10,
 *             y: 10,
 *             group: 'rectangles'
 *         },
 *         {
 *             type: 'rect',
 *             radius: 10,
 *             x: 50,
 *             y: 50,
 *             group: 'rectangles'
 *         },
 *         {
 *             type: 'rect',
 *             radius: 10,
 *             x: 100,
 *             y: 100,
 *             group: 'rectangles'
 *         }
 *     ]);
 *
 */
Ext.define('Ext.draw.Surface', {
    extend: 'Ext.Component',
    xtype: 'surface',

    mixins: {
        observable: 'Ext.mixin.Observable'
    },
    requires: [
        'Ext.draw.sprite.*',
        'Ext.draw.gradient.*',
        'Ext.draw.sprite.AttributeDefinition',
        'Ext.draw.Matrix',
        'Ext.draw.Draw',
        'Ext.draw.Group'
    ],

    defaultIdPrefix: 'ext-surface-',

    uses: [
        "Ext.draw.engine.Canvas"
    ],

    statics: {
        /**
         * Create and return a new concrete Surface instance appropriate for the current environment.
         * @param {Object} config Initial configuration for the Surface instance
         */
        create: function (config) {
            return Ext.create("Ext.draw.engine.Canvas", config);
        },
        /**
         * Saves the passed surface array based on the config parameters.
         *
         * The following config object properties affect the saving process:
         * - **type** - string - The export type. Supported types: 'svg': returns the chart's Svg-String, 'image/png': returns the chart as png, 'image/jpeg': returns the chart as jpeg. Default: 'image/png'
         *
         * Used in {@link Ext.chart.Chart#save}
         *
         * @param {Object} config The config object for the export generation
         * @param {Array} surfaces The surfaces that should be saved
         *
         */
        save: function (config, surfaces) {
            var surfacesList = [],
                series = [],
                overlays = [],
                others = [],
                axes = [],
                exportEngine = 'Image';

            for (var i in surfaces) {

                if (surfaces.hasOwnProperty(i)) {
                    // TODO better implementation
                    if (i == 'main') {
                        surfacesList.push(surfaces[i]);
                    } else if (i.indexOf('Overlay') != -1) {
                        overlays.push(surfaces[i]);
                    } else if (i.indexOf('Numeric') != -1) {
                        axes.push(surfaces[i]);
                    } else if (i.indexOf('series') != -1) {
                        series.push(surfaces[i]);
                    } else {
                        others.push(surfaces[i]);
                    }
                }
            }

            surfacesList = surfacesList.concat(axes, series, overlays, others);

            // check type and if canvas is supported
            if (config.type == 'svg' || (!document.createElement('canvas').getContext)) {
                exportEngine = 'Svg';
            }

            return Ext.draw.engine[exportEngine + 'Exporter'].generate(config, surfacesList);
        },

        stableSort: function (list) {
            if (list.length < 2) {
                return;
            }
            var keys = {}, sortedKeys, result = [], i, ln, zIndex;

            for (i = 0, ln = list.length; i < ln; i++) {
                zIndex = list[i].attr.zIndex;
                if (!keys[zIndex]) {
                    keys[zIndex] = [list[i]];
                } else {
                    keys[zIndex].push(list[i]);
                }
            }
            sortedKeys = Object.keys(keys).sort(function (a, b) {return a - b;});
            for (i = 0, ln = sortedKeys; i < ln; i++) {
                result.push.apply(result, keys[sortedKeys[i]]);
            }
            return result;
        }
    },

    config: {
        region: [0, 0, 400, 300],
        background: false,
        items: [],
        groups: [],
        dirty: false
    },

    devicePixelRatio: 1,

    constructor: function (config) {
        var me = this;

        me.callParent([config]);
        me.resetTransform();
        me.fastTransformMatrix = new Ext.draw.Matrix();
        me.matrix = new Ext.draw.Matrix();
    },

    applyElement: function (newElement, oldElement) {
        if (oldElement) {
            oldElement.set(newElement);
        } else {
            oldElement = Ext.Element.create(newElement);
        }
        this.setDirty(true);
        return oldElement;
    },

    applyBackground: function (background, oldBackground) {
        this.setDirty(true);
        return Ext.factory(background, Ext.draw.sprite.Rect, oldBackground);
    },

    // @private - Normalize a delegated single event from the main container to each sprite and sprite group
    processEvent: function (name, e) {
        var me = this,
            sprite = me.getSpriteForEvent(e);

        if (sprite) {
            sprite.fireEvent(name, sprite, e);
        }
        me.fireEvent.apply(me, arguments);
    },

    /**
     * @protected - For a given event, find the Sprite corresponding to it if any.
     * @return {Ext.draw.sprite.Sprite} The sprite instance, or null if none found.
     */
    getSpriteForEvent: function (e) {
        return null;
    },

    applyRegion: function (region, oldRegion) {
        if (oldRegion && region[0] === oldRegion[0] && region[1] === oldRegion[1] && region[2] === oldRegion[2] && region[3] === oldRegion[3]) {
            return;
        }
        if (Ext.isArray(region)) {
            return [region[0], region[1], region[2], region[3]];
        } else if (Ext.isObject(region)) {
            return [
                region.x || region.left,
                region.y || region.top,
                region.width || (region.right - region.left),
                region.height || (region.bottom - region.top)
            ];
        }
    },

    updateRegion: function (region) {
        var me = this,
            l = region[0],
            t = region[1],
            r = l + region[2],
            b = t + region[3],
            background = this.getBackground(),
            element = me.element;

        element.setBox({
            top: Math.floor(t),
            left: Math.floor(l),
            width: Math.ceil(r - Math.floor(l)),
            height: Math.ceil(b - Math.floor(t))
        });

        if (background) {
            background.setAttributes({
                x: 0,
                y: 0,
                width: Math.ceil(r - Math.floor(l)),
                height: Math.ceil(b - Math.floor(t))
            });
        }
        me.setDirty(true);
    },

    resetTransform: function () {
        this.matrix = new Ext.draw.Matrix();
        this.inverseMatrix = new Ext.draw.Matrix();
        this.setDirty(true);
    },

    updateComponent: function (component, oldComponent) {
        if (component) {
            component.element.dom.appendChild(this.element.dom);
        }
    },

    // @private
    applyGradients: function (gradients) {
        var result = {},
            i, ln, gradient;

        if (gradients) {
            ln = gradients.length;
            for (i = 0; i < ln; i++) {
                gradient = this.parseGradient(gradients[i]);
                result[gradient.id] = gradient;
            }
        }
        this.setDirty(true);
        return result;
    },

    // @private
    applyItems: function (items, oldItems) {
        var result;

        if (items instanceof Ext.draw.Group) {
            result = items;
        } else {
            result = new Ext.draw.Group({surface: this});
            result.autoDestroy = true;
            result.addAll(this.prepareItems(items));
        }
        this.setDirty(true);
        return result;
    },

    // @private
    prepareItems: function (items) {
        items = [].concat(items);
        // Make sure defaults are applied and item is initialized
        var me = this,
            item, i, ln, j;

        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (!(item instanceof Ext.draw.sprite.Sprite)) {
                // Temporary, just take in configs...
                item = items[i] = me.createItem(item);
            }
            for (j = 0; j < item.group.length; j++) {
                me.getGroup(item.group[i]).add(item);
            }
            item.on('beforedestroy', function (sprite) {
                this.remove(sprite, false);
            }, this);
        }
        return items;
    },

    //@private Creates an item and appends it to the surface. Called
    //as an internal method when calling `add`.
    createItem: function (config) {
        var sprite = Ext.create(config.xclass || 'sprite.' + config.type, config);
        return sprite;
    },

    /**
     *
     * @param path
     * @param matrix
     * @param band
     */
    pathApplier: function (ctx, path, matrix, band) {
        throw 'Not implemented';
    },

    /**
     * @deprecated Use the `sprite.getBBox(isWithoutTransform)` directly.
     * @param sprite
     * @param isWithoutTransform
     * @return {Object}
     */
    getBBox: function (sprite, isWithoutTransform) {
        return sprite.getBBox(isWithoutTransform);
    },


    // Empty the surface (without touching the sprites.)
    clear: Ext.emptyFn,

    orderByZIndex: function () {
        var me = this,
            items = me.getItems().items,
            dirtyZIndex = false,
            i, ln;

        if (me.getDirty()) {
            for (i = 0, ln = items.length; i < ln; i++) {
                if (items[i].attr.dirtyZIndex) {
                    dirtyZIndex = true;
                    break;
                }
            }
            if (dirtyZIndex) {
                //sort by zIndex
                Ext.draw.Surface.stableSort(items);
                this.setDirty(true);
            }
        }
    },

    repaint: function () {
        var me = this;
        me.repaint = Ext.emptyFn;
        setTimeout(function () {
            delete me.repaint;
            me.element.repaint();
        }, 1);
    },

    /**
     * Triggers the re-rendering of the canvas.
     */
    renderFrame: function () {
        if (!this.element) {
            return;
        }
        var me = this,
            background = me.getBackground(),
            items = me.getItems().items,
            item, i, ln, textPositionStart;

        if (!me.textDivs) {
            me.textDivs = [];
        }
        me.textPosition = 0;

        // This will also check the dirty flags of the sprites.
        me.orderByZIndex();
        if (me.getDirty()) {
            me.clear();
            me.clearTransform();

            if (background) {
                me.renderSprite(background);
            }

            for (i = 0, ln = items.length; i < ln; i++) {
                item = items[i];
                item.applyTransformations();
                item.attr.dirtyZIndex = false;
                textPositionStart = me.textPosition;
                me.renderSprite(item);
                item.textPositionCount = me.textPosition - textPositionStart;
            }

            me.setDirty(false);

            for (i = me.textPosition, ln = me.textDivs.length; i < ln; i++) {
                me.textDivs[i].setStyle({'display': 'none'});
            }
        }
    },

    renderSprite: Ext.emptyFn,

    applyGroups: function (groups, oldGroups) {
        var result = new Ext.util.MixedCollection();

        if (groups instanceof Ext.util.MixedCollection) {
            result = groups;
        } else {
            result.addAll(groups);
        }
        if (oldGroups) {
            oldGroups.each(function (group) {
                if (!result.contains()) {
                    group.destroy();
                }
            });
        }
        this.setDirty(true);
        return result;
    },

    createGroup: function (id) {
        var group = this.getGroups().get(id);

        if (!group) {
            group = new Ext.draw.Group({surface: this});
            group.id = id || Ext.id(null, 'ext-surface-group-');
            this.getGroups().add(group);
        }
        this.setDirty(true);
        return group;
    },

    removeGroup: function (group) {
        if (Ext.isString(group)) {
            group = this.getGroups().get(group);
        }
        if (group) {
            this.getGroups().remove(group);
            group.destroy();
        }
        this.setDirty(true);
    },
    /**
     * Returns a new group or an existent group associated with the current surface.
     * The group returned is a {@link Ext.draw.Group} group.
     *
     * For example:
     *
     *      var spriteGroup = drawComponent.surface.getGroup('someGroupId');
     *
     * @param {String} id The unique identifier of the group.
     * @return {Object} The {@link Ext.draw.Group}.
     */
    getGroup: function (id) {
        if (typeof id == "string") {
            var group = this.getGroups().get(id);
            if (!group) {
                group = this.createGroup(id);
            }
        } else {
            group = id;
        }
        return group;
    },

    /**
     * Add a Sprite to the surface. See {@link Ext.draw.sprite.Sprite} for the configuration object to be passed into this method.
     *
     * For example:
     *
     *     drawComponent.surface.add({
     *         type: 'circle',
     *         fill: '#ffc',
     *         radius: 100,
     *         x: 100,
     *         y: 100
     *     });
     *
     */
    add: function () {
        var me = this,
            args = Array.prototype.slice.call(arguments),
            argIsArray = Ext.isArray(args[0]),
            sprite, items, i, ln, results, group, groups;

        items = argIsArray ? args[0] : args;
        results = [];
        for (i = 0, ln = items.length; i < ln; i++) {
            sprite = items[i];
            sprite = me.prepareItems(args[0])[0];

            if (groups = sprite.group, groups.length) {
                for (i = 0, ln = groups.length; i < ln; i++) {
                    group = groups[i];
                    me.getGroup(group).add(sprite);
                }
            }

            me.getItems().add(sprite);
            results.push(sprite);
            sprite.setParent(this);
            me.onAdd(sprite);
        }

        me.dirtyZIndex = true;
        me.setDirty(true);
        if (!argIsArray && results.length == 1) {
            return results[0];
        } else {
            return results;
        }
    },

    onAdd: Ext.emptyFn,
    /**
     * Remove a given sprite from the surface, optionally destroying the sprite in the process.
     * You can also call the sprite own `remove` method.
     *
     * For example:
     *
     *      drawComponent.surface.remove(sprite);
     *      //or...
     *      sprite.remove();
     *
     * @param {Ext.draw.sprite.Sprite} sprite
     * @param {Boolean} destroySprite
     */
    remove: function (sprite, destroySprite) {
        if (sprite) {
            if (destroySprite === true) {
                sprite.destroy();
            } else {
                this.getGroups().each(function (item) {
                    item.remove(sprite);
                });
                this.getItems().remove(sprite);
            }
            this.dirtyZIndex = true;
            this.setDirty(true);
        }
    },

    /**
     * Remove all sprites from the surface, optionally destroying the sprites in the process.
     *
     * For example:
     *
     *      drawComponent.surface.removeAll();
     *
     */
    removeAll: function () {
        this.getItems().clear();
        this.dirtyZIndex = true;
    },

    onRemove: Ext.emptyFn,

    onDestroy: Ext.emptyFn,

    //force will force the method to return a value.
    getShadowOptions: function (force) {
        return {
            shadowOffsetX: 2,
            //http://code.google.com/p/android/issues/detail?id=16025
            shadowOffsetY: Ext.os.is('Android') ? -2 : 2,
            shadowBlur: 3,
            shadowColor: '#444'
        };
    },

    /**
     * Destroys the surface. This is done by removing all components from it and
     * also removing its reference to a DOM element.
     *
     * For example:
     *
     *      drawComponent.surface.destroy();
     */
    destroy: function () {
        var me = this;
        me.removeAll();
        me.setGroups([]);
        me.setBackground(null);
        me.getItems().destroy();
        me.callParent();
    }
});


