/**
## Number Display Widget

Includes: [Base Mixin](#base-mixin)

A display of a single numeric value.

Examples:

* [Test Example](http://dc-js.github.io/dc.js/examples/number.html)

#### dc.numberDisplay(parent[, chartGroup])
Create a Number Display instance and attach it to the given parent element.

Unlike other charts, you do not need to set a dimension. Instead a valid group object must be provided and valueAccessor that is expected to return a single value.

Parameters:

* parent : string - any valid d3 single selector representing typically a dom block element such as a div or span
* chartGroup : string (optional) - name of the chart group this chart instance should be placed in. Once a chart is placed
   in a certain chart group then any interaction with such instance will only trigger events and redraw within the same
   chart group.

Return:
A newly created number display instance

```js
// create a number display under #chart-container1 element using the default global chart group
var display1 = dc.numberDisplay("#chart-container1");
```

**/
dc.numberDisplay = function (parent, chartGroup) {
    var SPAN_CLASS = 'number-display';
    var _formatNumber = d3.format(".2s");
    var _chart = dc.baseMixin({});
    var _html = {one:"",some:"",none:""};

    // dimension not required
    _chart._mandatoryAttributes(['group']);

    /**
    #### .html({one:"%number record",some:"%number records",none:"empty"}})
    %number will be replaced with the value
    Get or set the string attached to the number and pluralize it according to the value. 
    **/

    _chart.html = function(s) {
        if (!arguments.length) return _html;
        if(s.none)
            _html.none = s.none;//if none available
        else if(s.one)
            _html.none = s.one;//if none not available use one
        else if(s.some)
            _html.none = s.some;//if none and one not available use some
        if(s.one)
            _html.one = s.one;//if one available
        else if(s.some)
            _html.one = s.some;//if one not available use some
        if(s.some)
            _html.some = s.some;//if some available
        else if(s.one)
            _html.some = s.one;//if some not available use one
        return _chart;
    };

    /**
    #### .value()
    Calculate and return the underlying value of the display
    **/

    _chart.value = function () {
        return _chart.data();
    };

    _chart.data(function (group) {
        var valObj = group.value ? group.value() : group.top(1)[0];
        return _chart.valueAccessor()(valObj);
    });

    _chart.transitionDuration(250); // good default

    _chart._doRender = function () {
        var newValue = _chart.value(),
            span     = _chart.selectAll("."+SPAN_CLASS);

        if(span.empty())
            span = span.data([0])
                .enter()
                .append("span")
                .attr("class", SPAN_CLASS);

        span.transition()
            .duration(_chart.transitionDuration())
            .ease('quad-out-in')
            .tween("text", function () {
                var interp = d3.interpolateNumber(this.lastValue || 0, newValue);
                this.lastValue = newValue;
                return function (t) {
                    var html = null, num = _chart.formatNumber()(interp(t));
                    if(newValue===0 && (_html.none!==""))
                        html = _html.none;
                    else if(newValue===1 &&(_html.one!==""))
                        html = _html.one;
                    else if(_html.some!=="")
                        html = _html.some;
                    this.innerHTML = html ? html.replace("%number", num) : num;
                };
            });
    };

    _chart._doRedraw = function(){
        return _chart._doRender();
    };

    /**
    #### .formatNumber([formatter])
    Get or set a function to format the value for the display. By default `d3.format(".2s");` is used.

    **/
    _chart.formatNumber = function (_) {
        if (!arguments.length) return _formatNumber;
        _formatNumber = _;
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};
