var jermaine = require('../../lib/jermaine/src/jermaine.js');

var Warning = require('./warning.js'),
    Enum = require('../math/enum.js'),
    rendererList,
    utilityFunctions = require('../util/utilityFunctions.js'),
    defaultValues = utilityFunctions.getDefaultValuesFromXSD(),
    attributes = utilityFunctions.getKeys(defaultValues.plot.renderer),
    Type = new Enum("RendererType"),
    RGBColor = require('../math/rgb_color.js');

var Renderer = new jermaine.Model("Renderer", function () {
    this.hasA("type").which.validatesWith(Type.isInstance);
    this.hasA("plot").which.validatesWith(function (plot) {
        var Plot = require('./plot.js');
        return plot instanceof Plot;
    });
    this.hasA("numberOfVariables").which.isA("number");

    this.hasA("filter").which.validatesWith(function(filter) {
        return ((typeof(filter) === 'undefined')
                ||
                ((typeof(filter.reset) === 'function') && (typeof(filter.filter) === 'function')));
    });

    this.respondsTo("setUpMissing", function () {
        // A call to this method results in the addition (or replacement) of a method called "isMissing()"
        // that can be used to test whether a value meets the "missing" criteria of one of this renderer's
        // plot's data columns.  The point of having this "setUpMissing()" method create the "isMissing()"
        // method, rather than just coding the "isMissing()" method directly here, is so that we can capture
        // a pointer to the plot's data object via a closure, for faster access, rather than coding
        // this.plot().data() in "isMissing()", which adds the overhead of 2 getter calls to each invocation.
        //
        // NOTE: This is awkward.  What we really want is for this stuff to happen automatically when
        // the renderer's "plot" attribute is set.  Can Jermaine be modified to allow us to write
        // a custom setter, so that we can execute this code automatically when the render's "plot"
        // attribute is set ???
        var plot = this.plot(),
            data;
        if (!plot) {
            console.log("Warning: renderer.setUpMissing() called for renderer that has no plot ref");
            // this should really eventually throw an error
            return;
        }

        // for ConstantPlot, create function that always returns false, since it has no data
        var ConstantPlot = require('./constant_plot.js');
        if (plot instanceof ConstantPlot) {
            this.isMissing = function (p) {
                return false;
            };
            return;
        }


        if (!plot.data()) {
            // this should eventually throw an error
            console.log("Warning: renderer.setUpMissing() called for renderer whose plot has no data ref");
            return;
        }
        data = plot.data();
        this.isMissing = function (p) {
            var i;
            for (i = 1; i < p.length; ++i) {
                if (data.isMissing(p[i], i)) {
                    return true;
                }
            }
            return false;
        };
    });

    this.isBuiltWith("type");

    utilityFunctions.insertDefaults(this, defaultValues.plot.renderer, attributes);

    this.respondsTo("transformPoint", function (input) {
        var output = [],
            haxis = this.plot().horizontalaxis(),
            vaxis = this.plot().verticalaxis(),
            i;

        output[0] = haxis.dataValueToAxisValue(input[0]);
        for (i = 1; i < input.length; ++i) {
            output[i] = vaxis.dataValueToAxisValue(input[i]);
        }
        return output;
    });

    var equalOrUndefined = function (a, b) {
        return ((a===b) || ((a===undefined) && (b===undefined)));
    };

    this.respondsTo("setOption", function (name, value, min, max) {
        var rendererOpt,
            rendererOpts,
            i;
        if (!this.optionsMetadata[name]) {
            throw new Error("attempt to set unknown renderer option '"+name+"'");
        }
        rendererOpts = this.options()[name]();
        for (i = 0; i < rendererOpts.size(); ++i) {
            if (equalOrUndefined(rendererOpts.at(i).min(), min) &&
                equalOrUndefined(rendererOpts.at(i).max(), max)) {
                rendererOpts.at(i).value(value);
                return;
            }
        }
        // If we get this far, it means we didn't find an existing option in the list with matching min/max
        // settings, so we create a new one and append it to the end of the list:
        rendererOpt = new (this.optionsMetadata[name].type)();
        rendererOpt.value(value);
        rendererOpt.min(min);
        rendererOpt.max(max);
        rendererOpts.add(rendererOpt);
    });

    this.respondsTo("setOptionFromString", function (name, stringValue, stringMin, stringMax) {
        var plot = this.plot(),
            type = this.type(),
            DataValue = require('./data_value.js');

        //
        // Two blocks of code below provides support for the deprecated "dotsize" and "dotcolor"
        // options, which have been replaced by "pointsize" and "pointcolor".  Delete these blocks
        // when removing support for this.
        // 

        // 
        // First block in support of deprecated dotsize/dotcolor options:
        //
        var warning = undefined;
        if (name === "dotsize") {
            name = "pointsize";
            warning = new Warning('deprecated "dotsize" option used for "' + type + '" renderer; use "pointsize" instead');
        } else if (name === "dotcolor") {
            name = "pointcolor";
            warning = new Warning('deprecated "dotcolor" option used for "' + type + '" renderer; use "pointcolor" instead');
        }
        // 
        // End of first block in support of deprecated dotsize/dotcolor options
        //

        var rendererOpt;
        if (!this.optionsMetadata[name]) {
            // If this renderer has no option named "name", bail out immediately.  This should eventually
            // throw an error, but for now we just quietly ignore it, to eliminate error conditions coming
            // from unimplemented options.
            //console.log("WARNING: renderer has no option named '" + name + "'");
            throw new Warning('"' + type + '"' + ' renderer has no option named "' + name + '"');
        }
        rendererOpt = new (this.optionsMetadata[name].type)();
        rendererOpt.parseValue(stringValue, this);
        if (plot && plot.verticalaxis()) {
            if (stringMin !== undefined) {
                rendererOpt.min( DataValue.parse( plot.verticalaxis().type(), stringMin ));
            }
            if (stringMax !== undefined) {
                rendererOpt.max( DataValue.parse( plot.verticalaxis().type(), stringMax ));
            }
        }
        this.setOption(name, rendererOpt.value(), rendererOpt.min(), rendererOpt.max());

        // 
        // Second block in support of deprecated dotsize/dotcolor options:
        //
        if (warning) {
            throw warning;
        }
        // 
        // End of second block in support of deprecated dotsize/dotcolor options:
        //
    });


    this.respondsTo("getOptionValue", function (optionName, /*optional:*/value) {
        var i,
            options,
            optionList;

        options = this.options();
        if (typeof(options[optionName]) !== "function") {
            throw new Error('unknown option "'+optionName+'"');
        }
        optionList = options[optionName]();
        if (!optionList) {
            throw new Error('unknown option "'+optionName+'"');
        }
        //NOTE: options are stored in reverse order; default one is always in the '0' position.
        //  Search through them starting at the END of the list, going backwards!
        for (i = optionList.size()-1; i >= 0; --i) {
            var option = optionList.at(i);
            if (((option.min()===undefined) || (value===undefined) || option.min().le(value)) &&
                ((option.max()===undefined) || (value===undefined) || option.max().gt(value))) {
                return option.value();
            }
        }
        
    });

    // method must be overridden by subclass:
    this.respondsTo("begin", function () {
    });
    // method must be overridden by subclass:
    this.respondsTo("dataPoint", function (point) {
    });
    // method must be overridden by subclass:
    this.respondsTo("end", function () {
    });

});

