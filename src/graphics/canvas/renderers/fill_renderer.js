var _INCLUDED = false;
module.exports = function() {
    var FillRenderer = require('../../../core/renderers/fill_renderer.js'),
        mathUtil = require('../../../math/util.js');

    if (_INCLUDED) { return FillRenderer; }
    _INCLUDED = true;

    // cached state object, for quick access during rendering, populated in begin() method:
    FillRenderer.hasA("state");

    FillRenderer.respondsTo("begin", function (context) {
        var state = {
            "context"            : context,
            "run"                : [],
            "previouspoint"      : null,
            "linecolor"          : this.getOptionValue("linecolor"),
            "linewidth"          : this.getOptionValue("linewidth"),
            "fillcolor"          : this.getOptionValue("fillcolor"),
            "downfillcolor"      : this.getOptionValue("downfillcolor"),
            "fillopacity"        : this.getOptionValue("fillopacity"),
            "fillbase"           : this.getOptionValue("fillbase"),
            "currentfillcolor"   : null
        };
        if (state.downfillcolor === null) {
            state.downfillcolor = state.fillcolor;
        }
        if (state.fillbase !== null) {
            state.fillpixelbase = this.plot().verticalaxis().dataValueToAxisValue(state.fillbase);
        } else {
            state.fillpixelbase = 0;
        }

        this.state(state);

        context.save();
        context.fillStyle = state.fillcolor.getHexString("#");
    });

    // This renderer's dataPoint() method works by accumulating
    // and drawing one "run" of data points at a time.  A "run" of
    // points consists of a consecutive sequence of non-missing
    // data points which have the same fill color.  (The fill
    // color can change if the data line crosses the fill base
    // line, if the downfillcolor is different from the
    // fillcolor.)
    FillRenderer.respondsTo("dataPoint", function (datap) {
        var state = this.state(),
            fillpixelbase = state.fillpixelbase,
            fillcolor,
            linecolor,
            p;

        // if this is a missing point, and if it's not the first point, end the current run and render it
        if (this.isMissing(datap)) {
            if (state.previouspoint !== null) {
                state.run.push( [state.previouspoint[0], fillpixelbase] );
                this.renderRun();
                state.run = [];
                state.previouspoint = null;
            }
            return;
        }

        // transform point to pixel coords
        p = this.transformPoint(datap);

        // set the fillcolor and linecolor for this data point, based on whether it's above
        // or below the base line
        if (p[1] >= fillpixelbase) {
            fillcolor = state.fillcolor;
        } else {
            fillcolor = state.downfillcolor;
        }

        // if we're starting a new run, start with this data point's base line projection
        if (state.run.length === 0) {
            state.run.push( [p[0], fillpixelbase] );
        } else {
            // if we're not starting a new run, but the fill color
            // has changed, interpolate to find the exact base
            // line crossing point, end the current run with that
            // point, render it, and start a new run with the
            // crossing point.
            if (!fillcolor.eq(state.currentfillcolor)) {
                var x = mathUtil.safe_interp(fillpixelbase, state.previouspoint[1], p[1], state.previouspoint[0], p[0]);
                // base line crossing point is [x, state.fillpixelbase]
                // These points are pushed twice so the outline of the fill will be drawn properly,
                // otherwise the outline would not be drawn around the segments that cross the baseline.
                state.run.push( [x, fillpixelbase] );
                state.run.push( [x, fillpixelbase] );
                this.renderRun();
                state.run = [];
                state.run.push( [x, fillpixelbase] );
                state.run.push( [x, fillpixelbase] );
            }
        }

        // add this point to the current run, and remember it and the current colors for next time
        state.run.push(p);
        state.previouspoint = p;
        state.currentfillcolor = fillcolor;
    });

    FillRenderer.respondsTo("end", function () {
        var state = this.state(),
            context = state.context;
        if (state.run.length > 0) {
            state.run.push( [state.run[state.run.length-1][0], state.fillpixelbase] );
            this.renderRun();
        }
        context.restore();
    });

    // Render the current run of data points.  This consists of drawing the fill region
    // under the points, and the lines connecting the points.  The first and last points
    // in the run array are always on the base line; the points in between these two
    // are the actual data points.
    FillRenderer.respondsTo("renderRun", function () {
        var state = this.state(),
            context = state.context,
            i;

        // fill the run
        context.save();
        context.globalAlpha = state.fillopacity;
        context.fillStyle = state.currentfillcolor.getHexString("#");
        context.beginPath();
        context.moveTo(state.run[0][0], state.run[0][1]);
        for (i = 1; i < state.run.length; ++i) {
            context.lineTo(state.run[i][0], state.run[i][1]);
        }
        context.fill();
        context.restore();

        // stroke the run
        context.save();
        context.strokeStyle = state.linecolor.getHexString("#");
        context.lineWidth = state.linewidth;
        context.beginPath();
        context.moveTo(state.run[1][0], state.run[1][1]);
        for (i = 2; i < state.run.length-1; ++i) {
            context.lineTo(state.run[i][0], state.run[i][1]);
        }
        context.stroke();
        context.restore();
    });

    FillRenderer.respondsTo("renderLegendIcon", function (context, x, y, icon) {
        var state = this.state(),
            iconWidth = icon.width(),
            iconHeight = icon.height();
        
        context.save();
        context.transform(1, 0, 0, 1, x, y);

        context.save();
        // Draw icon background (with opacity)
        if (iconWidth < 10 || iconHeight < 10) {
            context.fillStyle = state.fillcolor.toRGBA();
        } else {
            context.fillStyle = "rgba(255, 255, 255, 1)";
        }
        context.fillRect(0, 0, iconWidth, iconHeight);
        context.restore();

        context.strokeStyle = state.linecolor.toRGBA();
        context.lineWidth   = state.linewidth;
        context.fillStyle   = state.fillcolor.toRGBA(state.fillopacity);

        context.beginPath();
        context.moveTo(0, 0);
        // Draw the middle range icon or the large range icon if the width and height allow it
        if (iconWidth > 10 || iconHeight > 10) {
            // Draw a more complex icon if the icons width and height are large enough
            if (iconWidth > 20 || iconHeight > 20) {
                context.lineTo(iconWidth / 6, iconHeight / 2);
                context.lineTo(iconWidth / 3, iconHeight / 4);
            }
            context.lineTo(iconWidth / 2, iconHeight - iconHeight / 4);

            if (iconWidth > 20 || iconHeight > 20) {
                context.lineTo(iconWidth - iconWidth / 3, iconHeight / 4);
                context.lineTo(iconWidth - iconWidth / 6, iconHeight / 2);
            }
        }
        context.lineTo(iconWidth, 0);
        context.stroke();
        context.fill();

        context.restore();
    });

    return FillRenderer;
};
