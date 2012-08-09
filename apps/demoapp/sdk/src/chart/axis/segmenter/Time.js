/**
 *
 */
Ext.define("Ext.chart.axis.segmenter.Time", {
    extend: 'Ext.chart.axis.segmenter.Segmenter',
    alias: 'segmenter.time',

    renderer: function (value, context) {
        var ExtDate = Ext.Date;
        switch (context.majorTicks.unit) {
            case 'y':
                return ExtDate.format(new Date(value), 'Y');
            case 'mo':
                return ExtDate.format(new Date(value), 'Y-m');
            case 'd':
                return ExtDate.format(new Date(value), 'Y-m-d');
        }
        return ExtDate.format(new Date(value), 'Y-m-d\nH:i:s');
    },

    diff: function (min, max, unit) {
        var ExtDate = Ext.Date;
        if (isFinite(min)) {
            min = new Date(min);
        }
        if (isFinite(max)) {
            max = new Date(max);
        }
        return ExtDate.diff(min, max, unit);
    },

    align: function (date, step, unit) {
        if (unit == 'd' && step >= 7) {
            date = Ext.Date.align(date, 'd', step);
            date.setDate(date.getDate() - date.getDay() + 1);
            return date;
        } else {
            return Ext.Date.align(date, unit, step);
        }
    },

    add: function (value, step, unit) {
        return Ext.Date.add(new Date(value), unit, step);
    },

    preferredStep: function (min, estStepSize) {
        var from = new Date(+min),
            to = new Date(+min + Math.ceil(estStepSize));

        var ExtDate = Ext.Date,
            units = [
                [ExtDate.YEAR, 1, 2, 5, 10, 20, 50, 100, 200, 500],
                [ExtDate.MONTH, 1, 3, 6],
                [ExtDate.DAY, 1, 7, 14],
                [ExtDate.HOUR, 1, 6, 12],
                [ExtDate.MINUTE, 1, 5, 15, 30],
                [ExtDate.SECOND, 1, 5, 15, 30],
                [ExtDate.MILLI, 1, 2, 5, 10, 20, 50, 100, 200, 500]
            ],
            result;

        for (var i = 0; i < units.length; i++) {
            var unit = units[i][0],
                diff = this.diff(from, to, unit);
            if (diff > 0) {
                for (var j = 1; j < units[i].length; j++) {
                    if (diff <= units[i][j]) {
                        result = {
                            unit: unit,
                            step: units[i][j]
                        };
                        break;
                    }
                }
                if (!result) {
                    i--;
                    result = {
                        unit: units[i][0],
                        step: 1
                    }
                }
                break;
            }
        }
        return result;
    }
});