/*
 * Private list of known renderers.  This list is populated from within individual
 * renderer submodel implementations by calls to Renderer.addType.
 */
rendererList = [];

/*
 * Add a renderer submodel to the list of known renders.  rendererObj should be
 * an object with two properties:
 *    'type'  : the type of the renderer -- a string, which is the value expected
 *              for the type attribute of the mugl <renderer> tag.
 *    'model' : the renderer submodel
 */
Renderer.addType = function (rendererObj) {
    rendererList.push(rendererObj);
};

/*
 * Factory method: create an instance of a renderer submodel based on its type (a string).
 */
Renderer.create = function (type) {
    var i,
        renderer;
    for (i = 0; i < rendererList.length; ++i) {
        if (rendererList[i].type === type) {
            renderer = new (rendererList[i].model)();
            renderer.type(type);
            return renderer;
        }
    }
    throw new Error("Renderer.create: '" + type + "' is not a known renderer type");
    //        throw new Error('Renderer.create: attempt to create a renderer of unknown type');
};

Renderer.declareOptions = function (renderer, OptionsModelName, options) {
    var i,
        OptionsModel,
        optionsMetadata,
        declareOption = function(optionName, optionType) {
            // NOTE: this call to hasMany() has to be in a function here, rather than just
            // being written inline where it is used below, because we need a closure to
            // capture value of options[i].type as optionType, for use in the validation
            // function.  Otherwise, the validator captures the 'options' array and the
            // local loop variable i instead, and evaluates options[i].type when validation
            // is performed!
            OptionsModel.hasMany(optionName).eachOfWhich.validateWith(function (v) {
                return v instanceof optionType;
            });
        };

    OptionsModel    = new jermaine.Model(OptionsModelName, function () {});
    optionsMetadata = {};
    for (i = 0; i < options.length; ++i) {
        declareOption(options[i].name, options[i].type);
        optionsMetadata[options[i].name] = {
            "type"    : options[i].type,
            "default" : options[i]["default"]
        };
    }
    renderer.hasA("options").isImmutable().defaultsTo(function () { return new OptionsModel(); });
    renderer.prototype.optionsMetadata = optionsMetadata;

    renderer.isBuiltWith(function () {
        // populate options with default values stored in options metadata (which was populated by declareOptions):
        var optionsMetadata = this.optionsMetadata,
            opt, ropt;
        for (opt in optionsMetadata) {
            if (optionsMetadata.hasOwnProperty(opt)) {
                ropt = new (optionsMetadata[opt].type)(optionsMetadata[opt]["default"]);
                this.options()[opt]().add( ropt );
            }
        }
    });

};


