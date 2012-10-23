/*global describe, it, beforeEach, expect, xit, jasmine */

describe("Data Normalizer", function () {
    "use strict";

    var Data = window.multigraph.core.Data,
        ArrayData = window.multigraph.core.ArrayData,
        CSVData = window.multigraph.core.CSVData,
        WebServiceData = window.multigraph.core.WebServiceData,
        DataVariable = window.multigraph.core.DataVariable,
        DataValue = window.multigraph.core.DataValue,
        NumberValue = window.multigraph.core.NumberValue,
        DatetimeValue = window.multigraph.core.DatetimeValue,
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        data,
        valuesdata,
        csvdata,
        servicedata,
        row, numValueRow, col,
        rawData, numberValueData;


    var Axis = window.multigraph.core.Axis,
        Title = window.multigraph.core.AxisTitle,
        Labeler = window.multigraph.core.Labeler,
        NumberMeasure = window.multigraph.core.NumberMeasure,
        DatetimeMeasure = window.multigraph.core.DatetimeMeasure,
        haxis,
        vaxis;
    
    beforeEach(function () {
        window.multigraph.normalizer.mixin.apply(window.multigraph.core);
        variable1 = new DataVariable("ax", 0, DataValue.NUMBER);
        variable2 = new DataVariable("ay", 1, DataValue.NUMBER);
        variable3 = new DataVariable("ay1", 2, DataValue.NUMBER);
        variable4 = new DataVariable("ay2", 3, DataValue.NUMBER);
        variable5 = new DataVariable("ay3", 4, DataValue.NUMBER);
        haxis = (new Axis(Axis.HORIZONTAL)).id("x");
        vaxis = (new Axis(Axis.VERTICAL)).id("y");

        numberValueData = [];

        rawData = [[1900,-0.710738,-0.501011,-0.291284],
                   [1901,-0.709837,-0.488806,-0.267776],
                   [1902,-0.738885,-0.505620,-0.272355],
                   [1903,-0.822017,-0.591622,-0.361227],
                   [1904,-0.828376,-0.562089,-0.295802],
                   [1905,-0.748973,-0.544255,-0.339537],
                   [1906,-0.670167,-0.523723,-0.377279],
                   [1907,-0.717963,-0.510749,-0.303535],
                   [1908,-0.757014,-0.477469,-0.197924]];


        for (row = 0; row < rawData.length; ++row) {
            numValueRow = [];
            for (col = 0; col < rawData[row].length; ++col) {
                numValueRow.push(new NumberValue(rawData[row][col]));
            }
            numberValueData.push(numValueRow);
        }
    });

    it("should exist for each data type", function () {
        data = new Data();
        valuesdata = new ArrayData();
        csvdata = new CSVData();
        servicedata = new WebServiceData();

        expect(data.normalize).not.toBeUndefined();
        expect(typeof(data.normalize)).toEqual("function");
        expect(valuesdata.normalize).not.toBeUndefined();
        expect(typeof(valuesdata.normalize)).toEqual("function");
        expect(csvdata.normalize).not.toBeUndefined();
        expect(typeof(csvdata.normalize)).toEqual("function");
        expect(servicedata.normalize).not.toBeUndefined();
        expect(typeof(servicedata.normalize)).toEqual("function");
    });

    it("should throw an error if csv or web service data call it without any variables", function () {
        csvdata = new CSVData();
        servicedata = new WebServiceData();

        expect(function () {
            csvdata.normalize();
        }).toThrow("Data Normalization: Data gotten from csv and web service sources require variables to be specified in the mugl.");

        expect(function () {
            servicedata.normalize();
        }).toThrow("Data Normalization: Data gotten from csv and web service sources require variables to be specified in the mugl.");

        csvdata = new CSVData([variable1,variable2], "http://example.com");
        servicedata = new WebServiceData([variable1,variable2], "http://example.com");

        expect(function () {
            csvdata.normalize();
        }).not.toThrow("Data Normalization: Data gotten from csv and web service sources require variables to be specified in the mugl.");

        expect(function () {
            servicedata.normalize();
        }).not.toThrow("Data Normalization: Data gotten from csv and web service sources require variables to be specified in the mugl.");        
    });

    describe("handling missing variables with 'values' tags", function () {
        it("should create a variable for each column that doen't have one", function () {
            valuesdata = new ArrayData([], numberValueData);
            expect(valuesdata.columns().size()).toEqual(0);
            valuesdata.normalize();
            expect(valuesdata.columns().size()).toEqual(4);

            valuesdata = new ArrayData([variable1, variable3], numberValueData);
            expect(valuesdata.columns().size()).toEqual(2);
            valuesdata.normalize();
            expect(valuesdata.columns().size()).toEqual(4);

        });

        it("should insert variables for each column which doen't have one in the correct location", function () {
            valuesdata = new ArrayData([], numberValueData);
            expect(valuesdata.columns().size()).toEqual(0);
            valuesdata.normalize();
            expect(valuesdata.columns().size()).toEqual(4);
            expect(valuesdata.columns().at(0).id()).toEqual("x");
            expect(valuesdata.columns().at(0).column()).toEqual(0);
            expect(valuesdata.columns().at(1).id()).toEqual("y");
            expect(valuesdata.columns().at(1).column()).toEqual(1);
            expect(valuesdata.columns().at(2).id()).toEqual("y1");
            expect(valuesdata.columns().at(2).column()).toEqual(2);
            expect(valuesdata.columns().at(3).id()).toEqual("y2");
            expect(valuesdata.columns().at(3).column()).toEqual(3);

            valuesdata = new ArrayData([variable1, variable3], numberValueData);
            expect(valuesdata.columns().size()).toEqual(2);
            expect(valuesdata.columns().at(0)).toBe(variable1);
            expect(valuesdata.columns().at(1)).toBe(variable3);
            valuesdata.normalize();
            expect(valuesdata.columns().size()).toEqual(4);
            expect(valuesdata.columns().at(0)).toBe(variable1);
            expect(valuesdata.columns().at(1).id()).toEqual("y");
            expect(valuesdata.columns().at(1).column()).toEqual(1);
            expect(valuesdata.columns().at(2)).toBe(variable3);
            expect(valuesdata.columns().at(3).id()).toEqual("y2");
            expect(valuesdata.columns().at(3).column()).toEqual(3);

        });

        it("should insert variables for each column which doen't have one in the correct location with the correct defaults", function () {
            valuesdata = new ArrayData([], numberValueData);
            expect(valuesdata.columns().size()).toEqual(0);
            valuesdata.normalize();
            expect(valuesdata.columns().size()).toEqual(4);
            expect(valuesdata.columns().at(0).id()).toEqual("x");
            expect(valuesdata.columns().at(0).column()).toEqual(0);
            expect(valuesdata.columns().at(1).id()).toEqual("y");
            expect(valuesdata.columns().at(1).column()).toEqual(1);
            expect(valuesdata.columns().at(2).id()).toEqual("y1");
            expect(valuesdata.columns().at(2).column()).toEqual(2);
            expect(valuesdata.columns().at(3).id()).toEqual("y2");
            expect(valuesdata.columns().at(3).column()).toEqual(3);

            valuesdata = new ArrayData([variable1, variable3], numberValueData);
            expect(valuesdata.columns().size()).toEqual(2);
            expect(valuesdata.columns().at(0)).toBe(variable1);
            expect(valuesdata.columns().at(1)).toBe(variable3);
            valuesdata.normalize();
            expect(valuesdata.columns().size()).toEqual(4);
            expect(valuesdata.columns().at(0)).toBe(variable1);
            expect(valuesdata.columns().at(1).id()).toEqual("y");
            expect(valuesdata.columns().at(1).column()).toEqual(1);
            expect(valuesdata.columns().at(2)).toBe(variable3);
            expect(valuesdata.columns().at(3).id()).toEqual("y2");
            expect(valuesdata.columns().at(3).column()).toEqual(3);

        });

    });

    describe("default values", function () {
        it("should insert the proper value for 'column'", function () {
            variable2 = new DataVariable("y");
            variable4 = new DataVariable("y2");

            data = new Data([variable1, variable2, variable3, variable4]);
            data.normalize();
            expect(data.columns().at(0).column()).toEqual(0);
            expect(data.columns().at(1).column()).toEqual(1);
            expect(data.columns().at(2).column()).toEqual(2);
            expect(data.columns().at(3).column()).toEqual(3);
            expect(data.columns().size()).toEqual(4);

            variable1 = new DataVariable("x");
            variable2 = new DataVariable("y");
            variable4 = new DataVariable("y2");
            data = new Data([variable5, variable4, variable2, variable3, variable1]);
            data.normalize();
            expect(data.columns().at(0).column()).toEqual(0);
            expect(data.columns().at(1).column()).toEqual(1);
            expect(data.columns().at(2).column()).toEqual(2);
            expect(data.columns().at(3).column()).toEqual(3);
            expect(data.columns().at(4).column()).toEqual(4);
            expect(data.columns().size()).toEqual(5);

        });

        it("should insert the proper value for 'type'", function () {
            variable1 = new DataVariable("ax", 0);
            variable2 = new DataVariable("ay", 1);
            variable3 = new DataVariable("y1", 2, DataValue.DATETIME);
            variable4 = new DataVariable("y2", 3, DataValue.DATETIME);

            data = new Data([variable1, variable2, variable3, variable4]);
            data.normalize();
            expect(data.columns().at(0).type()).toEqual(DataValue.NUMBER);
            expect(data.columns().at(1).type()).toEqual(DataValue.NUMBER);
            expect(data.columns().at(2).type()).toEqual(DataValue.DATETIME);
            expect(data.columns().at(3).type()).toEqual(DataValue.DATETIME);
            expect(data.columns().size()).toEqual(4);

        });

        it("should insert the proper value for 'missingvalue'", function () {
            var missingvalue = DataValue.parse(DataValue.NUMBER, 12);

            variable1 = new DataVariable("ax", 0);
            variable2 = new DataVariable("ay", 1);
            variable3 = new DataVariable("y1", 2, DataValue.DATETIME);
            variable4 = new DataVariable("y2", 3, DataValue.DATETIME);

            variable2.missingvalue(missingvalue);

            data = new Data([variable1, variable2, variable3, variable4]);
            expect(data.columns().at(0).missingvalue()).toBeUndefined();
            expect(data.columns().at(1).missingvalue()).toBe(missingvalue);
            expect(data.columns().at(2).missingvalue()).toBeUndefined();
            expect(data.columns().at(3).missingvalue()).toBeUndefined();
            data.normalize();
            expect(data.columns().at(0).missingvalue()).toBeUndefined();
            expect(data.columns().at(1).missingvalue()).toBe(missingvalue);
            expect(data.columns().at(2).missingvalue()).toBeUndefined();
            expect(data.columns().at(3).missingvalue()).toBeUndefined();
            expect(data.columns().size()).toEqual(4);

            data = new Data([variable1, variable2, variable3, variable4]);
            data.defaultMissingvalue("0");
            expect(data.columns().at(0).missingvalue()).toBeUndefined();
            expect(data.columns().at(1).missingvalue()).toBe(missingvalue);
            expect(data.columns().at(2).missingvalue()).toBeUndefined();
            expect(data.columns().at(3).missingvalue()).toBeUndefined();
            data.normalize();
            expect(data.columns().at(0).missingvalue()).not.toBeUndefined();
            expect(data.columns().at(0).missingvalue() instanceof NumberValue).toBe(true);
            expect(data.columns().at(0).missingvalue().getRealValue()).toBe(0);
            expect(data.columns().at(1).missingvalue()).toBe(missingvalue);
            expect(data.columns().at(2).missingvalue()).not.toBeUndefined();
            expect(data.columns().at(2).missingvalue() instanceof DatetimeValue).toBe(true);
            expect(data.columns().at(2).missingvalue().getRealValue()).toBe(0);
            expect(data.columns().at(3).missingvalue()).not.toBeUndefined();
            expect(data.columns().at(3).missingvalue() instanceof DatetimeValue).toBe(true);
            expect(data.columns().at(3).missingvalue().getRealValue()).toBe(0);
            expect(data.columns().size()).toEqual(4);

        });

        it("should insert the proper value for 'missingop'", function () {
            var missingop = DataValue.parseComparator("gt");

            variable1 = new DataVariable("ax", 0);
            variable2 = new DataVariable("ay", 1);
            variable3 = new DataVariable("y1", 2, DataValue.DATETIME);
            variable4 = new DataVariable("y2", 3, DataValue.DATETIME);

            variable2.missingop(missingop);

            data = new Data([variable1, variable2, variable3, variable4]);
            expect(data.columns().at(0).missingop()).toBeUndefined();
            expect(data.columns().at(1).missingop()).toBe(missingop);
            expect(data.columns().at(2).missingop()).toBeUndefined();
            expect(data.columns().at(3).missingop()).toBeUndefined();
            data.normalize();
            expect(data.columns().at(0).missingop()).toBe(DataValue.EQ);
            expect(data.columns().at(1).missingop()).toBe(missingop);
            expect(data.columns().at(2).missingop()).toBe(DataValue.EQ);
            expect(data.columns().at(3).missingop()).toBe(DataValue.EQ);
            expect(data.columns().size()).toEqual(4);

        });

    });

});