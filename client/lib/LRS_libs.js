/**
 * LRS_libs - the generic library for map layer drawing
 *
 * @author    Teng Zhang
 * @copyright (c) GISTIC Research Inc.
 * @date      April 4, 2014
 * @version   v1.0
 */

// this lib should be put after openlayer libs


// common algorithm design pattern(strategy pattern). Calling by Strategy().method defined in this class
var Strategy = function() {

	return {
		searchMPLoc: function(routeGeom, milePost, seg_count, presicion) {
	        var target_seg = null;
	        for (var i = 0; i < seg_count; i++) {
				var tmp_seg = routeGeom[i];
				//console.log(tmp_seg);
				tmp_seg.sort(function (prev, next) {
	        		return (prev[2] - next[2])
	   			});
	   			var node_count = tmp_seg.length;
	   			if (node_count == 0) {
	   				return [];
	   			}
	   			var seg_start_mp = parseFloat(tmp_seg[0][2].toFixed(presicion));
	       		var seg_end_mp = parseFloat(tmp_seg[node_count - 1][2].toFixed(presicion));
	            if (milePost > seg_start_mp && milePost < seg_end_mp) {
	                target_seg = tmp_seg;
	                break;
	            } else if (milePost == seg_start_mp || milePost == seg_end_mp) {
	            	return [tmp_seg[0][0], tmp_seg[0][1], milePost];
	            }
	        }
	        // milepost does not fall into any route segment
	        if (!target_seg) {
	        	console.log('milepost does not fall into route segment');
	            return [];
	        }
	        var minIndex = 0;
	        var maxIndex = target_seg.length - 1;
	        while (minIndex >= 0 && maxIndex > 0 && minIndex < maxIndex) {
	            var midIndex = minIndex + Math.floor((maxIndex - minIndex) / 2);
	            var midCoord = target_seg[midIndex];
	            var prevCoord = target_seg[midIndex - 1];
	            var nextCoord = target_seg[midIndex + 1];

	            if (milePost > midCoord[2]) {
	                minIndex = midIndex;
	            } else if (typeof (prevCoord) === 'undefined') {
	                return [midCoord[0], midCoord[1], milePost]
	            } else if (milePost < prevCoord[2]) {
	                maxIndex = midIndex;
	            } else { // nearest vertex
	                minIndex = maxIndex;

	                var mDiffRatio = (milePost - prevCoord[2]) / (midCoord[2] - prevCoord[2]);
	                var xLoc = prevCoord[0] + mDiffRatio * (midCoord[0] - prevCoord[0]);
	                var yLoc = prevCoord[1] + mDiffRatio * (midCoord[1] - prevCoord[1]);
	                return [xLoc, yLoc, milePost];
	            }
	        }
	        return [];
		},
	};
};