Renderer.Option = new jermaine.Model("Renderer.Option", function () {
    var DataValue = require('./data_value.js');
    this.hasA("min").which.validatesWith(DataValue.isInstance);
    this.hasA("max").which.validatesWith(DataValue.isInstance);
});


Renderer.RGBColorOption = new jermaine.Model("Renderer.RGBColorOption", function () {
    this.isA(Renderer.Option);
    this.hasA("value").which.validatesWith(function (v) {
        return v instanceof RGBColor || v === null;
    });
    this.isBuiltWith("value");
    this.respondsTo("serializeValue", function () {
        return this.value().getHexString();
    });
    this.respondsTo("parseValue", function (string) {
        this.value( RGBColor.parse(string) );
    });
    this.respondsTo("valueEq", function (value) {
        return this.value().eq(value);
    });

});

Renderer.NumberOption = new jermaine.Model("Renderer.NumberOption", function () {
    this.isA(Renderer.Option);
    this.hasA("value").which.isA("number");
    this.isBuiltWith("value");
    this.respondsTo("serializeValue", function () {
        return this.value().toString();
    });
    this.respondsTo("parseValue", function (string) {
        this.value( parseFloat(string) );
    });
    this.respondsTo("valueEq", function (value) {
        return (this.value()===value);
    });
});

Renderer.DataValueOption = new jermaine.Model("Renderer.DataValueOption", function () {
    this.isA(Renderer.Option);
    this.hasA("value").which.validatesWith(function (value) {
        var DataValue = require('./data_value.js');
        return DataValue.isInstance(value) || value === null;
    });
    this.isBuiltWith("value");
    this.respondsTo("serializeValue", function () {
        return this.value();
    });
    this.respondsTo("valueEq", function (value) {
        return this.value().eq(value);
    });
});

Renderer.VerticalDataValueOption = new jermaine.Model("Renderer.DataValueOption", function () {
    this.isA(Renderer.DataValueOption);
    this.isBuiltWith("value");
    this.respondsTo("parseValue", function (string, renderer) {
        var DataValue = require('./data_value.js');
        this.value( DataValue.parse(renderer.plot().verticalaxis().type(), string) );
    });
    
});

Renderer.HorizontalDataValueOption = new jermaine.Model("Renderer.DataValueOption", function () {
    this.isA(Renderer.DataValueOption);
    this.isBuiltWith("value");
    this.respondsTo("parseValue", function (string, renderer) {
        var DataValue = require('./data_value.js');
        this.value( DataValue.parse(renderer.plot().horizontalaxis().type(), string) );
    });
    
});

Renderer.DataMeasureOption = new jermaine.Model("Renderer.DataMeasureOption", function () {
    this.isA(Renderer.Option);
    this.hasA("value").which.validatesWith(function (value) {
        var DataMeasure = require('./data_measure.js');
        return DataMeasure.isInstance(value) || value === null;
    });
    this.isBuiltWith("value");
    this.respondsTo("serializeValue", function () {
        return this.value();
    });
    this.respondsTo("valueEq", function (value) {
        return this.value().eq(value);
    });
});

Renderer.VerticalDataMeasureOption = new jermaine.Model("Renderer.DataMeasureOption", function () {
    this.isA(Renderer.DataMeasureOption);
    this.respondsTo("parseValue", function (string, renderer) {
        var DataMeasure = require('./data_measure.js');
        this.value( DataMeasure.parse(renderer.plot().verticalaxis().type(), string) );
    });
    
});

Renderer.HorizontalDataMeasureOption = new jermaine.Model("Renderer.DataMeasureOption", function () {
    this.isA(Renderer.DataMeasureOption);
    this.isBuiltWith("value");
    this.respondsTo("parseValue", function (string, renderer) {
        var DataMeasure = require('./data_measure.js');
        this.value( DataMeasure.parse(renderer.plot().horizontalaxis().type(), string) );
    });
    
});

Renderer.Type = Type;

module.exports = Renderer;
