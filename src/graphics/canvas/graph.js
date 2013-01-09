window.multigraph.util.namespace("window.multigraph.graphics.canvas", function (ns) {
    "use strict";

    ns.mixin.add(function (ns) {
        var Graph = ns.Graph;

        Graph.respondsTo("render", function (context, width, height) {
            var i;
            context.fillStyle = this.window().bordercolor().getHexString("#");
            var m = this.window().margin().left();
            context.fillRect(m,m,width-2*m,height-2*m);

            var mb = m + this.window().border();

            context.fillStyle = this.background().color().getHexString("#");
            context.fillRect(mb,mb,width-2*mb,height-2*mb);

            if (this.background().img() && this.background().img().src() !== undefined) {
                this.background().img().render(this, context, width, height);
            }

            context.transform(1,0,0,1,this.x0(),this.y0());

            if (this.plotarea().color() !== null) {
                context.save();
                context.fillStyle = this.plotarea().color().getHexString("#");
                context.fillRect(0,0,this.plotBox().width(), this.plotBox().height());
                context.restore();
            }

            if (this.plotarea().border() > 0) {
                var plotareaBorder = this.plotarea().border();
                context.save();
                context.lineWidth = plotareaBorder;
                context.strokeStyle = this.plotarea().bordercolor().getHexString("#");
                context.strokeRect(-plotareaBorder/2, -plotareaBorder/2, this.plotBox().width() + plotareaBorder, this.plotBox().height() + plotareaBorder);
                context.restore();
            }

            for (i=0; i<this.axes().size(); ++i) {
                this.axes().at(i).renderGrid(this, context);
            }


            context.save();
            context.rect(0,0,this.plotBox().width(), this.plotBox().height());
            context.clip();


            for (i=0; i<this.plots().size(); ++i) {
                this.plots().at(i).render(this, context);
            }

            context.restore();

            for (i=0; i<this.axes().size(); ++i) {
                this.axes().at(i).render(this, context);
            }

            this.legend().render(context);

            if (this.title()) {
                this.title().render(context);
            }
        });

    });

});