var Route = function(geoJson, routeMetaData) {

	var geo_json = geoJson;
	//console.log(geo_json);
	var route_meta_data = routeMetaData;
	// private method can not be reached beyond the object scope
	getMeasurehelper = function(bound, numSegment) {
		var measure_precis = route_meta_data['Measure_Precision']; // for example, keep decimal places in three digits
		var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;
		var segment_count = numSegment;
		var geometry_name = route_meta_data['routeGeomCol'];
		var geometry = geo_json[geometry_name];
		var begin_seg = segment_count > 1 ? geometry.coordinates[bound]: geometry.coordinates;   
        begin_seg.sort(function (prev, next) {
            return (prev[2] - next[2])
        });
        if (begin_seg.length > 0) {
        	if (bound == 0) {
        		return parseFloat(begin_seg[0][2].toFixed(precis)); // get the begin measure to precision
        	}
        	return parseFloat(begin_seg[begin_seg.length - 1][2].toFixed(precis));
        }
        // catch a data processing problem
        return null;

  	};
  	// helper function to search the nearest milepost location
  	GetRouteLocCoordFromMP = function(milePost, segCount) {
  		if (milePost < 0) {
  			return [];
  		}
		var seg_count = segCount;
		var geometry_name = route_meta_data['routeGeomCol'];
		var measure_precis = route_meta_data['Measure_Precision']; // for example, keep decimal places in three digits
		var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;
		var geometry = geo_json[geometry_name];
		var routeGeom;
		if (seg_count == 1) {
			routeGeom = [geometry.coordinates];
		} else {
			routeGeom = geometry.coordinates;
		}
		return Strategy().searchMPLoc(routeGeom, milePost, seg_count, precis);
  	};

	return {

		getRouteLocCoordFromMP: function(milePost, segCount) {
			return GetRouteLocCoordFromMP(milePost, segCount);
		},

		getRouteMetaData: function() {
			return route_meta_data;
		},

		getRouteGeoJson: function() {
			return geo_json;
		},

		/**
		* Method: getSegmentCount
		* get number of route segments
		* 
		* Returns:
		* {number} segments count
		*/
		getSegmentCount: function() {
			var geometry_name = route_meta_data['routeGeomCol'];
			var geometry = geo_json[geometry_name];
            var geom_type = geometry.type;
            if (geom_type === 'MultiLineString') {
            	return geometry.coordinates.length;	
            }
            else if (typeof(geom_type) === 'undefined') {
            	if (typeof(geometry.coordinates[0][0][0]) === 'undefined') {
            		return 1;
            	} else {
            		return geometry.coordinates.length;
            	}
            }
            return 1;
			
		},
		
		/**
		* Method: getBeginMeasure
		* get the begin measure of the route
		* 
		* Returns:
		* {number} begin measurement if data is valid
		* {null} if data processing problem
		*/		
		getRouteBeginMeasure: function() {
			return getMeasurehelper(0, this.getSegmentCount());
		},
		
		/**
		* Method: getEndMeasure
		* get the end measure of the route
		* 
		* Returns:
		* {number} end measurement if data is valid
		* {null} if data processing problem
		*/			
		getRouteEndMeasure: function() {
			var num_seg = this.getSegmentCount();
			return getMeasurehelper(num_seg - 1, num_seg);
		},
		
		/**
		* Method: getRouteID
		* get the id of current route
		* 
		* Returns:
		* {string} route id
		*/
		getRouteID: function() {
			var geometry_name = route_meta_data['routeGeomCol'];
			var geometry = geo_json[geometry_name];
			var id_col_name = route_meta_data['routeIDCol'];
			return geometry.properties[id_col_name];
		},
		
		getMeasure: function(xCoord, yCoord) {
			var seg_count = this.getSegmentCount();
			var geometry_name = route_meta_data['routeGeomCol'];
			var geometry = geo_json[geometry_name];
			var routeGeom;
			if (seg_count == 1) {
				routeGeom = [geometry.coordinates];
			} else {
				routeGeom = geometry.coordinates;
			}
			var tempDist = null;
        	var calculate_mp = null;
       	 	var minDist = -1;
	        for (var i = 0; i < seg_count; i++) {
	            var new_seg = routeGeom[i];
	            var nodeCount = new_seg.length;
	            var prev = 0;
	            var next = 1;
	            var max = nodeCount - 1;

	            while (prev <= max && next <= max) {
	                var xPrev = new_seg[prev][0],
	                    xNext = new_seg[next][0];
	                var yPrev = new_seg[prev][1],
	                    yNext = new_seg[next][1];
	                tempDist = Math.pow((xCoord - (xPrev + xNext) / 2), 2) + Math.pow((yCoord - (yPrev + yNext) / 2), 2);

	                if (minDist >= 0 && minDist <= tempDist) {
	                    prev += 1;
	                    next += 1;
	                } else {
	                    minDist = tempDist;
	                    var mPrev = new_seg[prev][2],
	                        mNext = new_seg[next][2];
	                    var diffPrev = Math.sqrt(Math.pow((xCoord - xPrev), 2) + Math.pow((yCoord - yPrev), 2));
	                    var diffNext = Math.sqrt(Math.pow((xCoord - xNext), 2) + Math.pow((yCoord - yNext), 2));
	                    var legDiff = Math.sqrt(Math.pow((xNext - xPrev), 2) + Math.pow((yNext - yPrev), 2));
	                    if (diffNext > legDiff) {
	                        calculate_mp = mPrev - (mNext - mPrev) * diffPrev / legDiff;
	                    } else {
	                        calculate_mp = mPrev + (mNext - mPrev) * diffPrev / legDiff;
	                    }
	                }
	            }
	        }

	        return calculate_mp;
		},
		
		getRouteGeom: function(routeStartMP, routeEndMP) {
			if ((routeStartMP < 0) || (routeEndMP < 0)) {
				return null;
			}
			var seg_count = this.getSegmentCount();
			var geometry_name = route_meta_data['routeGeomCol'];
			var geometry = geo_json[geometry_name];
			var routeGeom;
			if (seg_count == 1) {
				routeGeom = [geometry.coordinates];
			} else {
				routeGeom = geometry.coordinates;
			}
			var allPoints = [];
			for (var i = 0; i < seg_count; i++) {
				var tmp_seg = routeGeom[i];
				tmp_seg.sort(function (prev, next) {
            		return (prev[2] - next[2])
       			});
       			var node_count = tmp_seg.length;
       			var seg_start_mp = tmp_seg[0][2];
           		var seg_end_mp = tmp_seg[node_count - 1][2];
           		var points = []; //store openlayer points
           		// user request is not within current route segment
           		if (seg_end_mp <= routeStartMP || seg_start_mp >= routeEndMP) {
                	continue;
            	}
	            if (seg_start_mp >= routeStartMP && seg_end_mp <= routeEndMP) {
	                for (var j = 0; j < node_count; j++) // middle vertices
	                {
	                    var tmp_node = tmp_seg[j];
	                    points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
	                }
	            } else if (seg_start_mp >= routeStartMP && seg_end_mp > routeEndMP) {
	                for (var j = 0; j < node_count; j++) // middle vertices
	                {
	                    var tmp_node = tmp_seg[j];
	                    if (tmp_node[2] < routeEndMP) {
	                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
	                    }
	                }
	                var loc_End = GetRouteLocCoordFromMP(routeEndMP, seg_count);
	                if (loc_End.length > 0) {
	                    points.push(new OpenLayers.Geometry.Point(loc_End[0], loc_End[1]));
	                }
            	} else if (seg_start_mp < routeStartMP && seg_end_mp <= routeEndMP) {
                	var loc_Start = GetRouteLocCoordFromMP(routeStartMP, seg_count);
	                if (loc_Start.length > 0) {
	                    points.push(new OpenLayers.Geometry.Point(loc_Start[0], loc_Start[1]));
	                }
	                for (var j = 0; j < node_count; j++) // middle vertices
	                {
	                    var tmp_node = tmp_seg[j];
	                    if (tmp_node[2] > routeStartMP) {
	                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
	                    }
	                }
	            } else if (seg_start_mp < routeStartMP && seg_end_mp > routeEndMP) {
	                var loc_Start = GetRouteLocCoordFromMP(routeStartMP, seg_count);
	                if (loc_Start.length > 0) {
	                    points.push(new OpenLayers.Geometry.Point(loc_Start[0], loc_Start[1]));
	                }
	                for (var j = 0; j < node_count; j++) // middle vertices
	                {
	                    var tmp_node = tmp_seg[j];

	                    if (tmp_node[2] > routeStartMP && tmp_node[2] < routeEndMP) {
	                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
	                    }
	                }
	                var loc_End = GetRouteLocCoordFromMP(routeEndMP, seg_count);
	                if (loc_End.length > 0) {
	                    points.push(new OpenLayers.Geometry.Point(loc_End[0], loc_End[1]));
	                }
	            }
	            allPoints.push(points);
			}
			return allPoints;
		},
	};
};




