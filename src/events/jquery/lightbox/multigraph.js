window.multigraph.util.namespace("window.multigraph.events.jquery.lightbox", function (ns) {
    "use strict";

    ns.mixin.add(function (ns) {

        ns.core.Multigraph.hasA("clone").which.defaultsTo(false);
        ns.core.Multigraph.hasA("originalDiv");
        ns.core.Multigraph.hasAn("overlay");

        (function ($) {
            var methods = {
                open : function () {
                    var clone = this.clone(true);
                    var multigraph = this.data("multigraph").multigraph;
                    multigraph.done(function (m) {
                        m.overlay(
                            $("<div style=\"position: fixed; left: 0px; top: 0px; height: 100%; min-height: 100%; width: 100%; z-index: 9999; background: black; opacity: 0.5;\"></div>").appendTo("body")
                        );
                        var r = computeRatio(m.width(), m.height());
                        var w = parseInt(m.width() * r, 10);
                        var h = parseInt(m.height() * r, 10);
                        $(clone).css("position", "fixed")
                            .css("z-index", 9999);

                        scaleAndPositionElement(clone, w, h);
                        $("body").append(clone);
                        m.originalDiv(m.div())
                            .div(clone);
                        m.initializeSurface();
                        m.resizeSurface(w, h);
                        m.width(w);
                        m.height(h);
                        m.busySpinner().remove();
                        m.busySpinner($('<div style="position: absolute; left:5px; top:5px;"></div>')
                                         .appendTo($(m.div()))
                                         .busy_spinner());
                        m.render();
                        
                    });
                    $(clone).append(
                        $("<img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkY4OUE4QUE2MDEyMTFFMkFBMEM4Q0Y2RTlFNkI4QzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkY4OUE4QUI2MDEyMTFFMkFBMEM4Q0Y2RTlFNkI4QzEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2Rjg5QThBODYwMTIxMUUyQUEwQzhDRjZFOUU2QjhDMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2Rjg5QThBOTYwMTIxMUUyQUEwQzhDRjZFOUU2QjhDMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvXC/ukAAAcjSURBVHjaxFlpTFVX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\" style=\"position: absolute; right: -9px; top: -8px; width:44px; height:44px; z-index: 10000;\" alt=\"close\"/>").click(function () {
                            clone.lightbox("close");
                        })
                    );
                    $(clone).data("lightbox").opened = true;

                    $(clone).data("lightbox").resizeHandler = function () {
                        clone.lightbox("resize");
                    };

                    $(window).on("resize", $(clone).data("lightbox").resizeHandler);
                    $(window).on("orientationchange", $(clone).data("lightbox").resizeHandler);
                },
                
                close : function () {
                    this.data("lightbox").opened = false;
                    var multigraph = this.data("multigraph").multigraph;
                    multigraph.done(function (m) {
                        m.overlay().remove();
                        m.div().remove();
                        m.div(m.originalDiv())
                            .width($(m.div()).width())
                            .height($(m.div()).height())
                            .busySpinner($('<div style="position: absolute; left:5px; top:5px;"></div>')
                                         .appendTo($(m.div()))
                                         .busy_spinner()
                                        );

                        m.initializeSurface();
                        m.render();
                    });
                    $(window).off("resize", this.data("lightbox").resizeHandler);
                    $(window).off("orientationchange", this.data("lightbox").resizeHandler);
                },
                
                resize : function () {
                    var multigraph = this.data("multigraph").multigraph;
                    multigraph.done(function (m) {
                        var r = computeRatio(m.width(), m.height());
                        var w = parseInt(m.width() * r, 10);
                        var h = parseInt(m.height() * r, 10);

                        scaleAndPositionElement(m.div(), w, h);

                        m.resizeSurface(w, h);

                        m.width(w);
                        m.height(h);
                        m.render();
                    });
                },

                toggle : function () {
                    if ($(this).data("lightbox").opened === true) {
                        $(this).lightbox("close");
                    } else {
                        $(this).lightbox("open");
                    }
                    return this;
                },

                init : function (options) {
                    return this.each(function() {
                        var $this = $(this),
                        data = $this.data("lightbox");
                        if ( !data ) {
                            $this.data("lightbox", {
                                opened : false
                            });
                        }
                        return this;
                    });
                }
            };
            
            $.fn.lightbox = function (method) {
                if ( methods[method] ) {
                    return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
                } else if ( typeof method === "object" || !method ) {
                    return methods.init.apply( this, arguments );
                } else {
                    $.error( "Method " +  method + " does not exist on jQuery.lightbox" );
                    return null;
                }
            };

        }(window.multigraph.jQuery));

        var computeRatio = function (originalWidth, originalHeight) {
            var wr = (originalWidth > 0) ? window.innerWidth / originalWidth : 1;
            var hr = (originalHeight > 0) ? window.innerHeight / originalHeight : 1;
            var r = Math.min(wr, hr);
            return r;
        };

        var scaleAndPositionElement = function (elem, width, height) {
            window.multigraph.jQuery(elem)
                .css("width", width + "px")
                .css("height", height + "px")
                .css("left", ((window.innerWidth  - width) / 2) + "px")
                .css("top", ((window.innerHeight - height) / 2) + "px");
        };

    });

});
