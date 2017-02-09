/**
 * Created by tomjie on 15/9/2.
 */
/*------------add event handler------------*/



String.prototype.startWith = function (compareStr) {
    return this.indexOf(compareStr) == 0;
}


var D3Diagram = function () {

    var chart = {};
    var width; //Map的宽
    var height; //Map的高
    var width2; //stickMap的宽
    var height2; //stickMap的高

    var showTooltips;
    var xD3DiagramDim;
    var yD3DiagramDim;


    var routeSegment;
    var d3LRSFeatureClasses;
    var d3LRSFeatureClassSymbologySeqs;
    var chart = {};
    var layers = new Array(); //数据叠加
    var displayLayers = [];
    var rangeArray = []; //路径最大最小值存储

    var url1 = "http://geosemantic.org/OM3-L.png";
    var url2 = "http://geosemantic.org/R.png";
    var url3 = "http://geosemantic.org/W11-3.png";
    var padding = 10;

    var margin = {
            top: 0,
            right: 0,
            bottom: 30,
            left: 20
        }, //上下左右的间隔
        margin2 = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 20
        },

        lbUrl = 'http://72.215.195.71:9012/api/data/', //服务请求的地址
        labelStyle = "T",
        yIndexArray = {},
        RouteList = {},
        routeID,
        iconSize = 45, //图标的大小
        barSize = 6, //图标的大小
        rectHight = 30, //条状layer的宽度
        tips = 6, //鼠标放上去后,tip离原始目标的距离
        gap = 20, //间隔因子
        buffer = 1, //加载数据的长度 单位 公里
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
        yScale = d3.scale.linear().domain([0, 400 / 2]).range([400, 0]),
        yScaleStickMap = d3.scale.linear().domain([0, 160 / 2]).range([160, 0]),

        xAxis,
        yAxis,
        xAxis2,
        yAxis2,
        zoomed,
        stickmap,
        svg,
        svg2,
        map,
        canvas,
        lastId = '', //last select id
        div;


    renderAxesStickMap = function (stickmap) {
        yScaleStickMap = d3.scale.linear().domain([0, (getHeight2())]).range([getHeight2(), 0]);
        RouteY = getHeight2() / 2
        xScale = d3.scale.linear().domain([0, 250]).range([0, getWidth()])
        xAxis2 = d3.svg.axis() //X轴的尺度 stickmap
            .scale(xScale)
            .orient("bottom")
            .ticks(4);
        //.tickSize(-getHeight2());
        if (xD3DiagramDim.showGuidelines) {
            xAxis2.tickSize(-getHeight2());
        }

        yAxis2 = d3.svg.axis()
            .scale(yScaleStickMap)
            .orient("left")
            .ticks(0)
            .tickSize(-getWidth());

        stickmap.append("g")
            .attr("class", "x axis2")
            .attr("transform", "translate(0," + getHeight2() + ")")
            .call(xAxis2);

        stickmap.append("g")
            .attr("class", "y axis2")
            .call(yAxis2);

    };

    renderAxesChart = function (svg) {
        xScale = d3.scale.linear().domain([0, 250]).range([0, getWidth()]);
        //yScale = d3.scale.linear().domain([0, 250]).range([0, getHeight()]);
        yScale = d3.scale.linear().domain([0, getHeight() / 2]).range([getHeight(), 0]);


        xAxis = d3.svg.axis() //X轴的尺度
            .scale(xScale)
            .orient("bottom")
            .ticks(4);
        yAxis = d3.svg.axis() //y轴的尺度
            .scale(yScale)
            .orient("left")
            .ticks(4);

        if (xD3DiagramDim != null && xD3DiagramDim.showGuidelines) {
            xAxis.tickSize(-(getHeight()));

        }


        if (yD3DiagramDim != null && yD3DiagramDim.showGuidelines) {
            yAxis.tickSize(-(getWidth()));

        }

        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + getHeight() + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0," + 0 + ")")
            .call(yAxis);

    };

    //this should get the current width from the element
    getWidth = function () {
        return width;
    };
    //this should get the current height from the element,
    getHeight = function () {
        return height;
    };

    getHeight2 = function () {
        return height2;
    };


    calculateY = function (pFCIdx) {
        yIndex = (height) / 2 - ((pFCIdx + 1) * (gap + rectHight / 4));
        console.log('----------------->' + yIndex);
        return yIndex;
    };

    rightRoundedRect = function (x, y, width, height, radius) {
        return "M" + x + "," + y
            + "h" + (width - radius)
            + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
            + "v" + (height - 2 * radius)
            + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
            + "h" + (radius - width)
            + "z";
    };

    asyncGetData = function (_eventName, _eventSymbolColumnName, _yIndex, _routeID, _Xmin, _Xmax, layers, i, scope) {
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
                chart.layerInsert(_eventName + '_' + _eventSymbolColumnName, _yIndex, result);
                var d = layers[i].data;
                layers[i].data = d.concat(result);
                var data = layers[i].data;
                if (_eventName == 'AADT' || _eventName == 'SpeedLimits') {
                    data = unique(data, 'label');
                }
                scope.renderTable("tablePanel", data, "", "", parseFloat(xScale.invert(0)), parseFloat(xScale.invert(chart.width))); //这里控制在范围内的数据才显示

            });

    };

    chart.updateRoute = function (_routeID, _startMP, _endMP) {
        if ((_startMP < 0) || (_endMP < 0)) {
            console.log("error");
            alert("error");
            return null;
        }
        Xmin = parseFloat(_startMP);
        Xmax = parseFloat(_endMP);
        routeID = _routeID;

        xScale = d3.scale.linear().domain([Xmin, Xmax]).range([0, getWidth()]);
        xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-getHeight());
        if (xD3DiagramDim.showGuidelines) {
            xAxis.tickSize(-getHeight());
        }

        // .tickSize(-width);
        xAxis2 = d3.svg.axis() //X轴的尺度 stickmap
            .scale(xScale).orient("bottom").tickSize(-getHeight2());
        if (xD3DiagramDim.showGuidelines) {
            xAxis2.tickSize(-getHeight2());
        }

        //console.log(stickmap);

        stickmap.select(".x.axis2").call(xAxis2);
        svg.select(".x.axis").call(xAxis);

        zoomed = d3.behavior.zoom()
            .x(xScale)
            .scaleExtent([1, 20])
            .on("zoom", zoom);
        svg.call(zoomed);
        stickmap.call(zoomed);
        rangeArray.push(Xmax + buffer);
        rangeArray.push(Xmin - buffer);
    };

    updateRouteLogData = function (data) {

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
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap((tips * 3)) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips * 2) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY) + ")";
                }

            }).attr("d", d3.svg.symbol().type(function (d) {
                return d.eventName;
            })).on("mouseover",
            function (d) {
                var xPosition = xScale(d.startMP) + tips * 2
                map.append("text")
                    .attr("id", "tooltip11")
                    .attr("x", xPosition)
                    .attr("y", yScaleStickMap(RouteY + RouteYLable))
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
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap((tips * 3)) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips * 2) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY) + ")";
                }
            })

    };


    chart.renderStickMap = function (el) {
        if (!stickmap) {
            console.log(getWidth());
            console.log(getHeight2);
            stickmap = d3.select(el)
                .append("svg")
                .attr("width", getWidth())
                .attr("height", getHeight2())
                .append("g")
                .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
                .on("mousemove", this.drawCursorLine);


            stickmap.append("rect")
                .attr("width", getWidth())
                .attr("height", getHeight2())
                .attr("fill", "#ddd");

            renderAxesStickMap(stickmap);

            map = stickmap.append("svg")
                .attr("width", getWidth())
                .attr("height", getHeight());

            div = d3.select(el).append("div")   // declare the properties for the div used for the tooltips
                .attr("class", "tooltip")               // apply the 'tooltip' class
                .style("opacity", 0);
        }

    };

    chart.setrouteSegment = function (_routeSegment) {
        routeSegment = _routeSegment;
    }


    chart.setSize = function (_width, _height) {
        width = _width;
        height = _height;
    };

    chart.setMapSize = function (_width, _height) {
        width = _width;
        height2 = _height;
        console.log(height2);
    };

    chart.pan = function () {

    };

    zoom = function () {


        if (parseFloat(xScale.invert(getWidth())) > (parseFloat(Xmax) + buffer)) {//move right
            Xmin = Xmin + buffer;
            Xmax = Xmax + buffer;

            //angular.element(this).scope().startMP = Xmin;
            //angular.element(this).scope().endMP = Xmax;

            var para = {
                "routeID": routeID,
                "startMP": Xmin,
                "endMP": Xmax,
                "orientation": 'R'
            }

            //self.raiseEvent("onChartZoom", "dd");
            $(document).trigger("onChartZoom", para);
            //updateRoute(routeID, Xmin, Xmax);
            //for (var i = 0; i < d3LRSFeatureClassSymbologySeqs.length; i++) {
            //    yIndex = (chart.height) / 2 - ((i + 1) * (gap + rectHight / 4));
            //    asyncGetData(d3LRSFeatureClassSymbologySeqs[i].featureClassName, d3LRSFeatureClassSymbologySeqs[i].symbologyName, yIndex, routeID, Xmin + buffer, Xmax + buffer, layers, i, angular.element(this).scope());
            //
            //}
            rangeArray.push(Xmax + buffer + buffer);

        }
        else if (parseFloat(xScale.invert(0)) < (parseFloat(Xmin) - buffer)) { //move left
            Xmin = Xmin - buffer;
            Xmax = Xmax - buffer;

            //$("#startMP").prop("value", Xmin);
            //$("#endMP").prop("value", Xmax);

            var para = {
                "routeID": routeID,
                "startMP": Xmin,
                "endMP": Xmax,
                "orientation": 'L'
            }

            $(document).trigger("onChartZoom", para);
            //updateRoute(routeID, Xmin, Xmax);
            //for (var i = 0; i < d3LRSFeatureClassSymbologySeqs.length; i++) {
            //    yIndex = (chart.height) / 2 - ((i + 1) * (gap + rectHight / 4));
            //    asyncGetData(d3LRSFeatureClassSymbologySeqs[i].featureClassName, d3LRSFeatureClassSymbologySeqs[i].symbologyName, yIndex, routeID, Xmin - buffer, Xmax - buffer, layers, i, angular.element(this).scope());
            //    //var data = layers[i].data;
            //    //angular.element(this).scope().renderTable("tablePanel", data, "", "", parseFloat(xScale.invert(0)), parseFloat(xScale.invert(chart.width))); //这里控制在范围内的数据才显示
            //
            //}

            rangeArray.push(Xmin - buffer - buffer);


        }
        else {
            //如果只是本范围内的缩放，则不新加数据，只修改现有数据位置
            svg.select(".x.axis").call(xAxis);
            stickmap.select(".x.axis2").call(xAxis2);

            stickmap.selectAll("path.dot")
                .attr("transform",
                function (d) {
                    console.log(d);
                    if (d.eventName == 'OffRamp' || d.eventName == 'OnRamp') {
                        return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                    } else if (d.eventName == 'Milepost') {
                        return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(tips * 3) + ")";
                    } else if (d.eventName.indexOf("StreetFull") > 0) {
                        return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                    } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                        return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips * 4) + ")";
                    } else {
                        return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY) + ")";
                    }
                });


            map.selectAll(".Route").attr({
                'x1': function (d) {
                    return xScale(d.start);
                },
                //利用尺ß度算出圓心x位置
                'x2': function (d) {
                    return xScale(d.end);
                }
            });


            for (var j = 0; j < d3LRSFeatureClasses.lrsFeatureClasses.length; j++) {

                //var metaData = d3LRSFeatureClassSymbologySeqs[j];
                //if (metaData.featureClassName == '') {
                //    break;
                //}

                var lrsFeatureClass = d3LRSFeatureClasses.lrsFeatureClasses[j];

                var fromMeasCol = lrsFeatureClass.fromMeasCol;
                var toMeasCol = lrsFeatureClass.toMeasCol;

                var featuresClassData = lrsFeatureClass.getFeatureClassData();
                var array = JSON.parse(featuresClassData.data_str);

                var data = JSONH.unpack(array); //解析成对象
                //var Symbology = lrsFeatureClass.getSymbologyData(pScIdx);
                //var symbolType = Symbology.symbolType;
                //var symbologyDatas = Symbology.symbologyData.Symbol;

                //var lrsFeatureClass = d3LRSFeatureClasses[d3LRSFeatureClassSymbologySeqs[j].featureClassIdx];
                //var data = lrsFeatureClass.getFeatureClassData();

                svg.selectAll("path." + lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn)
                    .each(function (d) {
                        var thisGroup = d3.select(this);
                        if (fromMeasCol == toMeasCol) { //判断是点还是线 这里有个特殊的处理，如果是L,开始和结束是同一个位子，我们按点来处理

                            thisGroup.attr("transform",
                                function (d) {
                                    return "translate(" + xScale(d[fromMeasCol]) + "," + d3.select(this).attr("cy") + ")";
                                })
                                .attr("cx",
                                function (d) {
                                    return xScale(d[fromMeasCol]);
                                })
                        } else {                          //如果是线

                            var ss = d3.select(this).attr("cy");
                            var sss = d3.select(this).attr("height");
                            thisGroup.attr("d", rightRoundedRect(xScale(d[fromMeasCol]), d3.select(this).attr("cy"), xScale(d[toMeasCol]) - xScale(d[fromMeasCol]), d3.select(this).attr("height"), 0))
                                .attr("fill",
                                function (d) {
                                    return d.color
                                });
                        }

                    });


                svg.selectAll("."+lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn + "_LABEL")
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


                        if (xScale.invert(0) < d[fromMeasCol]) {
                            // console.log(xScale.invert(width/2+(d.startMP-xScale.invert(0))));
                            return xScale(d[fromMeasCol] + (xScale.invert(chart.width) - d[fromMeasCol]) / 2);
                        }
                        if (xScale.invert(chart.width) > d[toMeasCol]) {
                            // return xScale(d.startMP+(xScale.invert(width)-d.startMP)/2);
                            return xScale(xScale.invert(0) + (d[toMeasCol] - xScale.invert(0)) / 2);
                            // return xScale(d.endMP);

                        } else {
                            return xScale.invert(chart.width / 2);
                        }

                    });


                svg2.selectAll("."+lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn + "_TIPS")
                    .attr("x",
                    function (d) {
                        return xScale(d[fromMeasCol]);
                    })

                svg2.selectAll("." + lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn + "_IMG")
                    .attr("x",
                    function (d) {
                        return xScale(d[fromMeasCol]) - 18;
                    })

                //}


            }


        }

    };


    chart.drawCursorLine = function () {

        var coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];
        if (xD3DiagramDim != null && xD3DiagramDim.showCursorLine) {
            stickmap.select('#mapXCursorLine').remove();
            stickmap.append("line").attr("id", "mapXCursorLine").attr("x1", x - 1).attr("y1", 0).attr("x2", x - 1)
                .attr("y2", getHeight2()).attr("stroke", "red").attr("stroke-width", 1);
            svg.select('#chartXCursorLine').remove();
            svg.append("line").attr("id", "chartXCursorLine").attr("x1", x - 1)
                .attr("y1", 0).attr("x2", x - 1).attr("y2", getHeight() - 15).attr("stroke", "red").attr("stroke-width", 1);
            svg.select('#chartXCursorLineText').remove();

            if (xD3DiagramDim != null && xD3DiagramDim.showCursorLineText) {
                svg.append("text").attr("id", "chartXCursorLineText").attr("x", x).attr("y", getHeight() - 2)
                    .attr("text-anchor", "middle").attr("font-family", "sans-serif")
                    .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "red")
                    .text(d3.round(xScale.invert(x), 2));
            }

        }

        // console.log(y);
        // console.log(yScale.invert(y));

        if (yD3DiagramDim != null && yD3DiagramDim.showCursorLine) {
            stickmap.select('#mapYCursorLine').remove();
            stickmap.append("line").attr("id", "mapYCursorLine").attr("x1", 0).attr("y1", y-1).attr("x2", getWidth() - 2)
                .attr("y2", y-1).attr("stroke", "red").attr("stroke-width", 1);

            svg.select('#chartYCursorLine').remove();
            svg.append("line").attr("id", "chartYCursorLine").attr("x1", 0)
                .attr("y1", y - 1).attr("x2", getWidth() - 2).attr("y2", y - 1).attr("stroke", "red").attr("stroke-width", 1);
            svg.select('#chartYCursorLineText').remove();

            if(yD3DiagramDim!=null&&yD3DiagramDim.showCursorLineText){
                svg.append("text").attr("id", "chartYCursorLineText").attr("x", 0).attr("y", y)
                    .attr("text-anchor", "middle").attr("font-family", "sans-serif")
                    .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "red")
                    .text(d3.round(yScale.invert(y), 2));
            }
        }


    };

    chart.drawCursorLineStickMap = function () {

        var coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];


        if (yD3DiagramDim != null && yD3DiagramDim.showCursorLine) {
            stickmap.select('#mapYCursorLine').remove();
            stickmap.append("line").attr("id", "mapYCursorLine").attr("x1", 0).attr("y1", y-1).attr("x2", getWidth() - 2)
                .attr("y2", y-1).attr("stroke", "red").attr("stroke-width", 1);

            svg.select('#chartYCursorLine').remove();
            svg.append("line").attr("id", "chartYCursorLine").attr("x1", 0)
                .attr("y1", y - 1).attr("x2", getWidth() - 2).attr("y2", y - 1).attr("stroke", "red").attr("stroke-width", 1);
            svg.select('#chartYCursorLineText').remove();

            if(yD3DiagramDim!=null&&yD3DiagramDim.showCursorLineText){
                svg.append("text").attr("id", "chartYCursorLineText").attr("x", 0).attr("y", y)
                    .attr("text-anchor", "middle").attr("font-family", "sans-serif")
                    .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "red")
                    .text(d3.round(yScale.invert(y), 2));
            }
        }

    };


    chart.init = function (el) { // <-2A
        if (!svg) {
            svg = d3.select(el).append("svg")
                .attr("width", getWidth())
                .attr("height", getHeight()+ margin.top + margin.bottom)
                //.attr("fill", "#ddd")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .on("mousemove", this.drawCursorLine);
            //if(xD3DiagramDim!=null&&xD3DiagramDim.showCursorLine){
            //    svg.on("mousemove", this.drawCursorLine);
            //    //svg.on("mousemove", this.drawYCursorLine);
            //}

            svg.append("rect").attr("width", getWidth()).attr("height", getHeight()).attr("fill", "#ddd");

            renderAxesChart(svg);

            svg2 = svg.append("svg").attr("width", getWidth()).attr("height", getHeight());
        }
    };

    getSymbologyKey = function (dataArray, key) {
        for (var i = 0; i < dataArray.length; i++) {
            for (var s in dataArray[i]) {
                if (dataArray[i][s] == key) {
                    return dataArray[i][s].value;
                }
            }
        }
        return null;
    };

    getSymbology = function (symbologyData, symbologyKey) {
        var a = symbologyData.Symbol;
        for (var i = 0; i < a.length; i++) {
            if (a[i].value == symbologyKey) {
                return a[i];
            }
        }
        return null;
    };
    /**
     * 画一行数据
     * @param pFCIdx FeatureClasses的
     * @param pScIdx
     */
    chart.draw = function (pFCIdx, pScIdx) {

        var seqIdx = pFCIdx;

        var lrsFeatureClass = d3LRSFeatureClasses.lrsFeatureClasses[pFCIdx];

        var fromMeasCol = lrsFeatureClass.fromMeasCol;
        var toMeasCol = lrsFeatureClass.toMeasCol;

        var featuresClassData = lrsFeatureClass.getFeatureClassData();
        var array = JSON.parse(featuresClassData.data_str);

        var data = JSONH.unpack(array); //解析成对象
        var Symbology = lrsFeatureClass.getSymbologyData(pScIdx);
        var symbolType = Symbology.symbolType;
        var symbologyDatas = Symbology.symbologyData.Symbol;
        var _eventName = lrsFeatureClass;

        var yIndex = calculateY(seqIdx);


        svg2.append('g')
            .selectAll("path." + lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn)
            .data(data)
            .enter()
            .append("svg:path")
            .attr("class", lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn)
            .each(function (d) {
                var thisGroup = d3.select(this)
                    .attr("id",
                    function (d) {
                        //return chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d);
                    })
                    .attr("onclick",
                    function (d) {
                        //return "angular.element(this).scope().setSelectedRow('" + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + "')";
                    })
                    .attr("tip",
                    function (d) {
                        return "no";
                    });

                console.log(d[lrsFeatureClass.currentSymbologyColumn]);
                var symbologyData = null

                for (var i = 0; i < symbologyDatas.length; i++) {
                    if( symbolType == 'NOMINAL'){
                        if(d[lrsFeatureClass.currentSymbologyColumn]==symbologyDatas[i].value){
                            console.log(i);
                            symbologyData = symbologyDatas[i];
                            break;
                        }

                    }
                }



                if (fromMeasCol == toMeasCol) { //判断是点还是线

                    thisGroup
                        .attr("fill", function (d, i) {
                            return symbologyData.color

                        })
                        .attr("transform",
                        function (d) {
                            return "translate(" + xScale(d[fromMeasCol]) + "," + yScale(yIndex) + ")";
                        })
                        .attr("cx",
                        function (d) {
                            return xScale(d[fromMeasCol]);
                        })
                        .attr("cy",
                        function (d) {
                            return yScale(yIndex);
                        })
                        .attr("d", d3.svg.symbol().type(function (d) {
                            var style = symbologyData.pointStyle;
                            //if (featuresClassData.feature_type.startWith('L')) {
                            //    return 'structures'; //just for structures
                            //} else

                            if (style.startWith('TRI')) {
                                return 'triangle-up';
                            } else if (style.startWith('SQR')) {
                                return 'square';
                                //} else if (style == 'CIR') {
                                //    return 'structures'; //just for structures
                            }
                            else {
                                return 'circle';
                            }
                        }).size(function (d) {
                                return symbologyData.pointRadius * iconSize;
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
                                    .attr("font-size", "12px")
                                    //.attr("font-weight", "bold")
                                    .attr("fill", "black").text("kk");
                            }

                        }).on("mouseout",
                        function () {

                            //Remove the tooltip
                            if (d3.select(this).attr("tip") == 'no')
                                d3.select("#tooltip").remove();

                        })
                        .on("mousedown",
                        function (d) {

                            //angular.element(this).scope().lastId = angular.element(this).scope().selectId;
                            //angular.element(this).scope().selectId = '#' + chart.genKey(d);
                            //chart.select(angular.element(this).scope().selectId, angular.element(this).scope().lastId, d.feature_type);

                            /**
                             * 这里要调用外部的方法来触发chart.drawSelected这个方法来画
                             */

                            d3.select("#tooltip").remove();
                            var _style = lrsFeatureClass.getSldGraphType();
                            if (_style != '') {
                                if (_style == 'lableGraph') {
                                    if (d3.select(this).attr("tip") == 'no') {//显示

                                        svg2.select("#" + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + "IMG")
                                            .attr("x", xScale(d[fromMeasCol]))
                                            .attr("y", "-1000")
                                            .attr("xlink:href", "")
                                            .attr("display", "false")
                                        var xPosition = parseFloat(d3.select(this).attr("cx"));
                                        var yPosition = parseFloat(d3.select(this).attr("cy"));

                                        var yPositionEnd = parseFloat(d3.select(this).attr("cy")) - 10;

                                        svg2.select("#" + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + '_TIPS')
                                            .attr("x", xScale(d[fromMeasCol]))
                                            .attr("y", yPosition)
                                            .transition().duration(1000)
                                            .attr("y", yPositionEnd)
                                            .attr("text-anchor", "right")
                                            .attr("font-family", "sans-serif")
                                            .attr("font-size", "12px")
                                            //.attr("font-weight", "bold")
                                            .attr("fill", "black")
                                            .attr("text-anchor", "middle")
                                            .attr("display", "true")
                                            .text(chart.genLabel(d));
                                        d3.select(this).attr("tip", "yes");
                                    } else {                             //隐藏

                                        svg2.select("#" + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + '_TIPS')
                                            .attr("x", xScale(d[fromMeasCol]))
                                            .attr("y", "-1")
                                            .attr("display", "false")


                                        d3.select(this).attr("tip", "no");

                                    }


                                }
                                //else if (_style == 'S') {
                                //
                                //}
                                else if (_style == 'I') {

                                    if (d3.select(this).attr("tip") == 'no') {


                                        svg2.select("#" + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + '_TIPS')
                                            .attr("x", xScale(d[fromMeasCol]))
                                            .attr("y", "-1")
                                            .attr("display", "false")


                                        var xPosition = parseFloat(d3.select(this).attr("cx"));
                                        var yPosition = parseFloat(d3.select(this).attr("cy"));

                                        var yPositionEnd = parseFloat(d3.select(this).attr("cy")) - 10;
                                        console.log(d.layerEventID);

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
                                        svg2.select("#" + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + "IMG")
                                            .attr("x", xScale(d[fromMeasCol]) - 18)
                                            .attr("y", yPosition)
                                            .transition().duration(1000)
                                            .attr("y", yPositionEnd)

                                            .attr("xlink:href", uu)
                                            .attr("display", "true")
                                            .attr("width", 37)
                                            .attr("height", 37)
                                            .attr("z-index", 999);
                                        d3.select(this).attr("tip", "yes");

                                    } else {


                                        svg2.select("#" + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + "IMG")
                                            .attr("x", xScale(d[fromMeasCol]))
                                            .attr("y", "-1000")
                                            .attr("xlink:href", "")
                                            .attr("display", "false")
                                        d3.select(this).attr("tip", "no");

                                    }


                                } else if (_style == 'symbolGraph') {
                                    svg2.select("#" + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + '_TIPS')
                                        .attr("x", xScale(d[fromMeasCol]))
                                        .attr("y", "-1")
                                        .attr("display", "false")

                                    d3.select(this).attr("tip", "no");

                                }


                            } else {


                            }

                        });

                }

                else {

                    var _style = lrsFeatureClass.getSldGraphType();
                    thisGroup
                        .attr("d",
                        function (d) {
                            var height = rectHight;
                            if (_style == 'symbolGraph') {
                                var style = d.bars.style;
                                height = style.charAt(style.length - 1) * barSize;
                            }

                            return rightRoundedRect(xScale(d.startMP), yScale(yIndex + (height / 4)), xScale(d.endMP) - xScale(d.startMP), height, 0);
                        })
                        .attr("cx",
                        function (d) {
                            return xScale(d.startMP);
                        })
                        .attr("cy",
                        function (d) {
                            var height = rectHight;
                            if (_style == 'symbolGraph') {
                                var style = d.bars.style;
                                height = style.charAt(style.length - 1) * barSize;
                            }
                            return yScale(yIndex + (height / 4));
                        })
                        .attr("fill",
                        function (d) {
                            return d.color
                        })
                        .attr("height", function (d) {
                            var height = rectHight;
                            if (_style == 'symbolGraph') {
                                var style = d.bars.style;
                                height = style.charAt(style.length - 1) * barSize;
                            }
                            return height;
                        })
                        .style("stroke-width", 2)
                        .style("stroke", "#ddd")
                        .on("mouseover",
                        function (d) {
                            if (_style == 'symbolGraph') {
                                if (d3.select(this).attr("tip") == 'no') { //如果没有tip，鼠标滑过显示label

                                    var coordinates = d3.mouse(this);
                                    var x = coordinates[0] + 10;
                                    var y = coordinates[1] - 12;
                                    //Create the tooltip label
                                    svg2.append("text").attr("id", "tooltip")
                                        .attr("x", x).attr("y", y)
                                        .attr("text-anchor", "right").attr("font-family", "sans-serif")
                                        .attr("font-size", "12px")
                                        //.attr("font-weight", "bold")
                                        .attr("fill", "black").text(d.label);
                                }

                            }


                        }).on("mouseout",
                        function () {
                            if (_style == 'symbolGraph') {
                                //Remove the tooltip
                                if (d3.select(this).attr("tip") == 'no')
                                    d3.select("#tooltip").remove();
                            }

                        })
                        .on("mousedown",
                        function (d) {
                            angular.element(this).scope().lastId = angular.element(this).scope().selectId;
                            angular.element(this).scope().selectId = '#' + chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d);
                            chart.select(angular.element(this).scope().selectId, angular.element(this).scope().lastId, d.feature_type);

                        });


                }

            }
        );


        svg2.append('g').selectAll("text").data(data).enter().append("text")
            .each(function (d) {
                var thisGroup = d3.select(this);
                if (fromMeasCol == toMeasCol) { //判断是点还是线 这里有个特殊的处理，如果是L,开始和结束是同一个位子，我们按点来处理
                    thisGroup.attr('class', lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn + '_TIPS')
                        .attr("font-family", "sans-serif").attr("font-size", "12px").attr("fill", "black").attr("text-anchor", "middle")
                        .attr("id", function (d) {
                            //return chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + '_TIPS';
                        })
                        .attr("display", "false")
                        .text(function (d) {
                            return d[lrsFeatureClass.currentSymbologyColumn];
                        })
                        .attr("x",
                        function (d) {
                            return xScale(d[fromMeasCol]);
                        })
                        .attr("y", "-1")
                } else {

                    thisGroup.attr("text-anchor", "middle").attr('class', lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn + '_LABEL').text(function (d) {
                        return d.label;
                    }).attr("y",
                        function (d) {
                            return yScale(_yIndex - tips / 2);
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
            .data(data).enter().append("svg:image")
            .each(function (d) {
                var thisGroup = d3.select(this);
                if (fromMeasCol == toMeasCol) { //判断是点还是线
                    thisGroup.attr("class", lrsFeatureClass.name+lrsFeatureClass.currentSymbologyColumn + '_IMG')
                        .attr("id", function (d) {

                            //return chart.genKey(seqIdx, featureclassIdx, symbologyIdx, d) + "IMG";
                        })
                        .attr("display", "false")
                        // .attr("xlink:href", "http://geosemantic.org/W11-3.png")
                        .attr("x", function (d) {

                            return xScale(d[fromMeasCol]);
                        })

                } else {

                }

            });

    };

    ///**
    // * 画一行中的某一个数据
    // * @param pFCIdx
    // * @param pFId
    // */
    //chart.draw = function (pFCIdx, pFId) {
    //
    //};


    /**
     * 画数据选中效果
     * @param pFCIdx
     * @param pFId
     */
    chart.drawSelected = function (pFCIdx, pFId, feature_type) {

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


    /**
     * 画数据没有选中效果
     * @param pFCIdx
     * @param pFId
     */
    chart.drawUnSelected = function (pFCIdx, pFId, feature_type) {

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


    chart.drawRoute = function (_routeID, _startMP, _endMP, data) {
        if ((_startMP < 0) || (_endMP < 0)) {
            console.log("error");
            alert("error");
            return null;
        }
        Xmin = parseFloat(_startMP);
        Xmax = parseFloat(_endMP);
        routeID = _routeID;

        xScale = d3.scale.linear().domain([Xmin, Xmax]).range([0, getWidth()]);
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        if (xD3DiagramDim.showGuidelines) {
            xAxis.tickSize(-getHeight());
        }
        xAxis2 = d3.svg.axis() //X轴的尺度 stickmap
            .scale(xScale).orient("bottom");
        if (xD3DiagramDim.showGuidelines) {
            xAxis2.tickSize(-getHeight2());
        }


        stickmap.select(".x.axis2").call(xAxis2);
        svg.select(".x.axis").call(xAxis);

        zoomed = d3.behavior.zoom()
            .x(xScale)
            .scaleExtent([1, 20])
            .on("zoom", zoom);
        svg.call(zoomed);
        stickmap.call(zoomed);
        rangeArray.push(Xmax + buffer);
        rangeArray.push(Xmin - buffer);
        console.log(yScaleStickMap(RouteY));

        map.append('g')
            .selectAll("rect")
            .data(data).enter()
            .append("line")
            .attr('class', 'Route')
            .attr("x1", function (d, i) {
                return xScale(d.start);
            }).attr("y1", yScaleStickMap(RouteY)).attr("x2", function (d, i) {
                return xScale(d.end);
            }).attr("y2", yScaleStickMap(RouteY))
            .attr('stroke-dasharray', function (d, i) {
                if (d.dasharray == 'yes') {
                    return "10, 5"
                } else {
                    return null
                }
            })
            .attr("stroke", "white")
            .attr("stroke-width", 9);
    };


    chart.drawRouteLog = function (data) {
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
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap((tips * 3)) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips * 2) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY) + ")";
                }

            }).attr("d", d3.svg.symbol().type(function (d) {
                return d.eventName;
            })).on("mouseover",
            function (d) {
                var xPosition = xScale(d.startMP) + tips * 2
                map.append("text")
                    .attr("id", "tooltip11")
                    .attr("x", xPosition)
                    .attr("y", yScaleStickMap(RouteY + RouteYLable))
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
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                } else if (d.eventName == 'Milepost') {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap((tips * 3)) + ")";
                } else if (d.eventName.indexOf("StreetFull") > 0) {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips) + ")";
                } else if (d.eventName == 'Underpass' || d.eventName == 'Overpass') {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY - tips * 2) + ")";
                } else {
                    return "translate(" + xScale(d.startMP) + "," + yScaleStickMap(RouteY) + ")";
                }
            })

    };


    chart.getMap = function () {
        return map;
    }


    chart.setHeight2 = function (_height2) {
        height2 = _height2;
    };


    chart.clear = function () {

    };


    chart.removeFeatureClass = function () {

    };

    chart.addFeatureClass = function () {

    };


    chart.drawGuidelineText = function () {

    };

    chart.getSvg = function () {
        return svg;
    };

    chart.setXD3DiagramDim = function (_xD3DiagramDim) {
        xD3DiagramDim = _xD3DiagramDim;
    };

    chart.setYD3DiagramDim = function (_yD3DiagramDim) {
        yD3DiagramDim = _yD3DiagramDim;
    };


    chart.drawGuidelineText = function () {

    };


    chart.getBuffer = function () {
        return buffer;
    };

    chart.setBuffer = function (_buffer) {
        buffer = _buffer;
    };

    chart.setFeatureClasses = function (_featureClasses) {
        featureClasses = _featureClasses
    };

    chart.setD3LrsFeatureClassSymbologySqs = function (_d3LrsFeatureClassSymbologySqs) {
        d3LRSFeatureClassSymbologySeqs = _d3LrsFeatureClassSymbologySqs;
    };


    chart.setLRSFeatureClasses = function (_LRSFeatureClasses) {
        d3LRSFeatureClasses = _LRSFeatureClasses;
    };



    chart.genKey = function (d) {
        var k = d.featIDColumn;
        var id = JSON.parse(d.attributes);
        return k + '_' + id[k];

    }


    chart.genKey = function (seqIdx, featureclassIdx, symbologyIdx, d) {
        var k = d.featIDColumn;
        var id = JSON.parse(d.attributes);
        return '_' + seqIdx + '-' + featureclassIdx + '-' + symbologyIdx + '-' + id[k];

    }


    return chart;


}


var D3DiagramDim = function (_DimOrientation) {
    this.dimName = "";
    this.dimOrientation = _DimOrientation;
    this.rangeFrom = "";
    this.rangeTo = "";
    this.showGuidelines = true;
    this.showCursorLine = true;
    this.showCursorLineText = true;
}


var DimOrientation = {
    xAxis: 'X',
    yAxis: 'Y'
}