/**
* Class: Lrs
* Define a LRS routes class with service url and meta data
* 
* Parameters:
* svcUrl - service url to get specific route info
* uom - unit of measure
* dimensions - dimension of the current LRS 
* precision - precision of current measure
* routeIDCol - id column name of current route id
* routeGeomCol - geometry column name of current route geometry
* lrsID - LRS id 
*
*/
var Lrs = function(svcUrl, uom, dimensions, precision, routeIDCol, routeGeomCol, lrsID) {
	
	// private variables
	var svc_url = svcUrl;
	var unit_of_measure = uom;
	var dim = dimensions;
	var precis = precision;
	var route_id_col = routeIDCol;
	var route_geom_col = routeGeomCol;
	var lrs_id = lrsID;
	
	
	// public return methods
	return {


		/**
		* Method: getLrsID
		* get the lrs id of current lrs
		* 
		* Returns:
		* {number} The meta data object
		*/
		getLrsID: function() {
			return lrs_id;
		},


		/**
		* Method: getLrsMetaData
		* get the meta data of current lrs
		* 
		* Returns:
		* {Object} The meta data object
		*/
		getLrsMetaData: function() {
			var metaObject = {};
			metaObject['UOM'] = unit_of_measure;
			metaObject['Dimensions'] = dim;
			metaObject['Measure_Precision'] = precis;
			metaObject['routeIDCol'] = route_id_col;
			metaObject['routeGeomCol'] = route_geom_col;
			return metaObject;
		},

	
		/**
		* Method: getRoute
		* get the route object given specific ID 
		* 
		* Parameters:
		* routeID - ID of the route 
		* 
		* Returns:
		* {Route} The route object
		*/
		getRoute: function(routeId) {
			var geoJson;
			var lrs_meta_data = this.getLrsMetaData();
			$.ajax({
				type: 'POST',
				url: svc_url,
				data: JSON.stringify({ 
					"routeID": routeId,
					"customerID":1
					//"LRS_ID": lrs_id,
					//header: 'LBE',
					//sessionID: 'abcd'
				}),
				//dataType: 'json',
				timeout:120000,
				headers: {
				'Content-Type': 'application/json'
				},
				async:false,
				success:function(response){
					geoJson = JSON.parse(response.data_str);
					//console.log(response.data_str);
					console.log('ajax success');
					//return new Route(geoJson, lrs_meta_data);
				},
				error:function(response){
					geoJson = {};
					console.log(geoJson);
					//return new Route(geoJson, lrs_meta_data);
					
				}
				
			})
			//console.log('main')
			return new Route(geoJson, lrs_meta_data);
		},
		
	};
	
};




