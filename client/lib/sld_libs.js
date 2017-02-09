/**
 * SLD_libs - the generic library for sld chart drawing
 *
 * @author    Jie Zheng
 * @copyright (c) GISTIC Research Inc.
 * @date      April 1, 2015
 * @version   v1.0
 */
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

Array.prototype.remove = function (index) {
    return this.splice(index, 1);
}

Array.prototype.append = function (array) {
    return this.push.apply(this, array)
}
Array.prototype.unique = function()
{
    this.sort();
    var re=[this[0]];
    for(var i = 1; i < this.length; i++)
    {
        if( this[i].label !== re[re.length-1].label)
        {
            re.push(this[i]);
        }
    }
    return re;
}

String.prototype.startWith = function (compareStr) {
    return this.indexOf(compareStr) == 0;
}

var sLD_chart = function () {

    var chart = {};
    var layers = new Array(); //数据叠加
    var displayLayers = [];
    var rangeArray = []; //路径最大最小值存储
    var url1 = "http://geosemantic.org/OM3-L.png";
    var url2 = "http://geosemantic.org/R.png";
    var url3 = "http://geosemantic.org/W11-3.png";
    var margin = {
            top: 0,
            right: 0,
            bottom: 30,
            left: 0
        }, //上下左右的间隔
        margin2 = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },

        lbUrl = 'http://72.215.195.71:9012/api/data/', //服务请求的地址
        labelStyle = "T",
        yIndexArray = {},
        RouteList = {},
        routeID,
        iconSize = 45, //图标的大小
        rectHight = 30, //条状layer的宽度
        tips = 6, //鼠标放上去后,tip离原始目标的距离
        gap = 20, //间隔因子
        step = 1, //加载数据的长度 单位 公里
        symbolgap = 0, //symbol的画法是往上下都可以，所以我们要手动的做一个间隔
        yIndex = 0,
        RouteY = 165,
        RouteYLable = 10,
        CrashesY = 60,
        AADTY = 90,
        SpeedlimitY = 120,
        CulvertsY = 150,
        Xmax = 10,
        Xmin = 0,
        Ymax = 250,
        Ymin = 0,
        data = [],
        xScale = d3.scale.linear().domain([0, 250]).range([0, 900]),
        x = d3.scale.linear().domain([0, 250]).range([0, 900]),
        y = d3.scale.linear().domain([0, 400 / 2]).range([400, 0]),
        y2 = d3.scale.linear().domain([0, 160 / 2]).range([160, 0]),
        width, //Map的宽
        height, //Map的高
        width2, //stickMap的宽
        height2, //stickMap的高
        xAxis,
        yAxis,
        xAxis2,
        yAxis2,
        zoom,
        stickmap,
        svg,
        svg2,
        map,
        canvas,
        lastId = '', //last select id
        div;


    chart.renderLayer = function (el) { // <-2A

        if (!svg) {
            svg = d3.select(el).append("svg")
                .attr("width", chart.width)
                .attr("height", chart.height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .on("mousemove", move);
            svg.append("rect").attr("width", chart.width).attr("height", chart.height).attr("fill", "#ddd");

            renderAxesSvg(svg);

            svg2 = svg.append("svg").attr("width", chart.width).attr("height", chart.height);
        }
    };


    chart.renderMap = function (el) { // <-2A
        if (!stickmap) {
            stickmap = d3.select(el)
                .append("svg")
                .attr("width", chart.width)
                .attr("height", chart.height2 + margin2.top + margin2.bottom)
                .append("g")
                .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
                .on("mousemove", move);
            stickmap.append("rect")
                .attr("width", chart.width)
                .attr("height", chart.height2)
                .attr("fill", "#ddd");

            renderAxesStickmap(stickmap);

            map = stickmap.append("svg")
                .attr("width", chart.width)
                .attr("height", height);

            div = d3.select(el).append("div")   // declare the properties for the div used for the tooltips
                .attr("class", "tooltip")               // apply the 'tooltip' class
                .style("opacity", 0);
        }

    };


    // function renderAxesSvg(svg) {
    //     xAxis = d3.svg.axis() //X轴的尺度
    //         .scale(xScale)
    //         .orient("bottom")
    //         .tickSize(-height)
    //         .ticks(4);
    //     svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

    // }

    function renderAxesSvg(svg) {
        xScale = d3.scale.linear().domain([0, 250]).range([0, chart.width]);
        y = d3.scale.linear().domain([0, chart.height / 2]).range([chart.height, 0]);
        xAxis = d3.svg.axis() //X轴的尺度
            .scale(xScale)
            .orient("bottom")
            .tickSize(-chart.height)
            .ticks(4);
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + chart.height + ")").call(xAxis);

    }


    //获取stickmap的axis
    function renderAxesStickmap(stickmap) {
        y2 = d3.scale.linear().domain([0, (chart.height2)]).range([chart.height2, 0]);
        RouteY = chart.height2 / 2
        xScale = d3.scale.linear().domain([0, 250]).range([0, chart.width])
        xAxis2 = d3.svg.axis() //X轴的尺度 stickmap
            .scale(xScale)
            .orient("bottom")
            .ticks(4)
            .tickSize(-chart.height2);

        yAxis2 = d3.svg.axis()
            .scale(y2)
            .orient("left")
            .ticks(0)
            .tickSize(-chart.width);

        stickmap.append("g")
            .attr("class", "x axis2")
            .attr("transform", "translate(0," + chart.height2 + ")")
            .call(xAxis2);

        stickmap.append("g")
            .attr("class", "y axis2")
            .call(yAxis2);

    }

    function move(d, i) { //添加红线，随时跟踪
        var coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];
        stickmap.select('#zzzjjj').remove();
        stickmap.append("line").attr("id", "zzzjjj").attr("x1", x - 1).attr("y1", 0).attr("x2", x - 1)
            .attr("y2", chart.height2).attr("stroke", "red").attr("stroke-width", 1);
        svg.select('#zzjj').remove();
        svg.append("line").attr("id", "zzjj").attr("x1", x - 1)
            .attr("y1", 0).attr("x2", x - 1).attr("y2", chart.height - 15).attr("stroke", "red").attr("stroke-width", 1);
        svg.select('#zzjjl').remove();
        svg.append("text").attr("id", "zzjjl").attr("x", x).attr("y", chart.height - 2)
            .attr("text-anchor", "middle").attr("font-family", "sans-serif")
            .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "red")
            .text(d3.round(xScale.invert(x), 2));

    }


    chart.initRoute = function (_routeID, _startMP, _endMP, data) {
        if ((_startMP < 0) || (_endMP < 0)) {
            console.log("error");
            alert("error");
            return null;
        }
        Xmin = parseFloat(_startMP);
        Xmax = parseFloat(_endMP);
        routeID = _routeID;

        xScale = d3.scale.linear().domain([Xmin, Xmax]).range([0, chart.width]);
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-chart.height);

        // .tickSize(-width);
        xAxis2 = d3.svg.axis() //X轴的尺度 stickmap
            .scale(xScale).orient("bottom").tickSize(-chart.height2);

        //console.log(stickmap);

        stickmap.select(".x.axis2").call(xAxis2);
        svg.select(".x.axis").call(xAxis);

        zoom = d3.behavior.zoom()
            .x(xScale)
            .scaleExtent([1, 20])
            .on("zoom", zoomed);
        svg.call(zoom);
        stickmap.call(zoom);
        rangeArray.push(Xmax + step);
        rangeArray.push(Xmin - step);
        console.log(y2(RouteY));

        map.append('g')
            .selectAll("rect")
            .data(data).enter()
            .append("line")
            .attr('class', 'Route')
            .attr("x1", function (d, i) {
                return xScale(d.start);
            }).attr("y1", y2(RouteY)).attr("x2", function (d, i) {
                return xScale(d.end);
            }).attr("y2", y2(RouteY))
            .attr('stroke-dasharray', function (d, i) {
                if (d.dasharray == 'yes') {
                    return "10, 5"
                } else {
                    return null
                }
                ;
            })
            .attr("stroke", "white")
            .attr("stroke-width", 9);
    }

    chart.updateRoute = function (_routeID, _startMP, _endMP) {
        if ((_startMP < 0) || (_endMP < 0)) {
            console.log("error");
            alert("error");
            return null;
        }
        Xmin = parseFloat(_startMP);
        Xmax = parseFloat(_endMP);
        routeID = _routeID;

        xScale = d3.scale.linear().domain([Xmin, Xmax]).range([0, chart.width]);
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-chart.height);

        // .tickSize(-width);
        xAxis2 = d3.svg.axis() //X轴的尺度 stickmap
            .scale(xScale).orient("bottom").tickSize(-chart.height2);

        //console.log(stickmap);

        stickmap.select(".x.axis2").call(xAxis2);
        svg.select(".x.axis").call(xAxis);

        zoom = d3.behavior.zoom()
            .x(xScale)
            .scaleExtent([1, 20])
            .on("zoom", zoomed);
        svg.call(zoom);
        stickmap.call(zoom);
        rangeArray.push(Xmax + step);
        rangeArray.push(Xmin - step);
        d3.json(lbUrl + "GetRouteLog").header("Content-Type", "application/json").post(JSON.stringify({
                customerID: 1,
                routeID: _routeID,
                startMP: Xmin - step,
                endMP: Xmax + step
            }),
            function (error, data) {
                chart.genRoute(data);
            });


    }

    function zoomed() {

        console.log("max : " + parseFloat(xScale.invert(chart.width)));

        console.log("min : " + (parseFloat(Xmax) + step));

        //displayLayers = angular.element(this).scope().getGlobeData();
        var elem = angular.element(document.querySelector('[data-ng-app]'));
        var injector = elem.injector();
        var $rootScope = injector.get('$rootScope');
        $rootScope.$apply(function () {
            $rootScope.testlog('dddddd');
        });

        if (parseFloat(xScale.invert(chart.width)) > (parseFloat(Xmax) + step)) {//move right
            Xmin = Xmin + step;
            Xmax = Xmax + step;

            angular.element(this).scope().startMP = Xmin;
            angular.element(this).scope().endMP = Xmax;

            //$("#startMP").prop("value", Xmin);
            //$("#endMP").prop("value", Xmax);


            chart.updateRoute(routeID, Xmin, Xmax);
            for (var i = 0; i < layers.length; i++) {
                yIndex = (chart.height) / 2 - ((i + 1) * (gap + rectHight / 4));
                asyncGetData(layers[i].layerName, layers[i].symbolColumn, yIndex, routeID, Xmin + step, Xmax + step, layers, i,angular.element(this).scope());

            }
            rangeArray.push(Xmax + step + step);

        }
        else if (parseFloat(xScale.invert(0)) < (parseFloat(Xmin) - step)) { //move left
            Xmin = Xmin - step;
            Xmax = Xmax - step;

            //$("#startMP").prop("value", Xmin);
            //$("#endMP").prop("value", Xmax);

            chart.updateRoute(routeID, Xmin, Xmax);
            for (var i = 0; i < layers.length; i++) {
                yIndex = (chart.height) / 2 - ((i + 1) * (gap + rectHight / 4));
                asyncGetData(layers[i].layerName, layers[i].symbolColumn, yIndex, routeID, Xmin - step, Xmax - step, layers, i,angular.element(this).scope());
                //var data = layers[i].data;
                //angular.element(this).scope().renderTable("tablePanel", data, "", "", parseFloat(xScale.invert(0)), parseFloat(xScale.invert(chart.width))); //这里控制在范围内的数据才显示

            }

            rangeArray.push(Xmin - step - step);i


        }
        else {
            //如果只是本范围内的缩放，则不新加数据，只修改现有数据位置
            svg.select(".x.axis").call(xAxis);
            stickmap.select(".x.axis2").call(xAxis2);

            stickmap.selectAll("path.dot")
                .attr("transform",
                function (d) {
                    if (d.eventName == 'OffRamp' || d.eventName == 'OnRamp') {
                        return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                    } else if (d.eventName == 'Milepost') {
                        return "translate(" + xScale(d.startMP) + "," + y2(tips * 3) + ")";
                    } else if (d.eventName.indexOf("StreetFull") > 0) {
                        return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                    } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                        return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips * 4) + ")";
                    } else {
                        return "translate(" + xScale(d.startMP) + "," + y2(RouteY) + ")";
                    }
                });


            map.selectAll(".Route").attr({
                'x1': function (d) {
                    return xScale(d.start);
                },
                //利用尺ß度算出圓心x位置
                'x2': function (d) {

                    return xScale(d.end);
                },
            });

            console.log('1----->' + parseFloat(xScale.invert(chart.width)));
            console.log('2----->' + parseFloat(xScale.invert(0)));


            for (var j = 0; j < layers.length; j++) {

                var metaData = layers[j];
                if (metaData.layerName == '') {
                    break;
                }
                var data = layers[j].data;
                angular.element(this).scope().renderTable("tablePanel", data, "", "", parseFloat(xScale.invert(0)), parseFloat(xScale.invert(chart.width))); //这里控制在范围内的数据才显示


                svg.selectAll("path." + metaData.layerName+"_"+metaData.symbolColumn)
                    .each(function (d) {
                        var thisGroup = d3.select(this);
                        if (d.feature_type.startWith('P') || (d.feature_type.startWith('L') && d.startMP == d.endMP)) { //判断是点还是线 这里有个特殊的处理，如果是L,开始和结束是同一个位子，我们按点来处理

                            thisGroup.attr("transform",
                                function (d) {
                                    return "translate(" + xScale(d.startMP) + "," + d3.select(this).attr("cy") + ")";
                                })
                                .attr("cx",
                                function (d) {
                                    return xScale(d.startMP);
                                })
                        } else {                          //如果是线
                            thisGroup.attr("d", rightRoundedRect(xScale(d.startMP), d3.select(this).attr("cy"), xScale(d.endMP) - xScale(d.startMP), rectHight, 0))
                                .attr("fill",
                                function (d) {
                                    return d.color
                                });
                        }

                    });


                svg.selectAll("." + metaData.layerName+"_"+metaData.symbolColumn + "_LABEL")
                    .attr("x",
                    function (d) {


                        //if (d.endMP <= Xmin) {
                        //    return xScale(d.endMP);
                        //} else if (d.startMP < Xmin && Xmax < d.endMP) {
                        //    // console.log(d)
                        //    return xScale(Xmin + (Xmax - Xmin) / 2);
                        //} else if (d.startMP < Xmin && Xmin < d.endMP && d.endMP < Xmax) {
                        //    // console.log(d)
                        //    return xScale(Xmin + (d.endMP - Xmin) / 2);
                        //} else if (d.startMP > Xmin && Xmax > d.endMP) {
                        //    // console.log(d)
                        //    return xScale(d.startMP + (d.endMP - d.startMP) / 2);
                        //} else if (d.startMP > Xmin && Xmax < d.endMP && d.startMP < Xmax) {
                        //    return xScale(d.startMP + (Xmax - d.startMP) / 2);
                        //} else if (d.startMP >= Xmax) {
                        //    return xScale(d.startMP);
                        //}


                        if (xScale.invert(0) < d.startMP) {
                            // console.log(xScale.invert(width/2+(d.startMP-xScale.invert(0))));
                            return xScale(d.startMP + (xScale.invert(chart.width) - d.startMP) / 2);
                        }
                        if (xScale.invert(chart.width) > d.endMP) {
                            // return xScale(d.startMP+(xScale.invert(width)-d.startMP)/2);
                            return xScale(xScale.invert(0) + (d.endMP - xScale.invert(0)) / 2);
                            // return xScale(d.endMP);

                        } else {
                            return xScale.invert(chart.width / 2);
                        }

                    });


                svg2.selectAll("." + metaData.layerName +"_"+metaData.symbolColumn+ "_TIPS")
                    .attr("x",
                    function (d) {
                        return xScale(d.startMP);
                    })

                svg2.selectAll("." + metaData.layerName +"_"+metaData.symbolColumn+ "_IMG")
                    .attr("x",
                    function (d) {
                        return xScale(d.startMP) - 18;
                    })

                //}


            }


        }

    }

    chart.addRoute = function (data) {

        var key = function (d) {
            return d.startMP;
        };

        map.append('g').selectAll("path.dot").data(data, key).enter().append("svg:path").attr("class", "dot")
            .attr("stroke", function (d, i) {
                if (d.eventName.indexOf("StreetFull") > 0) {
                    return "white";
                } else {
                    return d.color;
                }

            })
            .attr("stroke-width", function (d, i) {
                if (d.eventName.indexOf("StreetFull") > 0 || d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "4px";
                } else {
                    return "2px";
                }
            })
            .attr("transform",
            function (d) {
                if (d.eventName == 'OffRamp' || d.eventName == 'OnRamp') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + y2(tips * 3) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips * 4) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY) + ")";
                }

            }).attr("d", d3.svg.symbol().type(function (d) {
                return d.eventName;
            })).on("mouseover",
            function (d) {
                var xPosition = xScale(d.startMP) + tips * 2
                map.append("text")
                    .attr("id", "tooltip11")
                    .attr("x", xPosition)
                    .attr("y", y2(RouteY + RouteYLable))
                    .attr("text-anchor", "right")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .attr("fill", "red")
                    .text(d.description);

            }).on("mouseout",
            function () {
                d3.select("#tooltip11").remove();
            });


        stickmap.selectAll("path.dot")
            .attr("transform",
            function (d) {
                if (d.eventName == 'OffRamp' || d.eventName == 'OnRamp') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + y2(tips * 3) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips * 4) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY) + ")";
                }
            })

    }


    chart.updateSize = function () {


        xScale = d3.scale.linear().domain([Xmin, Xmax]).range([0, chart.width]);
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-chart.height);
        xAxis2 = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-chart.height2);
        stickmap.select(".x.axis2").call(xAxis2);
        svg.select(".x.axis").attr("transform", "translate(0," + chart.height + ")").call(xAxis);

        zoom = d3.behavior.zoom()
            .x(xScale)
            .scaleExtent([1, 20])
            .on("zoom", zoomed);
        svg.call(zoom);
        stickmap.call(zoom);

        //zoomed();

    };

    chart.genRouteInit = function (data, _startMP, _endMP) {


        Xmin = parseFloat(_startMP);
        Xmax = parseFloat(_endMP);


        xScale = d3.scale.linear().domain([Xmin, Xmax]).range([0, chart.width]);
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-chart.height);

        // .tickSize(-width);
        xAxis2 = d3.svg.axis() //X轴的尺度 stickmap
            .scale(xScale).orient("bottom").tickSize(-chart.height2);

        //console.log(stickmap);

        stickmap.select(".x.axis2").call(xAxis2);
        svg.select(".x.axis").call(xAxis);

        zoom = d3.behavior.zoom()
            .x(xScale)
            .scaleExtent([1, 20])
            .on("zoom", zoomed);
        svg.call(zoom);
        stickmap.call(zoom);
        rangeArray.push(Xmax + step);
        rangeArray.push(Xmin - step);

        var key = function (d) {
            return d.startMP;
        };

        map.append('g').selectAll("path.dot").data(data, key).enter().append("svg:path").attr("class", "dot")
            .attr("stroke", function (d, i) {
                if (d.eventName.indexOf("StreetFull") > 0) {
                    return "white";
                } else {
                    return d.color;
                }

            })
            .attr("stroke-width", function (d, i) {
                if (d.eventName.indexOf("StreetFull") > 0 || d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "4px";
                } else {
                    return "2px";
                }
            })
            .attr("transform",
            function (d) {
                if (d.eventName == 'OffRamp' || d.eventName == 'OnRamp') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + y2((tips * 3)) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips * 4) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY) + ")";
                }

            }).attr("d", d3.svg.symbol().type(function (d) {
                return d.eventName;
            })).on("mouseover",
            function (d) {
                var xPosition = xScale(d.startMP) + tips * 2
                map.append("text")
                    .attr("id", "tooltip11")
                    .attr("x", xPosition)
                    .attr("y", y2(RouteY + RouteYLable))
                    .attr("text-anchor", "right")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .attr("fill", "red")
                    .text(d.description);

            }).on("mouseout",
            function () {
                d3.select("#tooltip11").remove();
            });


        stickmap.selectAll("path.dot")
            .attr("transform",
            function (d) {
                if (d.eventName == 'OffRamp' || d.eventName == 'OnRamp') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + y2((tips * 3)) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips * 4) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY) + ")";
                }
            })

    }

    chart.genRoute = function (data) {

        var key = function (d) {
            return d.startMP;
        };

        map.append('g').selectAll("path.dot").data(data, key).enter().append("svg:path").attr("class", "dot")
            .attr("stroke", function (d, i) {
                if (d.eventName.indexOf("StreetFull") > 0) {
                    return "white";
                } else {
                    return d.color;
                }

            })
            .attr("stroke-width", function (d, i) {
                if (d.eventName.indexOf("StreetFull") > 0 || d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "4px";
                } else {
                    return "2px";
                }
            })
            .attr("transform",
            function (d) {
                if (d.eventName == 'OffRamp' || d.eventName == 'OnRamp') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + y2((tips * 3)) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips * 4) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY) + ")";
                }

            }).attr("d", d3.svg.symbol().type(function (d) {
                return d.eventName;
            })).on("mouseover",
            function (d) {
                var xPosition = xScale(d.startMP) + tips * 2
                map.append("text")
                    .attr("id", "tooltip11")
                    .attr("x", xPosition)
                    .attr("y", y2(RouteY + RouteYLable))
                    .attr("text-anchor", "right")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .attr("fill", "red")
                    .text(d.description);

            }).on("mouseout",
            function () {
                d3.select("#tooltip11").remove();
            });


        stickmap.selectAll("path.dot")
            .attr("transform",
            function (d) {
                if (d.eventName == 'OffRamp' || d.eventName == 'OnRamp') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + y2((tips * 3)) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY - tips * 4) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + y2(RouteY) + ")";
                }
            })

    }

    chart.layerUpdate = function (_eventName, _eventSymbolColumnName ,_yIndex) {
        if (_eventName.startWith('SpeedLimits') || _eventName .startWith('AADT') ){

            svg.selectAll("path." + _eventName+"_"+_eventSymbolColumnName)
                .each(function (d) {

                    var thisGroup = d3.select(this);
                    //如果是线
                    thisGroup.transition().duration(1000).attr("d", rightRoundedRect(xScale(d.startMP), y(_yIndex + (rectHight / 4)), xScale(d.endMP) - xScale(d.startMP), rectHight, 0))
                        .attr("fill",
                        function (d) {
                            return d.color
                        }).attr("cy",
                        function (d) {
                            return y(_yIndex + (rectHight / 4));
                        });


                });

            svg.selectAll("." + _eventName+"_"+_eventSymbolColumnName + "_LABEL").transition().duration(1000).attr("y",
                function (d) {
                    return y(_yIndex - tips / 2);
                })


        } else {
            svg.selectAll("." + _eventName+"_"+_eventSymbolColumnName).transition().duration(1000)
                .attr("transform",
                function (d) {
                    return "translate(" + xScale(d.startMP) + "," + y(_yIndex) + ")";
                }).attr("cy",
                function (d) {
                    console.log(y(_yIndex));
                    return y(_yIndex);
                })

            svg.selectAll("." + _eventName+"_"+_eventSymbolColumnName + "_TIPS").transition().duration(1000)
                .attr("y",
                function (d) {
                    if (d3.select(this).attr("display") == "true") {
                        return y(_yIndex) - 10;
                    }
                })

            svg.selectAll("." + _eventName+"_"+_eventSymbolColumnName + "_IMG").transition().duration(1000)
                .attr("y",
                function (d) {

                    if (d3.select(this).attr("display") == "true") {
                        console.log(_yIndex)
                        return y(_yIndex) - 50;
                    }
                })

        }
    }


    function asyncGetData(_eventName, _eventSymbolColumnName, _yIndex, _routeID, _Xmin, _Xmax, layers, i,scope) {
        d3.json(lbUrl + "GetEventSymbology").header("Content-Type", "application/json").post(JSON.stringify({
                customerID: 1,
                routeID: _routeID,
                startMP: _Xmin,
                endMP: _Xmax,
                eventName: _eventName,
                eventSymbolColumnName: _eventSymbolColumnName
            }),
            function (error, result) {
                console.log(scope);
                chart.layerInsert(_eventName+'_'+_eventSymbolColumnName, _yIndex, result);
                var d = layers[i].data;
                layers[i].data=d.concat(result);
                var data = layers[i].data;
                if (_eventName == 'AADT' || _eventName == 'SpeedLimits') {
                    data=   data.unique(data)
                }



                scope.renderTable("tablePanel", data, "", "", parseFloat(xScale.invert(0)), parseFloat(xScale.invert(chart.width))); //这里控制在范围内的数据才显示

            });

    }


    chart.layerInsert = function (_eventName, _yIndex, _data) {
        //alert(angular.element(this).scope().endMP);
        svg2.append('g').selectAll("path." + _eventName).data(_data).enter().append("svg:path").attr("class", _eventName)
            .each(function (d) {
                var thisGroup = d3.select(this)

                    .attr("id",
                    function (d) {
                        return chart.genKey(d);
                    })
                    .attr("onclick",
                    function (d) {
                        return "angular.element(this).scope().setSelectedRow('" + chart.genKey(d) + "')";
                    })
                    .attr("tip",
                    function (d) {
                        return "no";
                    })

                if (d.feature_type.startWith('P') || (d.feature_type.startWith('L') && d.startMP == d.endMP)) { //判断是点还是线 这里有个特殊的处理，如果是L,开始和结束是同一个位子，我们按点来处理

                    thisGroup.attr("fill", function (d, i) {
                        return d.points.fillColor

                    })
                        .attr("transform",
                        function (d) {
                            return "translate(" + xScale(d.startMP) + "," + y(_yIndex) + ")";
                        })
                        .attr("cx",
                        function (d) {
                            return xScale(d.startMP);
                        })
                        .attr("cy",
                        function (d) {
                            return y(_yIndex);
                        })

                        .attr("d", d3.svg.symbol().type(function (d) {
                            var style = d.points.style.substring(0, d.points.style.length - 1);
                            if (d.feature_type.startWith('L')) {
                                return 'structures'; //just for structures
                            } else if (style == 'TRI') {
                                return 'triangle-up';
                            } else if (style == 'SQR') {
                                return 'square';
                                //} else if (style == 'CIR') {
                                //    return 'structures'; //just for structures
                            }
                            else {
                                return 'circle';
                            }
                        }).size(function (d) {
                            if (d.feature_type.startWith('L')) {
                                return 4 * iconSize;
                            } else {
                                var style = d.points.style;
                                return style.charAt(style.length - 1) * iconSize;
                            }

                        }))
                        .on("mouseover",
                        function (d) {


                            if (d3.select(this).attr("tip") == 'no') { //如果没有tip，鼠标滑过显示label
                                var xPosition = parseFloat(d3.select(this).attr("cx")) + 10;
                                var yPosition = parseFloat(d3.select(this).attr("cy")) - 12;

                                //Create the tooltip label
                                svg2.append("text").attr("id", "tooltip")
                                    .attr("x", xPosition).attr("y", yPosition)
                                    .attr("text-anchor", "right").attr("font-family", "sans-serif")
                                    .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "red").text(chart.genLabel(d));

                            }

                        }).on("mouseout",
                        function () {

                            //Remove the tooltip
                            if (d3.select(this).attr("tip") == 'no')
                                d3.select("#tooltip").remove();

                        })
                        .on("mousedown",
                        function (d) {


                            //d3.select(this).transition()
                            //    .duration(750)
                            //    .style("stroke-width", 4)
                            //    .style("stroke", "orange");
                            angular.element(this).scope().lastId = angular.element(this).scope().selectId;
                            angular.element(this).scope().selectId = '#' + chart.genKey(d);
                            chart.select(angular.element(this).scope().selectId, angular.element(this).scope().lastId, d.feature_type);

                            d3.select("#tooltip").remove();
                            if (d3.select(this).attr("tip") == 'no') {
                                var xPosition = parseFloat(d3.select(this).attr("cx"));
                                var yPosition = parseFloat(d3.select(this).attr("cy"));

                                var yPositionEnd = parseFloat(d3.select(this).attr("cy")) - 10;
                                console.log(d.layerEventID);


                                if (chart.labelStyle() == 'T') {
                                    svg2.select("#" + chart.genKey(d) + '_TIPS')
                                        .attr("x", xScale(d.startMP))
                                        .attr("y", yPosition)
                                        .transition().duration(1000)
                                        .attr("y", yPositionEnd)
                                        .attr("text-anchor", "right")
                                        .attr("font-family", "sans-serif")
                                        .attr("font-size", "12px")
                                        .attr("font-weight", "bold")
                                        .attr("fill", "red")
                                        .attr("text-anchor", "middle")
                                        .attr("display", "true")
                                        .text(chart.genLabel(d));

                                }


                                if (chart.labelStyle() == 'I') {


                                    var num = Math.random() * 3 + 1;
                                    num = parseInt(num, 10);
                                    // alert(num)
                                    var uu = ""
                                    if (num == 1) {
                                        uu = url1
                                    } else if (num == 2) {
                                        uu = url2
                                    } else {
                                        uu = url3
                                    }
                                    yPositionEnd = parseFloat(d3.select(this).attr("cy")) - 50;
                                    svg2.select("#" + chart.genKey(d) + "IMG")
                                        .attr("x", xScale(d.startMP) - 18)
                                        .attr("y", yPosition)
                                        .transition().duration(1000)
                                        .attr("y", yPositionEnd)

                                        .attr("xlink:href", uu)
                                        .attr("display", "true")
                                        .attr("width", 37)
                                        .attr("height", 37)
                                        .attr("z-index", 999);
                                }

                                d3.select(this).attr("tip", "yes");

                            } else {

                                svg2.select("#" + chart.genKey(d) + '_TIPS')
                                    .attr("x", xScale(d.startMP))
                                    .attr("y", "-1")
                                    .attr("display", "false")


                                svg2.select("#" + chart.genKey(d) + "IMG")
                                    .attr("x", xScale(d.startMP))
                                    .attr("y", "-1000")
                                    .attr("xlink:href", "")
                                    .attr("display", "false")


                                d3.select(this).attr("tip", "no");

                            }
                        });

                } else {


                    thisGroup.attr("d", rightRoundedRect(xScale(d.startMP), y(_yIndex + (rectHight / 4)), xScale(d.endMP) - xScale(d.startMP), rectHight, 0))
                        .attr("cx",
                        function (d) {
                            return xScale(d.startMP);
                        })
                        .attr("cy",
                        function (d) {
                            return y(_yIndex + (rectHight / 4));
                        })
                        .attr("fill",
                        function (d) {
                            return d.color
                        })
                        .on("mousedown",
                        function (d) {

                            angular.element(this).scope().lastId = angular.element(this).scope().selectId;
                            angular.element(this).scope().selectId = '#' + chart.genKey(d);
                            chart.select(angular.element(this).scope().selectId, angular.element(this).scope().lastId, d.feature_type);

                        });


                }

            }
        );


        svg2.append('g').selectAll("text").data(_data).enter().append("text")
            .each(function (d) {
                var thisGroup = d3.select(this);
                if (d.feature_type.startWith('P') || (d.feature_type.startWith('L') && d.startMP == d.endMP)) { //判断是点还是线 这里有个特殊的处理，如果是L,开始和结束是同一个位子，我们按点来处理
                    thisGroup.attr('class', _eventName + '_TIPS')
                        .attr("font-family", "sans-serif").attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "red").attr("text-anchor", "middle")
                        .attr("id", function (d) {
                            return chart.genKey(d) + '_TIPS';
                        })
                        .attr("display", "false")
                        .text(function (d) {
                            return chart.genLabel(d);
                        })
                        .attr("x",
                        function (d) {
                            return xScale(d.startMP);
                        })
                        .attr("y", "-1")
                } else {

                    thisGroup.attr("text-anchor", "middle").attr('class', _eventName + '_LABEL').text(function (d) {
                        return d.label;
                    }).attr("y",
                        function (d) {
                            return y(_yIndex - tips / 2);
                        }).attr("x",
                        function (d) {
                            if (d.endMP <= Xmin) {
                                return xScale(d.endMP);
                            } else if (d.startMP < Xmin && Xmax < d.endMP) {
                                // console.log(d)
                                return xScale(Xmin + (Xmax - Xmin) / 2);
                            } else if (d.startMP < Xmin && Xmin < d.endMP && d.endMP < Xmax) {
                                // console.log(d)
                                return xScale(Xmin + (d.endMP - Xmin) / 2);
                            } else if (d.startMP > Xmin && Xmax > d.endMP) {
                                // console.log(d)
                                return xScale(d.startMP + (d.endMP - d.startMP) / 2);
                            } else if (d.startMP > Xmin && Xmax < d.endMP && d.startMP < Xmax) {
                                return xScale(d.startMP + (Xmax - d.startMP) / 2);
                            } else if (d.startMP >= Xmax) {
                                return xScale(d.startMP);
                            }

                        })

                }

            });


        svg2.append('g').selectAll("image")//添加image
            .data(_data).enter().append("svg:image")
            .each(function (d) {
                var thisGroup = d3.select(this);
                if (d.feature_type.startWith('P')) { //判断是点还是线
                    thisGroup.attr("class", _eventName + '_IMG')
                        .attr("id", function (d) {

                            return chart.genKey(d) + "IMG";
                        })
                        .attr("display", "false")
                        // .attr("xlink:href", "http://geosemantic.org/W11-3.png")
                        .attr("x", function (d) {
                            console.log(d.startMP)
                            return xScale(d.startMP);
                        })

                } else {

                }

            });


    }

    function rightRoundedRect(x, y, width, height, radius) {
        return "M" + x + "," + y
            + "h" + (width - radius)
            + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
            + "v" + (height - 2 * radius)
            + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
            + "h" + (radius - width)
            + "z";
    };

    chart.step = function (_step) {
        if (!arguments.length) return step;
        step = _step;
        return chart;
    };

    chart.x = function (_x) {
        if (!arguments.length) return x;
        x = _x;
        return chart;
    };

    chart.y = function (_y) {
        if (!arguments.length) return y;
        y = _y;
        return chart;
    };


    chart.width = function (_width) {
        if (!arguments.length) return width;
        width = _width;
        return chart;
    };

    chart.height = function (_height) {
        if (!arguments.length) return height;
        height = _height;
        return chart;
    };

    chart.height2 = function (_height2) {
        if (!arguments.length) return height2;
        height2 = _height2;
        return chart;
    };


    chart.xScale = function (_xScale) {
        if (!arguments.length) return xScale;
        xScale = _xScale;
        return chart;
    };

    chart.y2 = function (_y2) {
        if (!arguments.length) return y2;
        y2 = _y2;
        return chart;
    };

    chart.step = function (_step) {
        if (!arguments.length) return step;
        step = _step;
        return chart;
    };

    chart.labelStyle = function (_labelStyle) {
        if (!arguments.length) return labelStyle;
        labelStyle = _labelStyle;
        return chart;
    };


    chart.layers = function (_layers) {
        if (!arguments.length) return layers;
        layers = _layers;
        return chart;
    };

    chart.genKey = function (d) {
        var k = d.featIDColumn;
        var id = JSON.parse(d.attributes);
        return k + '-' + id[k];

    };

    chart.genLabel = function (d) {
        var k = d.symColumn;
        var id = JSON.parse(d.attributes);
        return id[k];

    };

    chart.genID = function (d) {
        var k = d.featIDColumn;
        var id = JSON.parse(d.attributes);
        return id[k];

    };


    chart.select = function (id, lastId, feature_type) {
        if (lastId != '') {
            if (feature_type.startWith('L')) {
                d3.select(lastId).transition()
                    .duration(750)
                    .style("stroke-width", 1)
                    .style("stroke", "white");
            } else {
                d3.select(lastId).transition()
                    .duration(750)
                    .style("stroke-width", 0)
                    .style("stroke", "null");
            }

        }

        if (feature_type.startWith('L')) {
            d3.select(id).transition()
                .duration(750)
                .style("stroke-width", 6)
                .style("stroke", "orange");

        } else {
            d3.select(id).transition()
                .duration(750)
                .style("stroke-width", 4)
                .style("stroke", "orange");
        }


    };


    chart.moveLayer = function (layer, direction) {
        for (var i = 0; i < layers.length; i++) {
            var layerMetaData = layers[i]
            if (layer == layerMetaData.eventName) {
                if (direction == 'UP') {


                    var layerMetaDataPre = layers[i - 1]
                    yIndex = (height) / 2 - ((i) * (gap + rectHight / 4));
                    layerUpdate(layerMetaData.eventName, yIndex);
                    yIndex = (height) / 2 - ((i + 1) * (gap + rectHight / 4));
                    layerUpdate(layerMetaDataPre.eventName, yIndex);

                    var temp = layers[i];
                    layers[i] = layerMetaDataPre;
                    layers[i - 1] = temp
                    break;
                } else {
                    var layerMetaDataNext = layers[i + 1]
                    yIndex = (height) / 2 - ((i + 1) * (gap + rectHight / 4));
                    layerUpdate(layerMetaDataNext.eventName, yIndex);
                    yIndex = (height) / 2 - ((i + 2) * (gap + rectHight / 4));
                    layerUpdate(layerMetaData.eventName, yIndex);

                    var temp = layers[i];
                    layers[i + 1] = temp;
                    layers[i] = layerMetaDataNext;
                    break;

                }
            }

        }

    }


    chart.calculateY = function (i) {
        yIndex = (chart.height) / 2 - ((i + 1) * (gap + rectHight / 4));
        console.log('----------------->' + yIndex);
        return yIndex;
    }

    //chart.addLayer = function(layer, index) { // <-1D
    //    var metaData = layer.getEventMetaData()
    //    console.log(metaData.eventName)
    //
    //    for (var i = index - 1; i < layers.length-1; i++) { //把插入layer下面的layer自动都往下挪动
    //        var layerMetaData = layers[i]
    //        yIndex = (height) / 2 - ((i + 2) * (gap + rectHight / 4));
    //        layerUpdate(layerMetaData.eventName, yIndex);
    //
    //    }
    //
    //    layers.insert(index, metaData);
    //
    //    yIndex = (height) / 2 - (index * (gap + rectHight / 4));
    //
    //    layerInsert(metaData.eventName, yIndex, layer.getEventLayerData());
    //    //asyncGetData(metaData.eventName, metaData.eventSymbolColumnName, yIndex, metaData.routeID, metaData.startMP-step, metaData.endMP+step);
    //}

    chart.deleteLayer = function (layer, index) { // <-1D
        //layers.remove(index);
        if (layer.startWith('AADT')  || layer .startWith('SpeedLimits')) {
            d3.selectAll("." + layer).remove();
            d3.selectAll("." + layer + "_LABEL").remove();
        } else {
            d3.selectAll("." + layer).remove();
            d3.selectAll("." + layer + "_TIPS").remove();
            d3.selectAll("." + layer + "_IMG").remove();
        }


    }


    return chart;
}


var Events = function (_eventsJsonObj, _eventMetaData) {

    var eventsJsonObj = _eventsJsonObj;
    var eventMetaData = _eventMetaData;

    return {

        getEventGeoJson: function () {
            return eventsJsonObj;
        },

        getEventMetaData: function () {
            return eventMetaData;
        },

    };
};


var Layer = function (_eventName, _eventSymbolColumnName, _data) {

    eventName = _eventName;
    eventSymbolColumnName = _eventSymbolColumnName;
    data = _data;
    console.log(data);

    return {
        /**
         * Method: getEventMetaData
         * get the meta data of events in specific route
         *
         * Returns:
         * {Object} The meta data object
         */
        getEventMetaData: function () {
            var metaObject = {};
            metaObject['eventName'] = eventName;
            metaObject['eventSymbolColumnName'] = eventSymbolColumnName;
            return metaObject;
        },

        getEventLayerData: function () {
            return data;
        },

    };
}