/*global describe, it, beforeEach, expect, xit, jasmine */
/*jshint laxbreak:true */

describe("Legend Icon parsing", function () {
    "use strict";

    var Icon = require('../../../src/core/icon.js');

    var $, jqw = require('../../node_jquery_helper.js').createJQuery();
    beforeEach(function() { $ = jqw.$; });

    var JQueryXMLParser;
    beforeEach(function () {
        JQueryXMLParser = require('../../../src/parser/xml/jquery_xml_parser.js')($);
    });


    describe("XML Parsing", function() {
        var xmlString,
            $xml,
            icon,
            heightString = "12",
            widthString = "59",
            borderString = "7";

        
        beforeEach(function () {
            xmlString = ''
                + '<icon'
                +    ' height="' + heightString + '"'
                +    ' width="' + widthString + '"'
                +    ' border="' + borderString + '"'
                +    '/>',
            $xml = JQueryXMLParser.stringToJQueryXMLObj(xmlString);
            icon = Icon.parseXML($xml);
        });

        it("should be able to parse a icon from XML", function () {
            expect(icon).not.toBeUndefined();
            expect(icon instanceof Icon).toBe(true);
        });

        it("should be able to parse a icon from XML and read its 'height' attribute", function () {
            expect(icon.height()).toEqual(parseInt(heightString, 10));
        });

        it("should be able to parse a icon from XML and read its 'width' attribute", function () {
            expect(icon.width()).toEqual(parseInt(widthString, 10));
        });

        it("should be able to parse a icon from XML and read its 'border' attribute", function () {
            expect(icon.border()).toEqual(parseInt(borderString, 10));
        });
    });

    describe("JSON Parsing", function() {
        var json,
            icon,
            height = 12,
            width = 59,
            border = 7;
        
        beforeEach(function () {
            json = { "height" : height, "width" : width, "border" : border };
            icon = Icon.parseJSON(json);
        });

        it("should be able to parse a icon from JSON", function () {
            expect(icon).not.toBeUndefined();
            expect(icon instanceof Icon).toBe(true);
        });

        it("should be able to parse a icon from JSON and read its 'height' attribute", function () {
            expect(icon.height()).toEqual(height);
        });

        it("should be able to parse a icon from JSON and read its 'width' attribute", function () {
            expect(icon.width()).toEqual(width);
        });

        it("should be able to parse a icon from JSON and read its 'border' attribute", function () {
            expect(icon.border()).toEqual(border);
        });
    });

});