var Event = function(eventJsonObj, eventMetaData) {
	
	var event_json_obj = eventJsonObj;
	var event_meta_data = eventMetaData;

	GetEventLocCoordFromMP = function(milePost, segCount, routeGeometry, precision) {
  		if (milePost < 0) {
  			return [];
  		}
		var seg_count = segCount;
		
		var geometry = routeGeometry;
		var routeGeom;
		if (seg_count == 1) {
			routeGeom = [geometry.coordinates];
		} else {
			routeGeom = geometry.coordinates;
		}
		return Strategy().searchMPLoc(routeGeom, milePost, seg_count, precision);
	};

	return {

		/**
		* Method: getBeginMeasure
		* get the begin measure of the event
		* 
		* Returns:
		* {number} begin measure if has a number value
		* {null} null object if it is not a number value
		*/
		getEventBeginMeasure: function() {
			var from_meas_col = event_meta_data['fromMeasCol'];
			var from_meas = event_json_obj[from_meas_col];
			//console.log(event_json_obj);
			if (typeof(from_meas) == 'undefined') {
				return null;
			}
			return parseFloat(from_meas) || null;
		},
		
		/**
		* Method: getEndMeasure
		* get the end measure of the event
		* 
		* Returns:
		* {number} end measure if has a number value
		* {null} null object if it is not a number value
		*/
		getEventEndMeasure: function() {
			var to_meas_col = event_meta_data['toMeasCol'];
			var to_meas = event_json_obj[to_meas_col];
			if (typeof(to_meas) == 'undefined') {
				return null;
			}
			return parseFloat(to_meas) || null;
		},
		
		/**
		* Method: setBeginMeasure
		* set the begin measure of the event
		* 
		* Parameters:
		* beginMeasure - begin measure to be set
		*
		*/
		setBeginMeasure: function(beginMeasure) {
			if ((parseFloat(beginMeasure) || null) == null) {
				return;
			}
			var from_meas_col = event_meta_data['fromMeasCol'];
			event_json_obj[from_meas_col] = beginMeasure;
		},
		
		/**
		* Method: setEndMeasure
		* set the end measure of the event
		* 
		* Parameters:
		* endMeasure - end measure to be set
		*
		*/
		setEndMeasure: function(endMeasure) {
			if ((parseFloat(endMeasure) || null) == null) {
				return;
			}
			var to_meas_col = event_meta_data['toMeasCol'];
			event_json_obj[to_meas_col] = endMeasure;
		},
		
		getEventGeom: function(routeObj, eventBM, eventEM) {
			// illegal data processing
			if (!(eventBM || eventBM)) {
				return null;
			}
			var routeGeoJson = routeObj.getRouteGeoJson();
			var routeMetaData = routeObj.getRouteMetaData();
			var seg_count = routeObj.getSegmentCount();
			var measure_precis = routeMetaData['Measure_Precision']; // for example, keep decimal places in three digits
			var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;

			var geometry_name = routeMetaData['routeGeomCol'];
			var geometry = routeGeoJson[geometry_name];

			var eventBeginMeasure = parseFloat(eventBM.toFixed(precis));
			var eventEndMeasure = parseFloat(eventEM.toFixed(precis));
			var allEventsData = [];
			var flag = 'point';
			// point-based event feature, e.g. crash
			if (eventBeginMeasure == eventEndMeasure) {
				var eventLocCoord = GetEventLocCoordFromMP(eventBeginMeasure, seg_count, geometry, precis);
	            if (eventLocCoord.length === 0) {
	                return null;
	            }
	            var eventGeomData = new OpenLayers.Geometry.Point(eventLocCoord[0], eventLocCoord[1]);
	            allEventsData.push(eventGeomData);

			} 

			// line-based event feature, e.g. pavement type
			else if(eventBeginMeasure < eventEndMeasure) {
				flag = 'line';
				var routeGeom;
				if (seg_count == 1) {
					routeGeom = [geometry.coordinates];
				} else {
					routeGeom = geometry.coordinates;
				}
				for (var i = 0; i < seg_count; i++) {
					var tmp_seg = routeGeom[i];
					tmp_seg.sort(function (prev, next) {
	            		return (prev[2] - next[2])
	       			});
	       			var node_count = tmp_seg.length;
	       			var seg_start_mp = tmp_seg[0][2];
	           		var seg_end_mp = tmp_seg[node_count - 1][2];
	           		var points = []; //store openlayer points
	           		// user request is not within current route segment
	           		if (seg_end_mp <= eventBeginMeasure || seg_start_mp >= eventEndMeasure) {
	                	continue;
	            	}
		            if (seg_start_mp >= eventBeginMeasure && seg_end_mp <= eventEndMeasure) {
		                for (var j = 0; j < node_count; j++) // middle vertices
		                {
		                    var tmp_node = tmp_seg[j];
		                    points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
		                }
		            } else if (seg_start_mp >= eventBeginMeasure && seg_end_mp > eventEndMeasure) {
		                for (var j = 0; j < node_count; j++) // middle vertices
		                {
		                    var tmp_node = tmp_seg[j];
		                    if (tmp_node[2] < eventEndMeasure) {
		                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
		                    }
		                }
		                var loc_End = GetEventLocCoordFromMP(eventEndMeasure, seg_count, geometry, precis);
		                if (loc_End.length > 0) {
		                    points.push(new OpenLayers.Geometry.Point(loc_End[0], loc_End[1]));
		                }
	            	} else if (seg_start_mp < eventBeginMeasure && seg_end_mp <= eventEndMeasure) {
	                	var loc_Start = GetEventLocCoordFromMP(eventBeginMeasure, seg_count, geometry, precis);
		                if (loc_Start.length > 0) {
		                    points.push(new OpenLayers.Geometry.Point(loc_Start[0], loc_Start[1]));
		                }
		                for (var j = 0; j < node_count; j++) // middle vertices
		                {
		                    var tmp_node = tmp_seg[j];
		                    if (tmp_node[2] > eventBeginMeasure) {
		                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
		                    }
		                }
		            } else if (seg_start_mp < eventBeginMeasure && seg_end_mp > eventEndMeasure) {
		                var loc_Start = GetEventLocCoordFromMP(eventBeginMeasure, seg_count, geometry, precis);
		                if (loc_Start.length > 0) {
		                    points.push(new OpenLayers.Geometry.Point(loc_Start[0], loc_Start[1]));
		                }
		                for (var j = 0; j < node_count; j++) // middle vertices
		                {
		                    var tmp_node = tmp_seg[j];

		                    if (tmp_node[2] > eventBeginMeasure && tmp_node[2] < eventEndMeasure) {
		                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
		                    }
		                }
		                var loc_End = GetEventLocCoordFromMP(eventEndMeasure, seg_count, geometry, precis);
		                if (loc_End.length > 0) {
		                    points.push(new OpenLayers.Geometry.Point(loc_End[0], loc_End[1]));
		                }
		            }
		            allEventsData.push(points);
				}
			}

			allEventsData.push(flag);
			return allEventsData;

		},
	};
	
};



