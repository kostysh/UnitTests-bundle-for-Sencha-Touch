/**
 * A type of axis whose units are measured in time values. Use this axis
 * for listing dates that you will want to group or dynamically change.
 * If you just want to display dates as categories then use the
 * Category class for axis instead.
 *
 * For example:
 *
 *     axes: [{
 *         type: 'Time',
 *         position: 'bottom',
 *         fields: 'date',
 *         title: 'Day',
 *         dateFormat: 'M d',
 *
 *         constrain: true,
 *         fromDate: new Date('1/1/11'),
 *         toDate: new Date('1/7/11')
 *     }]
 *
 * In this example we're creating a time axis that has as title *Day*.
 * The field the axis is bound to is `date`.
 * The date format to use to display the text for the axis labels is `M d`
 * which is a three letter month abbreviation followed by the day number.
 * The time axis will show values for dates between `fromDate` and `toDate`.
 * Since `constrain` is set to true all other values for other dates not between
 * the fromDate and toDate will not be displayed.
 */
Ext.define('Ext.chart.axis.Time', {
    extend: 'Ext.chart.axis.Numeric',
    alias: 'axis.time',
    type: 'time',
    requires: ['Ext.chart.axis.layout.Continuous', 'Ext.chart.axis.segmenter.Time'],
    config: {
        /**
         * @cfg {Boolean} calculateByLabelSize
         * The minimum value drawn by the axis. If not set explicitly, the axis
         * minimum will be calculated automatically.
         */
        calculateByLabelSize: true,

        /**
         * @cfg {String/Boolean} dateFormat
         * Indicates the format the date will be rendered on.
         * For example: 'M d' will render the dates as 'Jan 30', etc.
         */
        dateFormat: null,

        /**
         * @cfg {Date} fromDate The starting date for the time axis.
         */
        fromDate: false,

        /**
         * @cfg {Date} toDate The ending date for the time axis.
         */
        toDate: false,

        /**
         * @cfg {Array} step An array with two components: The first is the unit of the step (Ext.Date.DAY, Ext.Date.MONTH, etc). The second one is the number of units for the step (1, 2, etc.).
         * Default's [Date.DAY, 1]. If this is specified, {@link #steps} config is omitted.
         */
        step: [Ext.Date.DAY, 1],

        /**
         * @cfg {Boolean} constrain
         *
         * If true, the values of the chart will be rendered only if they belong between fromDate and toDate.
         * If false, the time axis will adapt to the new values by adding/removing steps.
         * Default's [Ext.Date.DAY, 1].
         */
        constrain: false,

        layout: 'continuous',

        segmenter: 'time',

        aggregator: 'time'
    },

    needHighPrecision: false,

    getCoordFor: function (value) {
        if (Ext.isString(value)) {
            value = new Date(value);
        }
        return +value;
    },

    getSprites: function () {
        var sprites = this.callParent(arguments);
        if (this.getDateFormat() && sprites && sprites[0]) {
            sprites[0].setAttributes({
                dateFormat: this.getDateFormat()
            });
        }
        return sprites;
    }
});
