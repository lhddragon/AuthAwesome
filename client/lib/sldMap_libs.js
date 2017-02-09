var sLD_map = function () {

    var map = {};
    var route;
    var layerExtent;
    var rootUrl = 'http://72.215.195.71:9012/api/data/';
    var verticesLayer;
    var stagingLayer;
    var productionsLayer;
    var route;

    // global openlayer controls
    var drag;
    var drawControls;
    var select;

    // global variables for point feature
    var eraseEnable = false;
    var pointCreateEnable = false;
    var pointMoveEnable = false;
    var selectFlag = false;
    var lineEditEnable = false;



    //global styles
    productionPointStyle = {
        pointRadius: 10,
        strokeColor: 'Transparent',
        fillColor: "#ef2929",
        fillOpacity: 0.50,
        //strokeWidth: 10
    };

    productionLineStyle = {
        strokeColor: '#ef2929',
        strokeOpacity: 0.50,
        strokeWidth: 10
    };

    stagingPointStyle = {
        pointRadius: 5,
        strokeColor: 'Transparent',
        fillColor: "#2e3436",
        fillOpacity: 1,
        //strokeWidth: 10
    };

    stagingLineStyle = {
        strokeColor: '#2e3436',
        strokeOpacity: 1,
        strokeWidth: 5
    };

    workerPointStyle = {
        pointRadius: 5,
        strokeColor: 'Transparent',
        fillColor: "blue",
        fillOpacity: 1,
    };

    selectedLineStyle = {
        strokeColor: 'yellow',
        strokeWidth: 5,
    };

    map.createMap = function (id) {

        $.ajax({
            url: rootUrl + "GetMapServiceInfo",
            //async: false,
            data: JSON.stringify({ customerID: 1 }),
            type: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (result) {
                console.log(result);
                var basemapDefs = result.BasemapInfo.Server;
                var basemapCount = result.BasemapInfo.Server.length;
                var mapExtent = result.MapExtent;
                var mapExtentArray = mapExtent.split(',');
                var initialExtent = new OpenLayers.Bounds(parseFloat(mapExtentArray[0].split(':')[1]), parseFloat(mapExtentArray[1].split(':')[1]), parseFloat(mapExtentArray[2].split(':')[1]), parseFloat(mapExtentArray[3].split(':')[1]));

                if (basemapCount != 0) {
                    for (var i = 0; i < basemapCount; i++) {
                        var mapServiceDesc = basemapDefs[i].Description;
                        var mapServiceUrl = basemapDefs[i].Url;
                        var basemapType = basemapDefs[i].Type;
                        var layerInfo;
                        if (basemapDefs[i].LayerInfo != "") {
                            layerInfo = JSON.parse(basemapDefs[i].LayerInfo);
                        }
                        if (basemapType == "ArcGIS Cache") {
                            if (layerInfo.spatialReference.wkid == "102100") {
                                //$("#HiddenMapSRS").val('EPSG:3857');
                            }
                            var layerMaxExtent = new OpenLayers.Bounds(
                                layerInfo.initialExtent.xmin,
                                layerInfo.initialExtent.ymin,
                                layerInfo.initialExtent.xmax,
                                layerInfo.initialExtent.ymax
                            );

                            //Max extent from layerInfo above    
                            var maxExtent = layerMaxExtent;
                            if (layerInfo.singleFusedMapCache) {
                                var resolutions = [];
                                for (var j = 0; j < layerInfo.tileInfo.lods.length; j++) {
                                    resolutions.push(layerInfo.tileInfo.lods[j].resolution);
                                }
                                if (i == 0) {
                                    map = new OpenLayers.Map(id, {
                                        maxExtent: maxExtent,
                                        restrictedExtent: maxExtent,
                                        StartBounds: layerMaxExtent,
                                        units: (layerInfo.units == "esriFeet") ? 'ft' : 'm',
                                        resolutions: resolutions,
                                        tileSize: new OpenLayers.Size(layerInfo.tileInfo.width, layerInfo.tileInfo.height),
                                        projection: 'EPSG:' + layerInfo.spatialReference.wkid
                                    });
                                }

                                var cacheLayer1 = new OpenLayers.Layer.ArcGISCache(mapServiceDesc, mapServiceUrl, {
                                    isBaseLayer: true,
                                    resolutions: resolutions,
                                    tileSize: new OpenLayers.Size(layerInfo.tileInfo.cols, layerInfo.tileInfo.rows),
                                    tileOrigin: new OpenLayers.LonLat(layerInfo.tileInfo.origin.x, layerInfo.tileInfo.origin.y),
                                    maxExtent: layerMaxExtent,
                                    projection: 'EPSG:' + layerInfo.spatialReference.wkid
                                });

                                map.addLayers([cacheLayer1]);

                                //map.addControl(new OpenLayers.Control.ZoomPanel());
                                //map.addControl(new OpenLayers.Control.PanPanel());
                                //map.addControl(new OpenLayers.Control.Attribution());
                                map.addControl(new OpenLayers.Control.LayerSwitcher());
                                map.addControl(new OpenLayers.Control.MousePosition());

                                //map.zoomToExtent(layerMaxExtent);


                            } else {
                                console.log("Service does not contain Cached Layer");
                            }
                        } else {
                            var extentArray = mapExtent.split(',');
                            extent = new OpenLayers.Bounds(parseFloat(extentArray[0].split(':')[1]), parseFloat(extentArray[1].split(':')[1]), parseFloat(extentArray[2].split(':')[1]), parseFloat(extentArray[3].split(':')[1]));
                            if (i == 0) {
                                map = new OpenLayers.Map({
                                    div: id,
                                    projection: new OpenLayers.Projection("EPSG:3857")
                                });
                            }
                            var basemap;
                            if (basemapType == "Google Map") {
                                basemap = new OpenLayers.Layer.Google("Google Map");
                            } else if (basemapType == "Bing Map") {
                                var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
                                basemap = new OpenLayers.Layer.Bing({
                                    name: "Bing Map",
                                    key: apiKey,
                                    type: "Road"
                                });
                            } else {
                                alert("Cannot display " + mapServiceDesc);
                                return false;
                            }
                            map.addLayer(basemap);
                            map.addControl(new OpenLayers.Control.LayerSwitcher());
                            map.addControl(new OpenLayers.Control.MousePosition());

                            map.setCenter(new OpenLayers.LonLat((parseFloat(extentArray[0].split(':')[1]) + parseFloat(extentArray[2].split(':')[1])) / 2, (parseFloat(extentArray[1].split(':')[1]) + parseFloat(extentArray[3].split(':')[1])) / 2).transform(
                                new OpenLayers.Projection("EPSG:3857"),
                                new OpenLayers.Projection("EPSG:3857")
                            ), 6);
                        }
                    }


                    map.zoomToExtent(initialExtent);
                    // var routeLayer = new OpenLayers.Layer.Vector("HighlightRouteSegement", {
                    //     displayInLayerSwitcher: false,
                    // });
                    //map.addLayers([routeLayer]);
                    var eventLayer = new OpenLayers.Layer.Vector("HighlightStagingEvents", {
                        displayInLayerSwitcher: false,
                    });
                    var verticeLayer = new OpenLayers.Layer.Vector("Highlightvertices", {
                        displayInLayerSwitcher: false,
                    });
                    // var lineLayer = new OpenLayers.Layer.Vector("HighlightLineEvents",{
                    //     displayInLayerSwitcher: false,
                    // });
                    var productionLayer = new OpenLayers.Layer.Vector("HighlightProductionEvents", {
                        displayInLayerSwitcher: false,
                    });

                    map.addLayers([productionLayer, eventLayer, verticeLayer]);

                    verticesLayer = map.getLayersByName('Highlightvertices')[0];
                    verticesLayer.style = workerPointStyle;
                    //stagingLayer = map.getLayersByName('HighlightLineEvents')[0];
                    stagingLayer = map.getLayersByName('HighlightStagingEvents')[0];
                    productionsLayer = map.getLayersByName('HighlightProductionEvents')[0];

                    /*layer switcher*/
                    // $('.olControlLayerSwitcher ').css('display', 'none'); // layer switcher by default not display
                    // $('.minimizeDiv ').css('display', 'none'); // do not display minimize img div
                    // $('.maximizeDiv ').css('display', 'none'); // do not display maximize img div
                    // $('.baseLbl').css('display', 'none'); // do not display layer base label
                    // $("#changeLayer").unbind("click").click(function() {
                    //     if ($('.olControlLayerSwitcher').css('display') != 'none') {
                    //         $('.olControlLayerSwitcher ').css('display', 'none');
                    //     } else {
                    //         $('.olControlLayerSwitcher ').css('display', '');
                    //         $('.layersDiv').css('display', '');
                    //         $('.olControlLayerSwitcher ').css('width', '150');
                    //         $('.olControlLayerSwitcher ').css('height', '113');
                    //     }
                    //     //drawControls['point'].deactivate();
                    //     pointCreateEnable = false;
                    //     eraseEnable = false;
                    //     pointMoveEnable = false;
                    // });


                } else {
                    alert("No available layers!");
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        }).done(function () {

        });
    };



    map.addLayer = function (stagingRouteID) {
        var routeSvcUrl = rootUrl + 'GetRouteGeometry';
        var dimension = 2;
        var precision = 3;
        var geoPropertiesKey = 'ID';
        var geometryKey = 'geometry';
        var lrsID = 6;
        // define LRS route constructor
        var lrs = new Lrs(routeSvcUrl, '', dimension, precision, geoPropertiesKey, geometryKey, lrsID);
        route = lrs.getRoute(stagingRouteID);

    };


    // set all global variables to default
    function setGlobalDefault() {
        // remove all features in layers
        verticesLayer.destroyFeatures();
        stagingLayer.destroyFeatures();
        productionsLayer.destroyFeatures();
        if (select != null) {
            select.deactivate();
            map.removeControl(select);
            select = null;
        }
        if (drag != null) {
            drag.deactivate();
            map.removeControl(drag);
            drag = null;
        }
        try {
            drawControls['point'].deactivate();
            map.removeControl(drawControls['point']);
            drawControls['point'] = null;
        } catch (err) {
            console.log('draw control not defined');
        }


        // button enable
        // $("#fromMeas").prop('disabled', false);
        // $("#toMeas").prop('disabled', false);
        // $("#lineCreate").prop('disabled', false);
        // $("#lineEdit").prop('disabled', false);
        // $("#lineMove").prop('disabled', false);
        // $("#pointCreate").prop('disabled', false);
        // $("#pointMove").prop('disabled', false);
        // $("#changeLayer").prop('disabled', false);
        // $("#erase").prop('disabled', false);

        // reset global variables
        eraseEnable = false;
        pointCreateEnable = false;
        pointMoveEnable = false;

        selectFlag = false;
    }



    // add feature initially to production layer
    function productionLayerAddFeature(productionEventArray, pointOrLine, productionLayer) {
        if (pointOrLine == 'point') {
            var productionPoint = new OpenLayers.Geometry.Point(productionEventArray[0].x, productionEventArray[0].y);
            var productionPtFeature = new OpenLayers.Feature.Vector(productionPoint, null, productionPointStyle);
            productionLayer.addFeatures([productionPtFeature]);
        } else {
            var productionLine = new OpenLayers.Geometry.LineString(productionEventArray[0]);
            var productionLnFeature = new OpenLayers.Feature.Vector(productionLine, null, productionLineStyle);
            productionLayer.addFeatures([productionLnFeature]);
        }
    }

    // add feature initially to staging layer
    function stagingLayerAddFeature(stagingEventArray, pointOrLine, stagingLayer) {
        if (pointOrLine == 'point') {
            var stagingPoint = new OpenLayers.Geometry.Point(stagingEventArray[0].x, stagingEventArray[0].y);
            var stagingPtFeature = new OpenLayers.Feature.Vector(stagingPoint, null, stagingPointStyle);
            stagingLayer.addFeatures([stagingPtFeature]);
        } else {
            var stagingLine = new OpenLayers.Geometry.LineString(stagingEventArray[0]);
            var stagingLnFeature = new OpenLayers.Feature.Vector(stagingLine, null, stagingLineStyle);
            stagingLayer.addFeatures([stagingLnFeature]);
        }
    }

    function productionLayerDraw(route, eventFeature, eventBeginMeas, eventEndMeas, productionLayer) {
        productionEventArray = eventFeature.getEventGeom(route, (parseFloat(eventBeginMeas) || null), (parseFloat(eventEndMeas) || null));
        if (productionEventArray != null) {
            if (eventBeginMeas == eventEndMeas) {
                productionLayerAddFeature(productionEventArray, 'point', productionLayer);
            } else {
                productionLayerAddFeature(productionEventArray, 'line', productionLayer);
            }
        }
        return productionEventArray;
    }

    function stagingLayerDraw(route, eventFeature, eventBeginMeas, eventEndMeas, stagingLayer) {
        stagingEventArray = eventFeature.getEventGeom(route, (parseFloat(eventBeginMeas) || null), (parseFloat(eventEndMeas) || null));
        if (stagingEventArray != null) {
            if (eventBeginMeas == eventEndMeas) {
                stagingLayerAddFeature(stagingEventArray, 'point', stagingLayer);
            } else {
                stagingLayerAddFeature(stagingEventArray, 'line', stagingLayer);
            }
        }
        return stagingEventArray;

    }

    function searchBoundsInEventArray(eventArray) {
        var currentMinX = eventArray[0][0].x;
        var currentMaxX = eventArray[0][0].x;
        var currentMinY = eventArray[0][0].y;
        var currentMaxY = eventArray[0][0].y;

        for (var i = 0; i < eventArray[0].length; i++) {
            if (eventArray[0][i].x < currentMinX) {
                currentMinX = eventArray[0][i].x;
            }
            if (eventArray[0][i].x > currentMaxX) {
                currentMaxX = eventArray[0][i].x;
            }
            if (eventArray[0][i].y < currentMinY) {
                currentMinY = eventArray[0][i].y;
            }
            if (eventArray[0][i].y > currentMaxX) {
                currentMaxY = eventArray[0][i].y;
            }
        }
        var obj = { 'min_x': currentMinX, 'min_y': currentMinY, 'max_x': currentMaxX, 'max_y': currentMaxY };
        return obj;
    }

    function getBounds(eventArray, offset) {
        var minX, minY, maxX, maxY;
        if (eventArray != null) {
            if (eventArray[1] == 'point') {
                var lon = eventArray[0].x;
                var lat = eventArray[0].y;
                minX = lon - offset;
                minY = lat - offset;
                maxX = lon + offset;
                maxY = lat + offset;

            } else if (eventArray[1] == 'line') {
                var obj = searchBoundsInEventArray(eventArray);
                minX = obj['min_x'] - offset;
                minY = obj['min_y'] - offset;
                maxX = obj['max_x'] + offset;
                maxY = obj['max_y'] + offset;

            } else {
                console.log('feature types are not consistent');
            }
        }
        return [minX, minY, maxX, maxY];
    }

    map.test1 = function (lon, lat) {
        var a = new OpenLayers.LonLat(lon, lat);
        map.panTo(a);
        //map.zoomTo(3);

    };


    map.showMap = function (UOM, routeIDCol, featureIDCol, beginMeasCol, endMeasCol, stagingFeatureID, stagingRouteID, stagingBeginMeas, stagingEndMeas, productionFeatureID, productionRouteID, productionBeginMeas, productionEndMeas, eventName) {
        //console.log(UOM, routeIDCol, featureIDCol, beginMeasCol, endMeasCol, stagingFeatureID, stagingRouteID, stagingBeginMeas, stagingEndMeas, productionFeatureID, productionRouteID, productionBeginMeas, productionEndMeas, eventName);
        setGlobalDefault();
        var routeSvcUrl = rootUrl + 'GetRouteGeometry';
        var dimension = 2;
        var precision = 3;
        var geoPropertiesKey = 'ID';
        var geometryKey = 'geometry';
        var lrsID = 1;
        // define LRS route constructor
        var lrs = new Lrs(routeSvcUrl, UOM, dimension, precision, geoPropertiesKey, geometryKey, lrsID);
        if (!route) { // first time get route
            console.log('no route');
            route = lrs.getRoute(stagingRouteID);
        } else {
            if (globalRouteID != stagingRouteID) { // new route selected
                console.log('new route');
                route = lrs.getRoute(stagingRouteID);
            }
        }
        globalRouteID = stagingRouteID;

        var EventSvcUrl = rootUrl + 'GetEventData';
        var feature_id_col = featureIDCol;
        var route_id_col = routeIDCol;
        var begin_meas_col = beginMeasCol;
        var end_meas_col = endMeasCol;
        var event_name = eventName;
        var layer = new MapLayer(EventSvcUrl, feature_id_col, route_id_col, begin_meas_col, end_meas_col, event_name);
        var beginMeasRange = stagingBeginMeas - 1;
        var endMeasRange = stagingEndMeas + 1;
        var events = layer.getEvents(stagingRouteID, beginMeasRange, endMeasRange, lrsID);
        var eventFeature = events.getEvent(stagingFeatureID);

        // defined event array variables
        var productionEventArray;
        var stagingEventArray;

        // used for moving line event
        var eventChangeBegin = parseFloat(stagingBeginMeas);
        var eventChangeEnd = parseFloat(stagingEndMeas);

        // change length by mouse event
        var eventBegin = parseFloat(stagingBeginMeas);
        var eventEnd = parseFloat(stagingEndMeas);
        var currentMeasure = 999999;

        // used for line event sketchmodified
        var currentLineFeatureNum = stagingLayer.features.length;
        var firstPointMeasure = -999999;

        var bounding;

        // get route geometry
        var routeGeom;
        var seg_count;
        var routeColName = route.getRouteMetaData()['routeGeomCol'];
        var geometry = route.getRouteGeoJson()[routeColName];
        seg_count = route.getSegmentCount();
        if (seg_count == 1) {
            routeGeom = [geometry.coordinates];
        } else {
            routeGeom = geometry.coordinates;
        }


        // initialize bounds and offset
        var bounds = new OpenLayers.Bounds();
        var offset = 250;
        var minX, maxX, minY, maxY;

        // initially draw production and staging layers features
        if ((productionFeatureID != -1) && (stagingFeatureID != -1)) {
            productionEventArray = productionLayerDraw(route, eventFeature, productionBeginMeas, productionEndMeas, productionsLayer);
            stagingEventArray = stagingLayerDraw(route, eventFeature, stagingBeginMeas, stagingEndMeas, stagingLayer);
            if ((productionEventArray[1] == 'point') && (stagingEventArray[1] == 'point')) {
                minX = Math.min(productionEventArray[0].x, stagingEventArray[0].x) - offset;
                minY = Math.min(productionEventArray[0].y, stagingEventArray[0].y) - offset;
                maxX = Math.max(productionEventArray[0].x, stagingEventArray[0].x) + offset;
                maxY = Math.max(productionEventArray[0].y, stagingEventArray[0].y) + offset;

            } else if ((productionEventArray[1] == 'line') && (stagingEventArray[1] == 'line')) {
                var productionObj = searchBoundsInEventArray(productionEventArray);
                var stagingObj = searchBoundsInEventArray(stagingEventArray);
                //console.log(productionObj);
                //console.log(stagingObj);
                minX = Math.min(productionObj['min_x'], stagingObj['min_x']) - offset;
                minY = Math.min(productionObj['min_y'], stagingObj['min_y']) - offset;
                maxX = Math.max(productionObj['max_x'], stagingObj['max_x']) + offset;
                maxY = Math.max(productionObj['max_y'], stagingObj['max_y']) + offset;
            } else {
                console.log('feature types are not consistent');
            }
        } else if ((productionFeatureID != -1) && (stagingFeatureID == -1)) {
            productionEventArray = productionLayerDraw(route, eventFeature, productionBeginMeas, productionEndMeas, productionsLayer);
            console.log(productionEventArray);
            bounding = getBounds(productionEventArray, offset);
            minX = bounding[0];
            minY = bounding[1];
            maxX = bounding[2];
            maxY = bounding[3];
        } else if ((productionFeatureID == -1) && (stagingFeatureID != -1)) {
            stagingEventArray = stagingLayerDraw(route, eventFeature, stagingBeginMeas, stagingEndMeas, stagingLayer);
            //console.log(stagingEventArray);
            bounding = getBounds(stagingEventArray, offset);
            minX = bounding[0];
            minY = bounding[1];
            maxX = bounding[2];
            maxY = bounding[3];
        } else {  // both produnction and staging feature id equal to -1
            // do not add any feature here
            var start = Strategy().searchMPLoc(routeGeom, route.getRouteBeginMeasure(), seg_count, precision);
            var end = Strategy().searchMPLoc(routeGeom, route.getRouteEndMeasure(), seg_count, precision);
            minX = Math.min(start[0], end[0]) - offset;
            minY = Math.min(start[1], end[1]) - offset;
            maxX = Math.max(start[0], end[0]) + offset;
            maxY = Math.max(start[1], end[1]) + offset;
        }

        // set bounds
        bounds.extend(new OpenLayers.LonLat(minX, minY));
        bounds.extend(new OpenLayers.LonLat(maxX, maxY));
        //console.log(bounds);

        // zoom to extent
        map.zoomToExtent(bounds);



        // set the initial 'from meas' and 'to meas' value
        //$("#fromMeas").prop('disabled', true);
        //$("#toMeas").prop('disabled', true);
        //if (stagingEventArray != null) {
        //    $('#fromMeas').val(parseFloat(parseFloat(stagingBeginMeas).toFixed(precision)));
        //    $('#toMeas').val(parseFloat(parseFloat(stagingEndMeas).toFixed(precision)));
        //} else {
        //    $('#fromMeas').val('empty');
        //    $('#toMeas').val('empty');
        //}



        // initially load the feature into the map
        if (stagingBeginMeas == stagingEndMeas) { // it is a point feature
            // $("#lineCreate").prop('disabled', true);
            // $("#lineEdit").prop('disabled', true);
            // $("#lineMove").prop('disabled', true);


            // drag implementation for point feature
            drag = new OpenLayers.Control.DragFeature(stagingLayer, {
                onComplete: function () { drag.deactivate(); select.unselectAll(); },
                onDrag: function () {
                    var lon = stagingLayer.selectedFeatures[0].geometry.x;
                    var lat = stagingLayer.selectedFeatures[0].geometry.y;
                    var measure = parseFloat(route.getMeasure(lon, lat).toFixed(precision));
                    //console.log(measure);
                    var locArray = Strategy().searchMPLoc(routeGeom, measure, seg_count, precision);
                    //console.log(locArray);
                    if (locArray != []) {
                        stagingLayer.selectedFeatures[0].geometry.x = locArray[0];
                        stagingLayer.selectedFeatures[0].geometry.y = locArray[1];
                    }
                    //$('#fromMeas').val(parseFloat(route.getMeasure(stagingLayer.selectedFeatures[0].geometry.x,stagingLayer.selectedFeatures[0].geometry.y).toFixed(precision)));
                    //$('#toMeas').val($('#fromMeas').val());
                }
            });




            select = new OpenLayers.Control.SelectFeature(stagingLayer, {
                //autoActivate: true,
                multiple: false,
                clickout: true,
                hover: false,
                click: true,
                box: false,

                onSelect: function (evt) {
                    //console.log(evt);
                    //$("#fromMeas").prop('disabled', true);
                    //$("#toMeas").prop('disabled', true);
                    //$('#fromMeas').val(parseFloat(route.getMeasure(stagingLayer.selectedFeatures[0].geometry.x,stagingLayer.selectedFeatures[0].geometry.y).toFixed(precision)));
                    //$('#toMeas').val($('#fromMeas').val());
                    //console.log(stagingLayer.selectedFeatures);
                    if (!eraseEnable) {
                        drag.overFeature(stagingLayer.selectedFeatures[0]);
                    }
                    if (eraseEnable) {
                        if (stagingLayer.selectedFeatures) {
                            //confirm("Are you sure deleting this feature?");
                            if (confirm("Are you sure deleting this feature?") == true) {
                                stagingLayer.removeFeatures(stagingLayer.selectedFeatures); //remove the feature
                            }
                            select.unselectAll();
                            //$("#fromMeas").prop('disabled', true);
                            //$("#toMeas").prop('disabled', true);
                            select.deactivate();
                            eraseEnable = false;
                        }
                    }
                },
                onUnselect: function () {
                    drag.deactivate();
                    //$("#fromMeas").prop('disabled', true);
                    //$("#toMeas").prop('disabled', true);
                },
                //geometryTypes: ['OpenLayers.Geometry.Point'],
            });
            map.addControl(select);
            map.addControl(drag);



            stagingLayer.events.on({
                'sketchmodified': function (e) {
                    var lon = e.feature.geometry.x;
                    var lat = e.feature.geometry.y;
                    var measure = parseFloat(route.getMeasure(lon, lat).toFixed(precision));
                    //console.log(measure);
                    var locArray = Strategy().searchMPLoc(routeGeom, measure, seg_count, precision);
                    if (locArray != []) {
                        e.feature.geometry.x = locArray[0];
                        e.feature.geometry.y = locArray[1];
                    }
                    //$('#fromMeas').val(parseFloat(route.getMeasure(e.feature.geometry.x,e.feature.geometry.y).toFixed(precision)));
                    //$('#toMeas').val($('#fromMeas').val());
                }
            });

            // draw features
            drawControls = {
                point: new OpenLayers.Control.DrawFeature(stagingLayer,
                    OpenLayers.Handler.Point, {
                        featureAdded: function (pt) {
                            //$("#fromMeas").prop('disabled', false);
                            //$("#toMeas").prop('disabled', false);
                            stagingLayer.style = stagingPointStyle;
                            stagingLayer.redraw(pt);
                            drawControls['point'].deactivate();
                            pointCreateEnable = false;
                            pointMoveEnable = false;
                        }
                    })
            };
            map.addControl(drawControls['point']);
            //drawControls['point'].activate();


        } else { // it is a line feature
            // $("#pointCreate").prop('disabled', true);
            // $("#pointMove").prop('disabled', true);

            drag = new OpenLayers.Control.DragFeature(verticesLayer, {
                //autoActivate: true,
                onComplete: function () { },

                onDrag: function (e) {

                    if (lineEditEnable) {

                        /*change length by mouse*/
                        var lon = verticesLayer.selectedFeatures[0].geometry.x;
                        var lat = verticesLayer.selectedFeatures[0].geometry.y;
                        var measure = parseFloat(route.getMeasure(lon, lat).toFixed(precision));
                        var locArray = Strategy().searchMPLoc(routeGeom, measure, seg_count, precision);
                        if (locArray != []) {
                            verticesLayer.selectedFeatures[0].geometry.x = locArray[0];
                            verticesLayer.selectedFeatures[0].geometry.y = locArray[1];
                        }
                        var measure = parseFloat(route.getMeasure(verticesLayer.selectedFeatures[0].geometry.x, verticesLayer.selectedFeatures[0].geometry.y).toFixed(precision));
                        var newEventArray;
                        if (selectFlag == true) {
                            $('#toMeas').val(measure);
                            newEventArray = eventFeature.getEventGeom(route, eventBegin, measure);
                            eventEnd = measure;
                        } else {
                            $('#fromMeas').val(measure);
                            newEventArray = eventFeature.getEventGeom(route, measure, eventEnd);
                            eventBegin = measure;
                        }
                        stagingLayer.removeAllFeatures();
                        var line = new OpenLayers.Geometry.LineString(newEventArray[0]);
                        var LnFeature = new OpenLayers.Feature.Vector(line, null, stagingLineStyle);
                        stagingLayer.addFeatures([LnFeature]);
                    }

                    if (pointMoveEnable) {
                        // drag whole line move test
                        var lon = e.geometry.x;
                        var lat = e.geometry.y;
                        var measure = parseFloat(route.getMeasure(lon, lat).toFixed(precision));
                        //console.log(measure);
                        var locArray = Strategy().searchMPLoc(routeGeom, measure, seg_count, precision);
                        if (locArray != []) {
                            e.geometry.x = locArray[0];
                            e.geometry.y = locArray[1];
                        }
                        console.log(eventFeature);
                        // var begin_mp = eventFeature.getEventBeginMeasure();
                        // var end_mp = eventFeature.getEventEndMeasure();
                        var newBegin = eventBegin + measure - currentMeasure;
                        var newEnd = eventEnd + measure - currentMeasure;
                        var newEventArray;
                        newEventArray = eventFeature.getEventGeom(route, newBegin, newEnd);
                        eventBegin = newBegin;
                        eventEnd = newEnd;
                        //$('#fromMeas').val(eventBegin.toFixed(precision));
                        //$('#toMeas').val(eventEnd.toFixed(precision));
                        stagingLayer.removeAllFeatures();
                        var line = new OpenLayers.Geometry.LineString(newEventArray[0]);
                        var LnFeature = new OpenLayers.Feature.Vector(line, null, selectedLineStyle);
                        stagingLayer.addFeatures([LnFeature]);
                    }

                }

            });



            select = new OpenLayers.Control.SelectFeature(verticesLayer, {
                //autoActivate: true,
                //name: 'selectFeat',
                multiple: false,
                clickout: true,
                hover: false,
                click: true,
                box: false,
                selectStyle: workerPointStyle,
                onSelect: function (evt) {
                    //console.log('selected');
                    //evt.style = selected_polygon_style;
                    //stagingLayer.redraw();
                    //console.log(typeof(route1333.getMeasure(verticesLayer.selectedFeatures[0].geometry.x,verticesLayer.selectedFeatures[0].geometry.y).toFixed(precision)));
                    //console.log(typeof($('#toMeas').val()));
                    if (!eraseEnable) {
                        console.log(typeof (precision));
                        console.log(route.getMeasure(verticesLayer.selectedFeatures[0].geometry.x, verticesLayer.selectedFeatures[0].geometry.y).toFixed(precision));
                        console.log($('#toMeas').val());
                        if (Math.abs((parseFloat($('#toMeas').val()) - route.getMeasure(verticesLayer.selectedFeatures[0].geometry.x, verticesLayer.selectedFeatures[0].geometry.y).toFixed(precision))) <= 5 * Math.pow(10, -1 * precision)) {
                            //console.log('here');
                            selectFlag = true;
                        } else {
                            selectFlag = false;
                        }
                        console.log(selectFlag);
                        stagingLayer.features[0].style = selectedLineStyle;
                        stagingLayer.redraw(stagingLayer.features[0]);
                        drag.overFeature(verticesLayer.selectedFeatures[0]);
                    } else {
                        if ((verticesLayer.selectedFeatures) && (stagingLayer.features.length != 0)) {
                            //confirm("Are you sure deleting this feature?");
                            if (confirm("Are you sure deleting this feature?") == true) {
                                stagingLayer.removeAllFeatures(); //remove the feature
                                $('#fromMeas').val('empty');
                                $('#toMeas').val('empty');
                            }
                            select.unselectAll();
                            $("#fromMeas").prop('disabled', true);
                            $("#toMeas").prop('disabled', true);
                            select.deactivate();
                            verticesLayer.removeAllFeatures();
                            eraseEnable = false;
                            drawControls['point'].deactivate();
                        }
                    }
                },
                onUnselect: function (evt) {
                    console.log('unselected');
                    if (stagingLayer.features.length != 0) {
                        eventFeature.setBeginMeasure(eventBegin);
                        eventFeature.setEndMeasure(eventEnd);
                        if (pointMoveEnable) {
                            selectFlag = false;
                            stagingLayer.features[0].style = stagingLineStyle;
                            stagingLayer.redraw(stagingLayer.features[0]);

                            select.unselectAll();
                            select.deactivate();

                            verticesLayer.removeAllFeatures();
                            drawControls['point'].activate();
                            //console.log(selectFlag);
                            //evt.style = style;
                            //stagingLayer.redraw();
                            drag.deactivate();
                        }
                        if (lineEditEnable) {
                            console.log('here');
                            selectFlag = false;
                            select.unselectAll();
                            drag.deactivate();

                        }
                    }
                },

                //geometryTypes: ['OpenLayers.Geometry.Point'],
            });


            verticesLayer.events.on({
                'sketchmodified': function (e) {

                    // snap implementation
                    var lon = e.feature.geometry.x;
                    var lat = e.feature.geometry.y;
                    var measure = parseFloat(route.getMeasure(lon, lat).toFixed(precision));
                    //console.log(measure);
                    var locArray = Strategy().searchMPLoc(routeGeom, measure, seg_count, precision);
                    if (locArray != []) {
                        e.feature.geometry.x = locArray[0];
                        e.feature.geometry.y = locArray[1];

                    }

                    if (pointCreateEnable) {
                        // create new line feature implementation
                        if (verticesLayer.features.length == 1) {
                            if (stagingLayer.features.length - 1 > currentLineFeatureNum) {
                                //console.log('here');
                                stagingLayer.removeFeatures(stagingLayer.features[stagingLayer.features.length - 1]);
                            }
                            newEventArray = eventFeature.getEventGeom(route, currentMeasure, measure);
                            var line = new OpenLayers.Geometry.LineString(newEventArray[0]);
                            var LnFeature = new OpenLayers.Feature.Vector(line, null, stagingLineStyle);
                            stagingLayer.addFeatures([LnFeature]);
                        }
                    }

                },
            });


            drawControls = {
                point: new OpenLayers.Control.DrawFeature(verticesLayer,
                    OpenLayers.Handler.Point, {
                        handlerOptions: {
                            style: workerPointStyle,
                        },
                        featureAdded: function (pt) {
                            var lon = pt.geometry.x;
                            var lat = pt.geometry.y;
                            currentMeasure = parseFloat(route.getMeasure(lon, lat).toFixed(precision));
                            //console.log(verticesLayer.features[0]);
                            //console.log(pt);
                            if (!pointCreateEnable) {
                                select.activate();
                                select.select(pt);
                                //console.log(verticesLayer.selectedFeatures[0]);
                                drawControls['point'].deactivate();
                            } else {
                                if (verticesLayer.features.length == 1) {
                                    eventBegin = currentMeasure;
                                    $('#fromMeas').val(eventBegin);
                                }
                                if (verticesLayer.features.length == 2) {
                                    verticesLayer.removeAllFeatures();
                                    drawControls['point'].deactivate();
                                    currentLineFeatureNum += 1;
                                    pointCreateEnable = false;
                                    eventEnd = currentMeasure;
                                    $('#toMeas').val(eventEnd);

                                }
                            }
                        },

                    })
            };
            map.addControl(drawControls['point']);
            //drawControls['point'].activate();

            map.addControl(select);
            map.addControl(drag);






        }



        // create point feature button clicked
        $('#pointCreate').unbind("click").click(function () {
            if (stagingBeginMeas == stagingEndMeas) {
                eraseEnable = false;
                pointMoveEnable = false;
                select.deactivate();
                if (pointCreateEnable) {
                    drawControls['point'].deactivate();
                    pointCreateEnable = false;
                } else if (!pointCreateEnable) {
                    drawControls['point'].activate();
                    pointCreateEnable = true;
                }
            } else {
                // create line feature
                eraseEnable = false;
                pointMoveEnable = false;
                lineEditEnable = false;
                drag.deactivate();
                select.unselectAll();
                select.deactivate();
                verticesLayer.removeAllFeatures();
                if (pointCreateEnable) {
                    drawControls['point'].deactivate();
                    pointCreateEnable = false;
                } else if (!pointCreateEnable) {
                    drawControls['point'].activate();
                    pointCreateEnable = true;
                }
            }

        });


        // edit feature button clicked
        $('#lineEdit').unbind("click").click(function () {
            if (stagingBeginMeas == stagingEndMeas) {
                // it is a point, just move it
            } else {
                eraseEnable = false;
                pointMoveEnable = false;
                pointCreateEnable = false;
                drag.deactivate();
                select.unselectAll();
                verticesLayer.removeAllFeatures();
                if (lineEditEnable) {
                    select.deactivate();
                    lineEditEnable = false;
                } else if (!lineEditEnable) {
                    select.activate();
                    lineEditEnable = true;
                    drawControls['point'].deactivate();
                    if (stagingEventArray[0].length > 1) {

                        var beginArray = Strategy().searchMPLoc(routeGeom, eventBegin, seg_count, precision);
                        var endArray = Strategy().searchMPLoc(routeGeom, eventEnd, seg_count, precision);
                        var beginPoint = new OpenLayers.Geometry.Point(beginArray[0], beginArray[1]);
                        var firstDot = new OpenLayers.Feature.Vector(beginPoint);
                        var endPoint = new OpenLayers.Geometry.Point(endArray[0], endArray[1]);
                        var lastDot = new OpenLayers.Feature.Vector(endPoint);
                        verticesLayer.addFeatures([firstDot]);
                        verticesLayer.addFeatures([lastDot]);
                    }
                }
            }

        });

        // move feature clicked
        $("#pointMove").unbind("click").click(function () {
            if (stagingBeginMeas == stagingEndMeas) { // point move clicked
                eraseEnable = false;
                pointCreateEnable = false;
                drawControls['point'].deactivate();
                if (pointMoveEnable) {
                    select.deactivate();
                    pointMoveEnable = false;
                } else if (!pointMoveEnable) {
                    select.activate();
                    pointMoveEnable = true;
                }
            } else { // line move clicked
                select.unselectAll();
                select.deactivate();
                verticesLayer.removeAllFeatures();
                eraseEnable = false;
                lineEditEnable = false;
                pointCreateEnable = false;
                if (pointMoveEnable) {
                    drawControls['point'].deactivate();
                    pointMoveEnable = false;
                } else if (!pointMoveEnable) {
                    drawControls['point'].activate();
                    pointMoveEnable = true;
                }
            }
        });

        // erase feature button clicked for both line feature and point feature
        $("#erase").unbind("click").click(function () {
            if (stagingBeginMeas == stagingEndMeas) {
                eraseEnable = true;
                select.activate();
                select.unselectAll();
                pointCreateEnable = false;
                pointMoveEnable = false;
            } else {
                pointMoveEnable = false;
                lineEditEnable = false;
                pointCreateEnable = false;
                if (stagingLayer.features.length != 0) {
                    eraseEnable = true;
                    select.activate();
                    select.unselectAll();
                    drawControls['point'].activate();
                }
            }
        });

    }


    return map;



}