var events = function(eventsJsonObj, eventMetaData) {
	
	var events_json_obj = eventsJsonObj;
	var event_meta_data = eventMetaData;

	return{

		getEventGeoJson: function() {
			return events_json_obj;
		},
	
		/**
		* Method: getCount
		* get number of events in current route
		* 
		* Returns:
		* {number} number of events
		*/
		getCount: function() {
			return events_json_obj.length;
		},
		
		/**
		* Method: getEvent
		* get specific event given event id
		*
		* Parameters:
		* eventId - id of the event
		* 
		* Returns:
		* {Event} number of events
		*/		
		getEvent: function(eventId) {
			// no event data case
			if (this.getCount() == 0) {
				return new Event({}, event_meta_data)
			}
			var event_id_column = event_meta_data['eventIDCol'];
			var idIndex = -1;
			for (var i = 0; i < this.getCount(); i++) {
				if (events_json_obj[i][event_id_column] == eventId) {
					idIndex = i;
					break
				}
			}
			// no event has been selected with given id
			if (idIndex == -1) {
				return new Event({}, event_meta_data)
			}
			// event has been selected with given id
			return new Event(events_json_obj[idIndex], event_meta_data)
		},
		
		getEventsGeom: function(routeObj) {
			var num_events = this.getCount();
			if (num_events == 0) {
				return null;
			}
			var routeGeoJson = routeObj.getRouteGeoJson();
			var routeMetaData = routeObj.getRouteMetaData();
			var seg_count = routeObj.getSegmentCount();
			var measure_precis = routeMetaData['Measure_Precision']; // for example, keep decimal places in three digits
			var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;

			var geometry_name = routeMetaData['routeGeomCol'];
			var geometry = routeGeoJson[geometry_name];
			var allEventsData = [];
			for (var k = 0; k < num_events; k++) {
				var flag = 'point';
				var curEvent = new Event(events_json_obj[k], event_meta_data);
				var eventBeginMeasure = parseFloat(curEvent.getEventBeginMeasure().toFixed(precis));
				var eventEndMeasure = parseFloat(curEvent.getEventEndMeasure().toFixed(precis));
				// point-based event feature, e.g. crash
				if (eventBeginMeasure == eventEndMeasure) {
					var eventLocCoord = GetEventLocCoordFromMP(eventBeginMeasure, seg_count, geometry, precis);
		            if (eventLocCoord.length === 0) {
		                return null;
		            }
		            var eventGeomData = new OpenLayers.Geometry.Point(eventLocCoord[0], eventLocCoord[1]);
		            allEventsData.push(eventGeomData);

				} 
				// line-based event feature, e.g. pavement type
				else if(eventBeginMeasure < eventEndMeasure) {
					flag = 'line';
					var routeGeom;
					if (seg_count == 1) {
						routeGeom = [geometry.coordinates];
					} else {
						routeGeom = geometry.coordinates;
					}
					for (var i = 0; i < seg_count; i++) {
						var tmp_seg = routeGeom[i];
						tmp_seg.sort(function (prev, next) {
		            		return (prev[2] - next[2])
		       			});
		       			var node_count = tmp_seg.length;
		       			var seg_start_mp = tmp_seg[0][2];
		           		var seg_end_mp = tmp_seg[node_count - 1][2];
		           		var points = []; //store openlayer points
		           		// user request is not within current route segment
		           		if (seg_end_mp <= eventBeginMeasure || seg_start_mp >= eventEndMeasure) {
		                	continue;
		            	}
			            else if (seg_start_mp >= eventBeginMeasure && seg_end_mp <= eventEndMeasure) {
			                for (var j = 0; j < node_count; j++) // middle vertices
			                {
			                    var tmp_node = tmp_seg[j];
			                    points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
			                }
			            } else if (seg_start_mp >= eventBeginMeasure && seg_end_mp > eventEndMeasure) {
			                for (var j = 0; j < node_count; j++) // middle vertices
			                {
			                    var tmp_node = tmp_seg[j];
			                    if (tmp_node[2] < eventEndMeasure) {
			                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
			                    }
			                }
			                var loc_End = GetEventLocCoordFromMP(eventEndMeasure, seg_count, geometry, precis);
			                if (loc_End.length > 0) {
			                    points.push(new OpenLayers.Geometry.Point(loc_End[0], loc_End[1]));
			                }
		            	} else if (seg_start_mp < eventBeginMeasure && seg_end_mp <= eventEndMeasure) {
		                	var loc_Start = GetEventLocCoordFromMP(eventBeginMeasure, seg_count, geometry, precis);
			                if (loc_Start.length > 0) {
			                    points.push(new OpenLayers.Geometry.Point(loc_Start[0], loc_Start[1]));
			                }
			                for (var j = 0; j < node_count; j++) // middle vertices
			                {
			                    var tmp_node = tmp_seg[j];
			                    if (tmp_node[2] > eventBeginMeasure) {
			                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
			                    }
			                }
			            } else if (seg_start_mp < eventBeginMeasure && seg_end_mp > eventEndMeasure) {
			                var loc_Start = GetEventLocCoordFromMP(eventBeginMeasure, seg_count, geometry, precis);
			                if (loc_Start.length > 0) {
			                    points.push(new OpenLayers.Geometry.Point(loc_Start[0], loc_Start[1]));
			                }
			                for (var j = 0; j < node_count; j++) // middle vertices
			                {
			                    var tmp_node = tmp_seg[j];

			                    if (tmp_node[2] > eventBeginMeasure && tmp_node[2] < eventEndMeasure) {
			                        points.push(new OpenLayers.Geometry.Point(tmp_node[0], tmp_node[1]));
			                    }
			                }
			                var loc_End = GetEventLocCoordFromMP(eventEndMeasure, seg_count, geometry, precis);
			                if (loc_End.length > 0) {
			                    points.push(new OpenLayers.Geometry.Point(loc_End[0], loc_End[1]));
			                }
			            }

			            allEventsData.push(points);
					}
				}
			}
			allEventsData.push(flag);
			return allEventsData;
		},
	};
};



/**
* Class: MapLayer
* Define a event layer class with service url and meta data
* 
* Parameters:
* svcUrl - service url to get specific event data
* eventIDCol - id column name of current event id
* routeIDCol - id column name of current route id
* fromMeasCol - from measure column name
* toMeasCol - to measure column name
* eventName - current event name
*
*/
var MapLayer = function(svcUrl, eventIDCol, routeIDCol, fromMeasCol, toMeasCol, eventName) {
	
	// private variables
	var svc_url = svcUrl;
	var event_id_col = eventIDCol;
	var route_id_col = routeIDCol;
	var from_meas_col = fromMeasCol;
	var to_meas_col = toMeasCol;
	var event_name = eventName;
	
	// public return methods
	return {
	
		/**
		* Method: getEventName
		* get the name of a event family
		* 
		* Returns:
		* {string} event name
		*/
		getEventName: function() {
			return event_name;
		},
		
		
		/**
		* Method: getEventMetaData
		* get the meta data of events in specific route
		* 
		* Returns:
		* {Object} The meta data object
		*/
		getEventMetaData: function() {
			var metaObject = {};
			metaObject['eventIDCol'] = event_id_col;
			metaObject['routeIDCol'] = route_id_col;
			metaObject['fromMeasCol'] = from_meas_col;
			metaObject['toMeasCol'] = to_meas_col;
			return metaObject;
		},
		
		/**
		* Method: getEvents
		* get all events given begin measure, end measure and route id 
		* 
		* Parameters:
		* routeID - ID of the route
		* beginMeas - begin measure of the route
		* endMeas - end measure of the route
		* lrsID - id of current LRS
		* 
		* Returns:
		* {Events} The events object
		*/
		getEvents: function(routeID, beginMeas, endMeas, lrsID) {
			console.log(routeID, beginMeas, endMeas, event_name);
			var jsonObject;
			var event_meta_data = this.getEventMetaData();
			$.ajax({
				type: 'POST',
				url: svc_url,
				data: JSON.stringify({
					"customerID": 1,
					"routeID": routeID,
					"startMP": beginMeas,
					"endMP": endMeas,
					"eventName": event_name
					//"LRS_ID": lrsID
					//header: 'LBE',
					//sessionID: 'abcd',
					//ObsDate: null
				}),
				async:false,
				//dataType: 'json',
				//timeout:120000,
				headers: {
				'Content-Type': 'application/json'
				},
				success:function(response){
					jsonObject = JSON.parse(response.data_str)
					//console.log(jsonObject);
				},
				error:function(response){
					jsonObject = {};
					console.log(jsonObject);
				}
			}) 
			return new events(jsonObject, event_meta_data);
		},
		
	};
};