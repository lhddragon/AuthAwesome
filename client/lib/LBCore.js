// JavaScript source code
'use strict';
(function(window) {
	//Enumeration class
	// var lbsUrlRoot = {
	//     1: 'http://72.215.195.71:9002/api/data/',
	//     2: 'http://72.215.195.71:9003/api/data/',
	//     3: 'http://72.215.195.71:9004/api/data/',
	//     4: 'http://72.215.195.71:9005/api/data/',
	//     5: 'http://72.215.195.71:9006/api/data/'
	// };
	var lbsUrlRoot;
	var globalCustomerID = 0;
	var dataRecordThreshold = 200;

	///Enumeration object
	var lrsUom = {
		lableGraph: 'lableGraph',
		symbolGraph: 'symbolGraph'
	};
	var sLDGraphType = {
		M: 'M',
		FT: 'FT',
		KM: 'KM',
		MILE: 'MILE',
	};
	var lRSFeatureClassCategory = {
		Asset: 'Asset',
		Activity: 'Activity',
		Routelog: 'Routelog'
	};
	var lRSFeatureClassType = {
		PointInstant: 'PointInstant',
		PointPeriod: 'PointPeriod',
		LinearInstant: 'LinearInstant',
		LinearPeriod: 'LinearPeriod'
	};

	///////////////////

	window.LB = window.LB || {};

	/*-----------LBCore object------------*/
	window.LB.Core = function(proxyRoot, customerID, routeID, startMP, endMP) {
		lbsUrlRoot = proxyRoot;
		globalCustomerID = customerID;
		this.proxyRoot = proxyRoot;

		this.network = new Network();

		this.linearBenchInfo = new LinearBenchInfo(customerID);

		this.lRS = new Array();

		// this.init(customerID);
		$.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetLinearBenchInfo',
			context: this,
			data: {
				customerID: customerID
			}
		}).done(function(result) {
			console.log(result);

			var objCustomer = new Customer();
			objCustomer.id = result.customNo;
			objCustomer.name = result.customNo;
			//console.log(this);
			this.linearBenchInfo.customer = objCustomer;

			$.each(result.NetworkQCRules, function(index) {
				var objNetworkQCRule = new NetworkQCUDR();
				objNetworkQCRule.name = result.NetworkQCRules[index].Name;
				objNetworkQCRule.lrsID = result.NetworkQCRules[index].LRS_ID;
				objNetworkQCRule.ruleString = result.NetworkQCRules[index].convertFilterString;

				this.linearBenchInfo.networkQCUDRs.push(objNetworkQCRule);
			}.bind(this));

			$.each(result.DataQCRules, function(index) {
				var objFeatureClassQCRule = new FeatureClassQCUDR();
				objFeatureClassQCRule.name = result.DataQCRules[index].Name;
				objFeatureClassQCRule.featureClassID = result.DataQCRules[index].LayerID;
				objFeatureClassQCRule.ruleString = result.DataQCRules[index].convertFilterString;

				this.linearBenchInfo.featureClassQCUDRs.push(objFeatureClassQCRule);
			}.bind(this));

			$.each(result.RouteNetworkInfo, function(index) {
				var objNetwork = new Network();
				objNetwork.routeNetworkTable = result.RouteNetworkInfo[index].RouteNetworkTable;
				objNetwork.routeIDColumn = result.RouteNetworkInfo[index].RouteIDColumn;
				objNetwork.routeGeomColumn = result.RouteNetworkInfo[index].RouteGeomColumn;
				objNetwork.routeBeginDateColumn = result.RouteNetworkInfo[index].routeBeginDateColumn;
				objNetwork.routeEndDateColumn = result.RouteNetworkInfo[index].RouteEndDateColumn;
				objNetwork.centerlineNetworkTable = result.RouteNetworkInfo[index].CenterlineNetworkTable;
				objNetwork.centerlinegeomColumn = result.RouteNetworkInfo[index].CenterlineGeomColumn;
				objNetwork.centerlineRouteIDColumn = result.RouteNetworkInfo[index].CenterlineRouteIDColumn;
				objNetwork.centerlineBeginDateColumn = result.RouteNetworkInfo[index].CenterlineBeginDateColumn;
				objNetwork.centerlineEndDataColumn = result.RouteNetworkInfo[index].CenterlineEndDateColumn;

				this.network = objNetwork;
			}.bind(this));

		});

		$.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetLrsLrmDef',
			context: this,
			data: {
				customerID: customerID
			}
		}).done(function(lrslrmInfo) {
			$.each(lrslrmInfo, function(index) {
				var objLRS = new LRS();
				objLRS.lrsID = lrslrmInfo[index].lrsID;
				objLRS.name = lrslrmInfo[index].lrsName;
				objLRS.routeSvcURL = '';
				objLRS.measPrecision = 0;
				objLRS._3dGeom = false;
				objLRS.uom = lrslrmInfo[index].UOM;
				objLRS.lrm = new Array();
				//objLRS.network = lrslrmInfo[index].lrsID;

				$.each(lrslrmInfo[index].LRM, function(index) {
					var objLRM = new LRM();
					objLRM.name = lrslrmInfo[index].LRM.name;
					objLRM.isDefault = false; ///TODO: add isdefault value in LBS output

					objLRS.lrm.push(objLRM);
				});

				this.lRS.push(objLRS);
				console.log(objLRS);
			}.bind(this));

		});


	};



	


	/*------------------------------*/

	/*------------add event handler------------*/
	var EventObject = function() {};
	EventObject.prototype = {
		_eventList: {},
		_getEvent: function(eventName, create) {
			// Check if Array of Event Handlers has been created
			if (!this._eventList[eventName]) {

				// Check if the calling method wants to create the Array
				// if not created. This reduces unneeded memory usage.
				if (!create) {
					return null;
				}

				// Create the Array of Event Handlers
				this._eventList[eventName] = []; // new Array
			}

			// return the Array of Event Handlers already added
			return this._eventList[eventName];
		},
		attachEvent: function(eventName, handler) {
			// Get the Array of Event Handlers
			var evt = this._getEvent(eventName, true);

			// Add the new Event Handler to the Array
			evt.push(handler);
		},
		detachEvent: function(eventName, handler) {
			// Get the Array of Event Handlers
			var evt = this._getEvent(eventName);

			if (!evt) {
				return;
			}

			// Helper Method - an Array.indexOf equivalent
			var getArrayIndex = function(array, item) {
				for (var i = array.length; i < array.length; i++) {
					if (array[i] && array[i] === item) {
						return i;
					}
				}
				return -1;
			};

			// Get the Array index of the Event Handler
			var index = getArrayIndex(evt, handler);

			if (index > -1) {
				// Remove Event Handler from Array
				evt.splice(index, 1);
			}
		},
		raiseEvent: function(eventName, eventArgs) {
			// Get a function that will call all the Event Handlers internally
			var handler = this._getEventHandler(eventName);
			if (handler) {
				// call the handler function
				// Pass in 'sender' and 'eventArgs' parameters
				handler(this, eventArgs);
			}
		},
		_getEventHandler: function(eventName) {
			// Get Event Handler Array for this Event
			var evt = this._getEvent(eventName, false);
			if (!evt || evt.length === 0) {
				return null;
			}

			// Create the Handler method that will use currying to
			// call all the Events Handlers internally
			var h = function(sender, args) {
				for (var i = 0; i < evt.length; i++) {
					evt[i](sender, args);
				}
			};

			// Return this new Handler method
			return h;
		}
	};
	/*------------------------------*/


	/*-----------LinearBenchInfo class------------*/
	var LinearBenchInfo = function(customerID) {
		this.customer = new Customer();
		this.products = new Array();
		this.networkQCUDRs = new Array();
		this.featureClassQCUDRs = new Array();
		this.mapInfo = null;

		$.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetMapServiceInfo',
			context: this,
			data: {
				customerID: customerID
			}
		}).then(function(result) {
			//console.log(result);
			this.mapInfo = result;
			return this;
		});
	};
	/*------------------------------*/


	/*-----------customer object------------*/
	var Customer = function() {
		this.id = 0;
		this.name = '';
		this.language = 'en-us';
		this.log = '';
	};
	/*------------------------------*/

	/*-----------NetworkQCUDR object------------*/
	var NetworkQCUDR = function() {
		this.name = '';
		this.lrsID = 0;
		this.ruleString = '';
	};
	/*------------------------------*/

	/*-----------FeatureClassQCUDR object------------*/
	var FeatureClassQCUDR = function() {
		this.name = '';
		this.featureClassID = 0;
		this.ruleString = '';
	};
	/*------------------------------*/

	/*-----------Product object------------*/
	var Product = function() {
		this.name = '';
		this.feVersion = '';
		this.feBuild = '';
		this.dbVersion = '';
		this.numLicense = 0;
		this.isConfigured = '';
	};
	/*------------------------------*/

	/*-----------Network object------------*/
	var Network = function() {
		this.routeNetworkTable = '';
		this.routeIDColumn = '';
		this.routeGeomColumn = '';
		this.routeBeginDateColumn = '';
		this.routeEndDateColumn = '';
		this.centerlineNetworkTable = '';
		this.centerlinegeomColumn = '';
		this.centerlineRouteIDColumn = '';
		this.centerlineBeginDateColumn = '';
		this.centerlineEndDataColumn = '';
	};
	/*------------------------------*/



	/*-----------LRS class------------*/
	var LRS = function() {
		this.lrsID = 0;
		this.name = '';
		this.lrm = new Array(); //list of lRM()
		this.routeSvcURL = '';
		this.measPrecision = 0;
		this._3dGeom = 0;
		this.uom = '';
		this.network = new Customer();
		this.routeList = null;
		this.routeGeom = null;
	};
	LRS.prototype.setRouteList = function() {

	};
	LRS.prototype.getRouteList = function() {

	};
	LRS.prototype.getRouteCount = function() {

	};
	LRS.prototype.getRouteGeom = function(routeID) {

	};
	LRS.prototype.getDefaultLRM = function() {

	};
	/*------------------------------*/

	/*-----------LRM class------------*/
	var LRM = function() {
		this.name = '';
		this.isDefault = '';
	};
	LRM.prototype.setDefaultLRM = function() {

	};
	/*------------------------------*/

	/*-----------LRM class------------*/
	window.LB.RouteSegment = function(routeID, startMP, endMP) {
		this.routeID = routeID;
		this.startMP = startMP;
		this.endMP = endMP;
		this.fromTime = new Date();
		this.toTime = new Date();
		this.routeGeom = null;
		this.routeLog = null;
		this.routeLogData = null;

		var self = this;
		// $(document).unbind('onRouteSegChanged').bind('onRouteSegChanged', function(e, routeSeg) {
		// 	self.updateRouteLog(routeSeg.routeID, routeSeg.startMP, routeSeg.endMP).then(function(updatedRouteSegLog) {
		// 		// debugger;
		// 		updatedRouteSegLog.updateRouteGeom(routeSeg.routeID, routeSeg.startMP, routeSeg.endMP).then(function(updatedRouteSegGeom) {
		// 			// debugger;
		// 			// $(document).trigger('onRouteUpdateFinished', updatedRouteSegGeom);
		// 			// return updatedRouteSegGeom;
		// 		}).fail(function() {
		// 			// $(document).trigger('updateGeomFailed', updatedRouteSegLog);
		// 		});
		// 	}).fail(function() {
		// 		// $(document).trigger('updateRouteLogFailed', self);
		// 	});
		// });
	};

	LB.RouteSegment.prototype.setRouteSegGeom = function(routeID) {
		var defer = $.Deferred();
		if(routeID !== 'default' && this.routeGeom === null){
			$.ajax({
				method: 'POST',
				url: lbsUrlRoot + 'GetRouteGeometry',
				context: this,
				data: {
					customerID: globalCustomerID,
					routeID: routeID
				}
			}).then(function(result) {
				this.routeGeom = result;
				defer.resolve(this);
			}).fail(function(error) {
				this.routeGeom = null;
				defer.resolve(this);
			});
		}
		else {
			defer.resolve(this);
		}

		return defer.promise();
	};
	LB.RouteSegment.prototype.setRouteLog = function(routeID, startMP, endMP) {
		var defer = $.Deferred();
		$.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetRouteLogData',
			context: this,
			data: {
				customerID: globalCustomerID,
				routeID: routeID,
				startMP: startMP,
				endMP: endMP
			}
		}).then(function(rsp) {

			//parse data using jsonh
			var array = JSON.parse(rsp.data_str);
			//---using JSONH to unpack the array
			var dataArray = JSONH.unpack(array);
			this.routeLogData = dataArray;
			// debugger;
			$.ajax({
				method: 'POST',
				url: lbsUrlRoot + 'GetRouteLog',
				context: this,
				data: {
					customerID: globalCustomerID,
					username: 'lit',
					mainTabID: 'SLD',
					action: 'GetRouteLog',
					routeID: routeID,
					startMP: startMP,
					endMP: endMP
				}
			}).then(function(rsp) {
				this.routeLog = rsp;

				defer.resolve(this);
			});
		});
		return defer.promise();
	};
	LB.RouteSegment.prototype.updateRouteLog = function(routeID, startMP, endMP) {
		var defer = $.Deferred();
		if (globalCustomerID !== null && routeID !== null && startMP !== null && endMP !== null && (this.routeID !== routeID || this.startMP !== startMP || this.endMP !== endMP)) {
			$.ajax({
				method: 'POST',
				url: lbsUrlRoot + 'GetRouteLogData',
				context: this,
				data: {
					customerID: globalCustomerID,
					routeID: routeID,
					startMP: startMP,
					endMP: endMP
				}
			}).then(function(rsp) {

				this.routeID = routeID;
				this.startMP = startMP;
				this.endMP = endMP;
				console.log(this);
				// debugger;
				//parse data using jsonh
				var array = JSON.parse(rsp.data_str);
				//---using JSONH to unpack the array
				var dataArray = JSONH.unpack(array);
				this.routeLogData = dataArray;
				// debugger;
				$.ajax({
					method: 'POST',
					url: lbsUrlRoot + 'GetRouteLog',
					context: this,
					data: {
						customerID: globalCustomerID,
						username: 'lit',
						mainTabID: 'SLD',
						action: 'GetRouteLog',
						routeID: routeID,
						startMP: startMP,
						endMP: endMP
					}
				}).then(function(rsp) {
					this.routeLog = rsp;

					defer.resolve(this);
				}).fail(function() {

				});
			}).fail(function() {

			});
		}
		return defer.promise();
	};
	LB.RouteSegment.prototype.updateRouteGeom = function(routeID, startMP, endMP) {

		// var defer = $.Deferred();
		// if (this.routeID !== routeID) {

		//     $.ajax({
		//         method: 'POST',
		//         url: lbsUrlRoot + 'GetRouteGeometry',
		//         context: this,
		//         data: {
		//             customerID: globalCustomerID,
		//             routeID: routeID
		//         }
		//     }).then(function(result) {
		//         this.routeGeom = result;
		//         defer.resolve(this);
		//     }).fail(function(er){
		//         debugger;
		//     });
		// }
		// this.routeID = routeID;
		// this.startMP = startMP;
		// this.endMP = endMP;
		// defer.resolve(this);

		// return defer.promise();
		return $.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetRouteGeometry',
			context: this,
			data: {
				customerID: globalCustomerID,
				routeID: routeID
			}
		}).then(function(result) {
			this.routeID = routeID;
			this.startMP = startMP;
			this.endMP = endMP;
			this.routeGeom = result;
			return this;
		}).fail(function(er) {
			// debugger;
		});
	};
	LB.RouteSegment.prototype.updateRouteSeg = function(routeID, startMP, endMP) {
		// var promises = [];
		// var self = this;
		// _.each(this.lrsFeatureClasses, function(featureClass) {
		//     var def = new $.Deferred();
		//     featureClass.setFeatureClassData(routeSegment).then(function(updatedFeaturClass) {
		//         featureClass = updatedFeaturClass;
		//         def.resolve(self);
		//     });

		//     promises.push(def);
		// }.bind(this));

		// return $.when.apply(undefined, promises).promise();
		var promises = [];
		var self = this;
		var defer = $.Deferred();
		self.updateRouteLog(routeID, startMP, endMP)
			.then(function(updatedRouteSeg) {
				defer.resolve(self);
				self.updateRouteGeom(routeID, startMP, endMP).then(function(updatedRouteSegWithGeom) {
					// debugger;
					defer.resolve(self);
				});

			});
		// this.routeID = routeID;
		// this.startMP = startMP;
		// this.endMP = endMP;
		// return $.when.apply(undefined, promises).promise();

		return defer.promise();
	};
	LB.RouteSegment.prototype.updateRouteSeg = function(routeID, startMP, endMP) {
		// var promises = [];
		// var self = this;
		// _.each(this.lrsFeatureClasses, function(featureClass) {
		//     var def = new $.Deferred();
		//     featureClass.setFeatureClassData(routeSegment).then(function(updatedFeaturClass) {
		//         featureClass = updatedFeaturClass;
		//         def.resolve(self);
		//     });

		//     promises.push(def);
		// }.bind(this));

		// return $.when.apply(undefined, promises).promise();
		var promises = [];
		var self = this;
		var defer = $.Deferred();
		self.updateRouteLog(routeID, startMP, endMP)
			.then(function(updatedRouteSeg) {
				defer.resolve(self);
				self.updateRouteGeom(routeID, startMP, endMP).then(function(updatedRouteSegWithGeom) {
					// debugger;
					defer.resolve(self);
				});

			});
		// this.routeID = routeID;
		// this.startMP = startMP;
		// this.endMP = endMP;
		// return $.when.apply(undefined, promises).promise();

		return defer.promise();
	};
	/*------------------------------*/

	/*-----------LrsFeature class------------*/
	var LrsFeature = function() {
		this.id = 0;
		this.featureData = {};
	};
	LrsFeature.prototype.update = function() {

	};
	LrsFeature.prototype.insert = function() {

	};
	LrsFeature.prototype.delete = function() {

	};
	LrsFeature.prototype.setMeas = function() {

	};
	LrsFeature.prototype.setTime = function() {

	};
	/*------------------------------*/

	/*-----------Symbology class------------*/
	var Symbology = function() {
		this.name = '';
		this.symbolCol = '';
		this.symbolType = '';
		this.symbolReso = 0;
		this.symbologyData = {};
		this.isCurrent = false;
	};
	Symbology.prototype.setFeatureClassMetaData = function() {

	};
	Symbology.prototype.setFeatureClassData = function() {

	};
	Symbology.prototype.setSymbologyData = function() {

	};
	Symbology.prototype.getSymbologyData = function() {

	};
	Symbology.prototype.getSymbolType = function() {

	};
	Symbology.prototype.getSymbolReso = function() {

	};
	/*------------------------------*/

	/*-----------LrsFeatureClass class------------*/
	var LrsFeatureClass = function(layerName) {
		this.id = 0;
		this.index = 0;
		this.name = '';
		if (layerName) this.name = layerName;
		this.isCurrent = false;
		this.tableName = '';
		this.idCol = '';
		this.routeIDCol = '';
		this.featureIDCol = '';
		this.fromMeasCol = '';
		this.toMeasCol = '';
		this.beginDateCol = '';
		this.endDateCol = '';
		this.hasData = false;
		this.hasDataError = false;
		this.currentPageNum = 1;
		this.dataRecordCount = 0;
		this.filterColumn = '';
		this.filterOperator = '';
		this.filterValue = '';
		this.symbologys = new Array();
		this.currentSymbologyColumn = '';
		this.sldGraphType = '';
		this.readOnly = true;
		this.featureClassType = '';
		this.featureClassCategory = '';
		this.featuresClassData = {};
		this.filter = new Array();

	};
	LrsFeatureClass.prototype.setFeatureClassMetaData = function(routeSegment) {
		var defer = $.Deferred();
		var self = this;
		$.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetFeatureClassMetaData',
			context: this,
			data: {
				customerID: globalCustomerID,
				eventName: this.name
			}
		}).then(function(result) {
			// this.hasData = true;
			console.log(result);
			this.idCol = result.FeatureID;
			this.tableName = result.TableName;
			this.routeIDCol = result.RouteIDColumnName;
			this.featureIDCol = result.RouteIDColumnName;
			this.fromMeasCol = result.StartMPColumnName;
			this.toMeasCol = result.EndMPColumnName;
			this.beginDateCol = result.BeginDateColumnName;
			this.endDateCol = result.EndDateColumnName;

			// $.ajax({
			// 	method: 'POST',
			// 	url: lbsUrlRoot + 'GetEventCount',
			// 	context: this,
			// 	data: {
			// 		customerID: globalCustomerID,
			// 		routeID: routeSegment.routeID,
			// 		startMP: parseFloat(routeSegment.startMP),
			// 		endMP: parseFloat(routeSegment.endMP),
			// 		eventName: this.name
			// 	}
			// }).then(function(eventData) {
			// 	console.log(eventData);
			// 	this.dataRecordCount = eventData;
			// 	this.setSymbologyData(routeSegment).then(function() {
			// 		defer.resolve(self);
			// 	});

			// 	return this;
			// });

			this.setSymbologyData(routeSegment).then(function() {
				defer.resolve(self);
			});

			return this;
		});
		return defer.promise();
	};

	LrsFeatureClass.prototype.getRecordCount = function(routeSegment) {
		return $.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetEventCount',
			context: this,
			data: {
				customerID: globalCustomerID,
				routeID: routeSegment.routeID,
				startMP: parseFloat(routeSegment.startMP),
				endMP: parseFloat(routeSegment.endMP),
				eventName: this.name
			}
		}).then(function(eventData) {
			console.log(eventData);
			this.dataRecordCount = eventData;
			//this.isCurrent = true;
			return this;
		});
	};

	LrsFeatureClass.prototype.setFeatureClassData = function(routeInfo, pageNum, filterColumn, filterOperator, filterValue) {

		var serviceName = '';
		if (!pageNum) {pageNum = 1;}
		if (!filterColumn) {filterColumn = '';}
		if (!filterOperator) {filterOperator = '';}
		if (!filterValue) {filterValue = '';}

		var row_count = -1; // set to -1 to get all row count
		var page_no = this.currentPageNum;
		var page_size = dataRecordThreshold;
		var report_order = 1;
		var filterExpression = '';
		if (filterOperator === '=' || filterOperator === '>=' ||
			filterOperator === '<=' || filterOperator === '>' || filterOperator === '<') {
			filterExpression = filterColumn + filterOperator + filterValue;
		} else if (filterOperator === 'IN') {
			filterValue = filterValue.replace(/ /g, ''); // remove white space
			var filterPart = filterValue.split(',');
			var startValue = filterPart[0].substring(1);
			var endValue = filterPart[1].slice(0, -1);
			filterExpression = '(' + filterColumn + '>=' + startValue + ' AND ' + filterColumn + '<=' + endValue + ')';
		} else if (filterOperator === 'STARTS WITH') {
			filterExpression = '(' + filterColumn + ' LIKE \'' + filterValue + '%\')';
		} else if (filterOperator === 'CONTAINS') {
			filterExpression = '(' + filterColumn + ' LIKE \'%' + filterValue + '%\')';
		} else {

		}
		var report_layer =    '<ROWSET>' 
							+ '  <ROW>' 
							+ '    <NAME>' + this.tableName + '</NAME>' 
							+ '    <ID_COL>' + this.idCol + '</ID_COL>' 
							+ '    <ROUTE_COL>' + this.routeIDCol + '</ROUTE_COL>' 
							+ '    <F_MEAS_COL>' + this.fromMeasCol + '</F_MEAS_COL>' 
							+ '    <T_MEAS_COL>' + this.toMeasCol + '</T_MEAS_COL>' 
							+ '    <B_DATE_COL>' + this.beginDateCol + '</B_DATE_COL>' 
							+ '    <E_DATE_COL>' + this.endDateCol + '</E_DATE_COL>' 
							+ '    <ATTR_COLS></ATTR_COLS>' 
							+ '  </ROW>' 
							+ '  </ROWSET>';
		var report_ft =   '<ST_FILTER>' 
						+ '    <ROUTE>' + routeInfo.routeID + '</ROUTE>' 
						+ '    <ROUTE_NAME></ROUTE_NAME>' 
						+ '    <F_MEAS>' + routeInfo.startMP + '</F_MEAS>' 
						+ '    <T_MEAS>' + routeInfo.endMP + '</T_MEAS>' 
						+ '    <B_DATE></B_DATE>' 
						+ '    <E_DATE></E_DATE>' 
						+ '   <OTHER><![CDATA[' + filterExpression + ']]></OTHER>' 
						+ '</ST_FILTER>';

		// console.log(report_layer);
		// console.log(report_ft);
		// debugger;
		return $.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetLBVEventData',
			context: this,
			data: {
				customerID: globalCustomerID,
				layerName: this.name,
				row_count: row_count,
				report_layer: report_layer,
				report_ft: report_ft,
				page_no: page_no,
				page_size: page_size,
				report_order: report_order
			}
		}).then(function(eventData) {
			console.log(eventData);
			if (eventData && eventData.data_str !== '') {
				this.hasData = true;
				this.dataRecordCount = eventData.row_count;
				var dataObject = JSON.parse(eventData.data_str);
				var dataArray = [];
				for (var i = 0; i < dataObject.features.length; i++) {
					dataArray.push(dataObject.features[i].properties);
				}
				eventData.data_str = JSON.stringify(JSONH.pack(dataArray));
				this.featuresClassData = eventData;
			}

			return this;
		}).fail(function(error) {
			this.hasDataError = true;
			return this;
		});


	};
	LrsFeatureClass.prototype.commit = function(wrapData) {
		var returnObject = {
			isSucceed: false,
			errorCode: -1
		}
		var filterExpression = '';
		filterExpression = wrapData.idCol + '=' + wrapData.id;
		var setClauseExpression = '';
		if(wrapData.startMPCol === wrapData.endMPCol){
			setClauseExpression = wrapData.startMPCol + '=' + wrapData.startMP
		}
		else{
			setClauseExpression = wrapData.startMPCol + '=' + wrapData.startMP + ','
		 						+ wrapData.endMPCol + '=' + wrapData.endMP;
		}
		
		
		var report_layer =    '<ROWSET>' 
							+ '  <ROW>' 
							+ '    <NAME>' + this.tableName + '</NAME>' 
							+ '    <ID_COL>' + this.idCol + '</ID_COL>' 
							+ '    <ROUTE_COL>' + this.routeIDCol + '</ROUTE_COL>' 
							+ '    <F_MEAS_COL>' + this.fromMeasCol + '</F_MEAS_COL>' 
							+ '    <T_MEAS_COL>' + this.toMeasCol + '</T_MEAS_COL>' 
							+ '    <B_DATE_COL>' + this.beginDateCol + '</B_DATE_COL>' 
							+ '    <E_DATE_COL>' + this.endDateCol + '</E_DATE_COL>' 
							+ '    <SET_CLAUSE><![CDATA['+ setClauseExpression + ']]></SET_CLAUSE>' 
							+ '    <ATTR_COLS></ATTR_COLS>' 
							+ '  </ROW>' 
							+ '  </ROWSET>';
		var report_ft =   '<ST_FILTER>' 
						+ '    <ROUTE></ROUTE>' 
						+ '    <ROUTE_NAME></ROUTE_NAME>' 
						+ '    <F_MEAS></F_MEAS>' 
						+ '    <T_MEAS></T_MEAS>' 
						+ '    <B_DATE></B_DATE>' 
						+ '    <E_DATE></E_DATE>' 
						+ '   <OTHER><![CDATA[' + filterExpression + ']]></OTHER>' 
						+ '</ST_FILTER>';

		console.log(report_layer);
		console.log(report_ft);
		// debugger;
		return $.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'CommitLBVDataChange',
			context: this,
			data: {
				customerID: globalCustomerID,
				report_layer: report_layer,
				report_ft: report_ft
			}
		}).then(function(eventData) {
			console.log(eventData);
			if (eventData && eventData.message !== '') {
				var dataObject = JSON.parse(eventData.message);
				
				if(dataObject.errorcode === 0) {
					returnObject.isSucceed = true;
				}
				else{
					returnObject.errorCode = dataObject.errorcode;
				}
			}

			return returnObject;
		}).fail(function(error) {
			return returnObject;
		});


	};
	LrsFeatureClass.prototype.getFeatureClassData = function() {
		return this.featuresClassData;
	};
	LrsFeatureClass.prototype.setCurrent = function() {

	};
	LrsFeatureClass.prototype.setSymbologyData = function(routeSegment) {
		var defer = $.Deferred();
		var self = this;
		$.ajax({
			method: 'POST',
			url: lbsUrlRoot + 'GetSymbology',
			context: this,
			data: {
				customerID: globalCustomerID,
				eventName: this.name
			}
		}).then(function(symbolData) {
			this.symbologys = [];
			$.each(symbolData, function(index) {
				if (index === 0) {
					this.currentSymbologyColumn = symbolData[index].SymbolColumn;
				}
				var objSymbology = new Symbology();
				objSymbology.name = symbolData[index].SymbolColumn;
				objSymbology.symbolCol = symbolData[index].SymbolColumn;
				objSymbology.symbolType = symbolData[index].Type;
				objSymbology.symbolReso = 1;
				objSymbology.symbologyData = symbolData[index].Symbols;
				objSymbology.isCurrent = false;

				this.symbologys.push(objSymbology);
			}.bind(this));

			// if(this.dataRecordCount <= dataRecordThreshold){
			// 	this.setFeatureClassData(routeSegment).then(function() {
			// 		defer.resolve(self);
			// 	});
			// 	return this;
			// }
			// else{
			// 	console.log('Too many records in ' + this.name + ' layer!');
			// }
			this.setFeatureClassData(routeSegment).then(function() {
				defer.resolve(self);
			});
			return this;
			// defer.resolve(self);
		});

		return defer.promise();
	};
	LrsFeatureClass.prototype.getSymbologyData = function(SbIndex) {
		return this.symbologys[SbIndex];
	};
	/*------------------------------*/

	/*-----------LRSFeatureClasses class------------*/
	window.LB.LRSFeatureClasses = function() {
		this.lrsFeatureClasses = new Array();

		var self = this;
		$(document).unbind('updateFeatureClasses').bind('updateFeatureClasses', function(e, routeSeg) {
			self.update({
				routeID: routeSeg.routeID,
				startMP: routeSeg.startMP,
				endMP: routeSeg.endMP
			}).then(function(updatedFeatureClasses) {
				// $(document).trigger('updateFeatureClassesFinished', {routeSeg: routeSeg,featureClasses:updatedFeatureClasses});
			}).fail(function() {
				// $(document).trigger('updateFeatureClassesFailed', self);
			});
		});
	};
	// LB.lRSFeatureClasses.prototype.checkFeatureExist = function(name) {
	//     var isThisFeatureExist = false;
	//     $.each(this.lrsFeatureClasses, function(idx) {
	//         if (this.lrsFeatureClasses[idx].name === name) {
	//             isThisFeatureExist = true;
	//             return false;
	//         }
	//     }.bind(this));
	//     return isThisFeatureExist;
	// }

	// LB.lRSFeatureClasses.prototype.update = function(name) {
	//     var isThisFeatureExist = false;
	//     $.each(this.lrsFeatureClasses, function(idx) {
	//         if (this.lrsFeatureClasses[idx].name === name) {
	//             isThisFeatureExist = true;
	//             return false;
	//         }
	//     }.bind(this));

	//     if (!isThisFeatureExist) {

	//     }
	// };
	// LB.lRSFeatureClasses.prototype.updateFeatureClasses = function(symboSeq, routeSegment) {
	//     var defer = $.Deferred();
	//     var featureName = symboSeq.featureClassName;
	//     var featureInfo = checkFeatureInfo(featureName, this);
	//     console.log(featureInfo);
	//     if (featureInfo.isExist) {
	//         var feature = featureInfo.feature;
	//         symboSeq.symbologys = feature.symbologys;
	//         defer.resolve(this);
	//     } else {
	//         var feature = new lrsFeatureClass(featureName);
	//         var _this = this;
	//         return feature.setFeatureClassMetaData().then(function(featureClassWithMetaData) {
	//             featureClassWithMetaData.setFeatureClassData({
	//                 routeID: routeSegment.routeID,
	//                 startMP: routeSegment.startMP,
	//                 endMP: routeSegment.endMP
	//             }).then(function(featureClassWithData) {
	//                 featureClassWithData.setSymbologyData().then(function(featureClassWithDataAndSymbology) {
	//                     console.log(_this);
	//                     _this.lrsFeatureClasses.push(featureClassWithDataAndSymbology);
	//                     defer.resolve(_this);
	//                 });
	//             });
	//         }.bind(this));
	//         //this.add(featureName);
	//         return defer.promise();
	//     }

	//     function checkFeatureInfo(name, featureClasses) {
	//         var info = {
	//             isExist: false,
	//             feature: null
	//         };
	//         _.each(featureClasses.lrsFeatureClasses, function(item) {
	//             if (item.name === name) {
	//                 info.isExist = true;
	//                 info.feature = item;
	//                 return false;
	//             }
	//         });
	//         return info;
	//     }

	// };
	// LB.LRSFeatureClasses.prototype.setCurrent = function(name, symbolCol) {
	// 	$.each(this.lrsFeatureClasses, function(index) {
	// 		if (this.lrsFeatureClasses[index].name === name) {
	// 			this.lrsFeatureClasses[index].isCurrent = true;
	// 			if (symbolCol === '') {
	// 				// debugger;
	// 				this.lrsFeatureClasses[index].symbologys[0].isCurrent = true;
	// 			} else {
	// 				$.each(this.lrsFeatureClasses[index].symbologys, function(index1) {
	// 					if (this.lrsFeatureClasses[index].symbologys[index1].name === symbolCol) {
	// 						this.lrsFeatureClasses[index].symbologys[index1].isCurrent = true;
	// 					} else {
	// 						this.lrsFeatureClasses[index].symbologys[index1].isCurrent = false;
	// 					}
	// 				}.bind(this));
	// 			}

	// 		} else {
	// 			this.lrsFeatureClasses[index].isCurrent = false;
	// 		}
	// 	}.bind(this));
	// };
	LB.LRSFeatureClasses.prototype.getCurrent = function() {
		var currentLayerSymbol = {
			layerName: '',
			symbolCol: ''
		};
		$.each(this.lrsFeatureClasses, function(index) {
			if (this.lrsFeatureClasses[index].isCurrent) {
				currentLayerSymbol.layerName = this.lrsFeatureClasses[index].name;
				$.each(this.lrsFeatureClasses[index].symbologys, function(index1) {
					if (this.lrsFeatureClasses[index].symbologys[index1].isCurrent) {
						currentLayerSymbol.symbolCol = this.lrsFeatureClasses[index].symbologys[index1].symbolCol;
					}
				}.bind(this));
			}
		}.bind(this));
		return currentLayerSymbol;
	};
	LB.LRSFeatureClasses.prototype.add = function(featureName) {
		var isFeatureExist = false;
		$.each(this.lrsFeatureClasses, function(index) {
			if (this.lrsFeatureClasses[index].name === featureName) {
				isFeatureExist = true;
				return false;
			}
		}.bind(this));
		if (!isFeatureExist) {
			var feature = new LrsFeatureClass(featureName);
			this.lrsFeatureClasses.push(feature); //add layer after the layer where + is clicked
		}
		//reorder the index for all feature in featureclasses
		$.each(this.lrsFeatureClasses, function(index) {
			this.lrsFeatureClasses[index].index = index;
		}.bind(this));

		return this;
	};
	LB.LRSFeatureClasses.prototype.remove = function(idx) {
		this.lrsFeatureClasses.splice(idx, 1);
		if (this.lrsFeatureClasses.length === 0) {
			this.lrsFeatureClasses.push(new lrsFeatureClass());
		}
		//reorder the index for all feature in featureclasses
		$.each(this.lrsFeatureClasses, function(index) {
			this.lrsFeatureClasses[index].index = index;
		}.bind(this));
	};
	LB.LRSFeatureClasses.prototype.move = function() {

	};
	LB.LRSFeatureClasses.prototype.update = function(routeSegment) {
		var promises = [];
		var self = this;
		_.each(this.lrsFeatureClasses, function(featureClass) {
			var def = new $.Deferred();
			// if(featureClass.dataRecordCount <= dataRecordThreshold) {
			// 	featureClass.setFeatureClassData(routeSegment).then(function(updatedFeaturClass) {
			// 		featureClass = updatedFeaturClass;
			// 		def.resolve(self);
			// 	});
			// 	return this;
			// }
			// else{
			// 	console.log('Too many records in ' + featureClass.name + ' layer!');
			// }
			featureClass.setFeatureClassData(routeSegment).then(function(updatedFeaturClass) {
				featureClass = updatedFeaturClass;
				def.resolve(self);
			});

			promises.push(def);
		}.bind(this));

		return $.when.apply(undefined, promises).promise();
	};
	// LB.LRSFeatureClasses.prototype.getCurrentFeatureIDCol = function() {
	// 	var feaIDCol = '';
	// 	_.each(this.lrsFeatureClasses, function(featureClass) {
	// 		debugger;
	// 		if (featureClass.isCurrent) {
	// 			feaIDCol = featureClass.idCol;
	// 		}
	// 	});
	// 	return feaIDCol;
	// };
	// LB.LRSFeatureClasses.prototype.getCurrentFeatureData = function() {
	// 	// debugger;
	// 	console.log(this.lrsFeatureClasses);
	// 	var lrsFC = this.lrsFeatureClasses;
	// 	var symSqsArr = this.lrsFeatureClasses;
	// 	// console.log(symSqsArr);
	// 	for (var i = 0; i < symSqsArr.length; i++) {
	// 		if (symSqsArr[i].isCurrent === true) { //should be true after Terry fix from driver
	// 			var symbo = JSON.parse(symSqsArr[i].featuresClassData.data_str);
	// 			var featureData = JSONH.unpack(symbo);
	// 			return featureData;
	// 		};
	// 	};
	// 	return false;
	// };
	LB.LRSFeatureClasses.prototype.getCurrentFeatureData = function() {
		// debugger;
		console.log(this.lrsFeatureClasses);
		var lrsFC = this.lrsFeatureClasses;
		var symSqsArr = this.lrsFeatureClasses;
		// console.log(symSqsArr);
		for (var i = 0; i < symSqsArr.length; i++) {
			if (symSqsArr[i].isCurrent === true) { //should be true after Terry fix from driver
				var symbo = JSON.parse(symSqsArr[i].featuresClassData.data_str);
				var featureData = JSONH.unpack(symbo);
				return featureData;
			}
		}
		return false;
	};
	LB.LRSFeatureClasses.prototype.getFeatureClassIndex = function(featureClassName) {
		var featureIndex = 0;
		_.each(this.lrsFeatureClasses, function(featureClass) {
			if (featureClass.name === featureClassName) {
				featureIndex = featureClass.index;
				return featureIndex;
			}

		}.bind(this));
		return featureIndex;
	};

	LB.LRSFeatureClasses.prototype.setFilter = function(featureClassName, symbolCol, value) {
		var self = this;
		$.each(self.lrsFeatureClasses, function(index) {
			if (self.lrsFeatureClasses[index].name === featureClassName) {
				var isFitlerExist = false;
				$.each(self.lrsFeatureClasses[index].filter, function(index1) {
					if (self.lrsFeatureClasses[index].filter[index1].filterColumn === symbolCol) {
						isFitlerExist = true;
						var existingFilterValues = self.lrsFeatureClasses[index].filter[index1].filterValue;
						var valueIndex = existingFilterValues.indexOf(value);
						//if the value doesn't exist, add it
						if (valueIndex < 0) {
							self.lrsFeatureClasses[index].filter[index1].filterValue.push(value);
						} else { //if the filter value already exist, remove it
							self.lrsFeatureClasses[index].filter[index1].filterValue.splice(valueIndex, 1);
						}
					}
				});

				if (!isFitlerExist) {
					var filterValue = new Array();
					filterValue.push(value);
					var filterItem = {
						filterColumn: symbolCol,
						filterValue: filterValue
					};
					self.lrsFeatureClasses[index].filter.push(filterItem);
				}
			}
		});
	};
	// set data for one layer
	LB.LRSFeatureClasses.prototype.setPageData = function(routeSegment, featureClassName, pageNum,
		filterColumn, filterOperator, filterValue) {

		var self = this;
		var promises = [];
		$.each(self.lrsFeatureClasses, function(index) {
			if (self.lrsFeatureClasses[index].name === featureClassName) {
				self.lrsFeatureClasses[index].currentPageNum = pageNum;
				self.lrsFeatureClasses[index].filterColumn = filterColumn;
				self.lrsFeatureClasses[index].filterOperator = filterOperator;
				self.lrsFeatureClasses[index].filterValue = filterValue;
				var def = new $.Deferred();
				self.lrsFeatureClasses[index].setFeatureClassData(routeSegment, pageNum,
					filterColumn, filterOperator, filterValue).then(function(updatedFeaturClass) {

					self.lrsFeatureClasses[index] = updatedFeaturClass;
					def.resolve(self);
				});
				promises.push(def);
			}
		});
		return $.when.apply(undefined, promises).promise();
	};
	// set data for all layer
	LB.LRSFeatureClasses.prototype.reloadData = function(routeInfo, pageNum,
		filterColumn, filterOperator, filterValue) {

		var self = this;
		var promises = [];
		$.each(self.lrsFeatureClasses, function(index) {
			self.lrsFeatureClasses[index].currentPageNum = pageNum;
			self.lrsFeatureClasses[index].filterColumn = filterColumn;
			self.lrsFeatureClasses[index].filterOperator = filterOperator;
			self.lrsFeatureClasses[index].filterValue = filterValue;
			var def = new $.Deferred();
			self.lrsFeatureClasses[index].setFeatureClassData(routeInfo, pageNum,
				filterColumn, filterOperator, filterValue).then(function(updatedFeaturClass) {

				self.lrsFeatureClasses[index] = updatedFeaturClass;
				def.resolve(self);
			});
			promises.push(def);
		});
		return $.when.apply(undefined, promises).promise();
	};
	// commit data change to database
	LB.LRSFeatureClasses.prototype.commitDataChange = function(layerName, wrapData) {

		var self = this;
		var promises = [];
		$.each(self.lrsFeatureClasses, function(index) {
			if(self.lrsFeatureClasses[index].name === layerName) {
				var def = new $.Deferred();
				self.lrsFeatureClasses[index].commit(wrapData).then(function(result){
					def.resolve(result);
				}).fail(function(){
					def.resolve(result);
				});
				promises.push(def);
			}
			
		});
		return $.when.apply(undefined, promises).promise();
	};
	/*------------------------------*/


	//var featureClasses = new lRSFeatureClasses();
	/*-----------LrsFeatureClassSymbologySqs class------------*/
	window.LB.LrsFeatureClassSymbologySqs = function() {
		this.lrsFCSymSqs = new Array();
		this.selectedFeature = null;
		//this.featureClasses = new lRSFeatureClasses();
	};
	LB.LrsFeatureClassSymbologySqs.prototype.setCurrent = function(name, symbolCol, module) {
		if (name === '') {
			this.lrsFCSymSqs[0].isCurrent = true;
			return false;
		}
		console.log(this.lrsFCSymSqs);
		$.each(this.lrsFCSymSqs, function(index) {
			if (this.lrsFCSymSqs[index].featureClassName === name && this.lrsFCSymSqs[index].modules[module]) {
				this.lrsFCSymSqs[index].isCurrent = true;
				if (symbolCol !== '') {
					this.lrsFCSymSqs[index].symbologyName = symbolCol;
				}

			} else {
				this.lrsFCSymSqs[index].isCurrent = false;
				// if (module !== 'SLD' && module !== 'TSD') {
				// 	this.lrsFCSymSqs[index].modules[module] = false;
				// }

			}

			if (symbolCol === '' && this.lrsFCSymSqs[index].modules[module]) {
				this.lrsFCSymSqs[index].symbologys[0].isCurrent = true;
			} else {
				$.each(this.lrsFCSymSqs[index].symbologys, function(index1) {
					if (this.lrsFCSymSqs[index].symbologys[index1].symbolCol === symbolCol) {
						this.lrsFCSymSqs[index].symbologys[index1].isCurrent = true;
					} else {
						this.lrsFCSymSqs[index].symbologys[index1].isCurrent = false;
					}
				}.bind(this));
			}
		}.bind(this));
	};
	LB.LrsFeatureClassSymbologySqs.prototype.getCurrent = function(module) {
		// debugger;
		console.log(this.lrsFCSymSqs);
		var symSqsArr = this.lrsFCSymSqs;
		// console.log(symSqsArr);
		for (var i = 0; i < symSqsArr.length; i++) {
			if (symSqsArr[i].isCurrent && symSqsArr[i].modules[module]) {
				var symbo = symSqsArr[i].symbologys;
				for (var j = 0; j < symbo.length; j++) {
					if (symbo[j].isCurrent === true) {
						symbo[j]['featureClassName'] = symSqsArr[i].featureClassName;
						return symbo[j];
					}
				}
			}
		}
		return false;
	};
	LB.LrsFeatureClassSymbologySqs.prototype.getCurrentLayerMetaData = function(feaClasses) {
		// console.log(this.lrsFCSymSqs);
		var symSqsArr = this.lrsFCSymSqs;
		var currentLayerName = '';
		// console.log(symSqsArr);
		for (var i = 0; i < symSqsArr.length; i++) {
			if (symSqsArr[i].isCurrent === true) {
				currentLayerName = symSqsArr[i].featureClassName;
				break;
			}
		}
		var feaIDCol = '';
		for (var j = 0; j < feaClasses.lrsFeatureClasses.length; j++) {
			if (feaClasses.lrsFeatureClasses[j].name === currentLayerName) {
				feaIDCol = feaClasses.lrsFeatureClasses[j].idCol;
				var metaData = Object.assign({}, feaClasses.lrsFeatureClasses[j]);
				delete metaData.featuresClassData;
				delete metaData.filter;
				delete metaData.symbologys;
				return metaData;
			}
		}

		// _.each(feaClasses.lrsFeatureClasses, function(featureClass) {
		// 	if (featureClass.name === currentLayerName) {
		// 		feaIDCol = featureClass.idCol;
		// 	}
		// });
		return false;
	};
	LB.LrsFeatureClassSymbologySqs.prototype.getSymbologySqs = function() {
		var symSqsArr = this.lrsFCSymSqs;
		// console.log(symSqsArr);
		for (var i = 0; i < symSqsArr.length; i++) {
			if (symSqsArr[i].isCurrent === true) {
				return symSqsArr[i].symbologys;
			}
		}
		return false;
	};
	LB.LrsFeatureClassSymbologySqs.prototype.setSelectedFeature = function(feature) {
		this.selectedFeature = feature;
	};
	LB.LrsFeatureClassSymbologySqs.prototype.setIndex = function(featureClasses) {
		$.each(this.lrsFCSymSqs, function(index) {
			this.lrsFCSymSqs[index].seqIdx = index;
			// this.lrsFCSymSqs[index].featureClassIdx = featureClasses.getFeatureClassIndex(this.lrsFCSymSqs[index].featureClassName);

		}.bind(this));
	};
	LB.LrsFeatureClassSymbologySqs.prototype.setModules = function(featureClassName, module) {
		$.each(this.lrsFCSymSqs, function(index) {
			if (this.lrsFCSymSqs[index].featureClassName === featureClassName) {
				this.lrsFCSymSqs[index].modules[module] = true;
			} else {
				this.lrsFCSymSqs[index].modules[module] = false;
			}
		}.bind(this));
	};
	LB.LrsFeatureClassSymbologySqs.prototype.getModules = function(module) {
		$.each(this.lrsFCSymSqs, function(index) {
			if (this.lrsFCSymSqs[index].modules[module]) {
				return this.lrsFCSymSqs[index];
			} else {
				return null;
			}
		}.bind(this));
	};
	LB.LrsFeatureClassSymbologySqs.prototype.add = function(idx, layerName, symbolColName, routeSeg, module) {
		//console.log(featureClasses);
		var _this = this;

		_this.lrsFCSymSqs.splice(idx + 1, 0, new LrsFeatureClassSymbologySq(layerName, symbolColName, module)); //add layer after the layer where + is clicked

		_this.setIndex();
		return _this;
		// if (!_this.featureClasses.checkFeatureExist(layerName)) {
		//     var newFeatureClass = new lrsFeatureClass(layerName);
		//     //newFeatureClass.setFeatureClassMetaData();


		//     // newFeatureClass.setFeatureClassMetaData().then(function(featureClassWithMetaData) {
		//     //     featureClassWithMetaData.setFeatureClassData({
		//     //         routeID: routeSeg.routeID,
		//     //         startMP: routeSeg.startMP,
		//     //         endMP: routeSeg.endMP
		//     //     }).then(function(featureClassWithData) {
		//     //         featureClassWithData.setSymbologyData().then(function(featureClassWithDataAndSymbology) {
		//     //             //debugger;
		//     //             //NOTE: no digest happens here because this is a raw $.ajax $promise...
		//     //             //set this feature class as current
		//     //             //debugger;
		//     //             //console.log(_this);
		//     //             featureClasses.setCurrent(featureClassWithDataAndSymbology.name);
		//     //             //_this.symbologys = featureClassWithDataAndSymbology.symbologys;
		//     //             //deferred.resolve(featureClasses);

		//     //             featureClasses.add(0, featureClassWithDataAndSymbology);
		//     //             //return newFeatureClass;
		//     //         });
		//     //     });
		//     // });

		//     newFeatureClass.setFeatureClassMetaData().then(function(featureClassWithMetaData) {
		//         featureClassWithMetaData.setFeatureClassData({
		//             routeID: routeSeg.routeID,
		//             startMP: routeSeg.startMP,
		//             endMP: routeSeg.endMP
		//         }).then(function(featureClassWithData) {
		//             featureClassWithData.setSymbologyData().then(function(featureClassWithDataAndSymbology) {
		//                 //debugger;
		//                 //NOTE: no digest happens here because this is a raw $.ajax $promise...
		//                 //set this feature class as current
		//                 //debugger;
		//                 //console.log(_this);
		//                 _this.featureClasses.setCurrent(featureClassWithDataAndSymbology.name);
		//                 //_this.symbologys = featureClassWithDataAndSymbology.symbologys;
		//                 //deferred.resolve(featureClasses);

		//                 //featureClasses.add(featureClassWithDataAndSymbology);
		//                 //console.log(featureClassWithDataAndSymbology);
		//                 _this.featureClasses.add(featureClassWithDataAndSymbology);
		//                 //return featureClassWithDataAndSymbology;
		//                 _.each(_this.lrsFCSymSqs, function(item) {
		//                     if (item.featureClassName === featureClassWithDataAndSymbology.name) {
		//                         item.symbologys = featureClassWithDataAndSymbology.symbologys;
		//                     }
		//                 });
		//             });
		//         });
		//     });
		//     //console.log(furClass);


		// }
	};
	LB.LrsFeatureClassSymbologySqs.prototype.remove = function(idx) {
		// debugger;
		this.lrsFCSymSqs.splice(idx, 1);
		if (this.lrsFCSymSqs.length === 0) {
			this.lrsFCSymSqs.push(new lrsFeatureClassSymbologySq());
		}
		//reorder the index for all feature in featureclasses
		$.each(this.lrsFCSymSqs, function(index) {
			this.lrsFCSymSqs[index].seqIdx = index;
		}.bind(this));
	};
	LB.LrsFeatureClassSymbologySqs.prototype.updateSeq = function() {

	};
	LB.LrsFeatureClassSymbologySqs.prototype.updateSymbology = function(allFeatureClasses) {
		console.log(allFeatureClasses);
		var defer = $.Deferred();
		var self = this;
		$.each(this.lrsFCSymSqs, function(index) {
			var featureName = this.lrsFCSymSqs[index].featureClassName;
			var currentFeature = this.lrsFCSymSqs[index];

			//update featureClass index
			self.lrsFCSymSqs[index].featureClassIdx = allFeatureClasses.getFeatureClassIndex(featureName);

			$.each(allFeatureClasses.lrsFeatureClasses, function(index1) {
				//debugger;

				//console.log(allFeatureClasses.lrsFeatureClasses[index1]); //Todo: this line will refresh the allFeatureClasses content, need to figure out why
				if (allFeatureClasses.lrsFeatureClasses[index1].name === featureName) {
					currentFeature.symbologys = allFeatureClasses.lrsFeatureClasses[index1].symbologys;

					var isSymbolNameExist = false;
					$.each(allFeatureClasses.lrsFeatureClasses[index1].symbologys, function(index2) {
						//console.log(currentFeature.symbologyName);
						if (allFeatureClasses.lrsFeatureClasses[index1].symbologys[index2].symbolCol === currentFeature.symbologyName) {
							isSymbolNameExist = true;
						}


					});
					//allFeatureClasses.lrsFeatureClasses[index1];
					//debugger;
					if (!isSymbolNameExist) {
						console.log(allFeatureClasses.lrsFeatureClasses[index1]);
						if (allFeatureClasses.lrsFeatureClasses[index1].symbologys.length !== 0) {
							currentFeature.symbologyName = allFeatureClasses.lrsFeatureClasses[index1].symbologys[0].symbolCol;
						}
					}
				}
			});
		}.bind(this));
		defer.resolve(this);
		return defer.promise();
	};
	/*------------------------------*/

	/*-----------LrsFeatureClassSymbologySqs class------------*/
	var LrsFeatureClassSymbologySq = function(name, symbolColName, module) {
		this.seqIdx = 0;
		this.featureClassIdx = 0;
		this.symbologyIdx = 0;
		this.isCurrent = false;
		this.featureClassName = name;
		this.symbologys = new Array();
		this.symbologyName = symbolColName;
		this.lineSpace = '';
		this.modules = {
			'LAD': false,
			'TSD': false,
			'SLD': false
		};
		this.modules[module] = true;
		// this.modules = new Array();

		// function getSymbologyData(name) {
		//     var symbolData = [];
		//     $.each(featureClasses.lrsFeatureClasses, function(index) {
		//         if (featureClasses.lrsFeatureClasses[index].name === name) {
		//             symbolData = featureClasses.lrsFeatureClasses[index].symbologys;
		//         }
		//     });
		//     return symbolData;
		// }
		// function getFeatureCleassIdx(name) {
		//     var isFeatureClassExist = false;
		//     var featureClassIdx = 0;
		//     $.each(LB.featureClasses, function(index) {
		//         if (LB.featureClasses[index].name === name) {
		//             isFeatureClassExist = true;
		//             featureClassIdx = LB.featureClasses[index]
		//             return false;
		//         }
		//     });
		//     if (isFeatureClassExist) {
		//         return
		//     }
		// }
	};

	LrsFeatureClassSymbologySq.prototype.setFeatureClassID = function() {

	};
	LrsFeatureClassSymbologySq.prototype.updateFeatureClassInfo = function(layerName, routeSeg) {
		//reorder the index for all feature in featureclasses
		var _this = this;

		var isFeatureClassExist = false;
		$.each(featureClasses.lrsFeatureClasses, function(index) {
			if (featureClasses.lrsFeatureClasses[index].name === layerName) {
				isFeatureClassExist = true;
				return false;
			}
		}.bind(this));


		if (!isFeatureClassExist) {
			var newFeatureClass = new lrsFeatureClass(layerName);
			//newFeatureClass.setFeatureClassMetaData();

			return newFeatureClass.setFeatureClassMetaData().then(function(featureClassWithMetaData) {

				featureClassWithMetaData.setFeatureClassData({
					routeID: routeSeg.routeID,
					startMP: routeSeg.startMP,
					endMP: routeSeg.endMP
				}).then(function(featureClassWithData) {
					featureClassWithData.setSymbologyData().then(function(featureClassWithDataAndSymbology) {
						//debugger;
						//NOTE: no digest happens here because this is a raw $.ajax $promise...
						//set this feature class as current
						//debugger;
						//console.log(_this);
						featureClasses.setCurrent(featureClassWithDataAndSymbology.name);
						_this.symbologys = featureClassWithDataAndSymbology.symbologys;
						//deferred.resolve(featureClasses);

						featureClasses.add(0, newFeatureClass);
						return _this;
					});
				});
				// }
				// else{
				// 	console.log('Too many records in ' + layerName + ' layer!');
				// 	featureClassWithMetaData.setSymbologyData().then(function(featureClassWithDataAndSymbology) {
				// 		//debugger;
				// 		//NOTE: no digest happens here because this is a raw $.ajax $promise...
				// 		//set this feature class as current
				// 		//debugger;
				// 		//console.log(_this);
				// 		featureClasses.setCurrent(featureClassWithDataAndSymbology.name);
				// 		_this.symbologys = featureClassWithDataAndSymbology.symbologys;
				// 		//deferred.resolve(featureClasses);

				// 		featureClasses.add(0, newFeatureClass);
				// 		return _this;
				// 	});
				// }
			});

		}
		return _this;
	};

	LrsFeatureClassSymbologySq.prototype.getFeatureClassMetaData = function(layerName, featureClasses) {
		var layerInfo = {
			'data': null,
			'recordCount': 0,
			'name': layerName,
			'currentPageNum': 1,
			'symbolColName': '',
			'fromMeasColName': '',
			'toMeasColName': '',
			'filterColumn': '',
			'filterOperator': '',
			'filterValue': ''
		};
		var isFeatureClassExist = false;
		console.log(featureClasses);
		$.each(featureClasses, function(index) {
			// debugger
			if (featureClasses[index].name === layerName) {
				isFeatureClassExist = true;
				var feature = featureClasses[index];
				//console.log(feature);
				layerInfo.symbolColName = feature.currentSymbologyColumn;
				layerInfo.fromMeasColName = feature.fromMeasCol;
				layerInfo.toMeasColName = feature.toMeasCol;
				layerInfo.currentPageNum = feature.currentPageNum;
				layerInfo.filterColumn = feature.filterColumn;
				layerInfo.filterOperator = feature.filterOperator;
				layerInfo.filterValue = feature.filterValue;
				layerInfo.recordCount = feature.dataRecordCount;

				if (featureClasses[index].hasData) {
					var dataStr = feature.featuresClassData.data_str;
					// if (featureClasses[index].dataRecordCount > dataRecordThreshold) { // paging data
					// 	var dataObject = JSON.parse(dataStr);
					// 	// debugger
					// 	var dataArray = [];
					// 	for (var i = 0; i < dataObject.features.length; i++) {
					// 		dataArray.push(dataObject.features[i].properties);
					// 	}

					// 	layerInfo.data = JSON.stringify(JSONH.pack(dataArray));
					// } else { // all data
					// 	layerInfo.data = dataStr;
					// }
					layerInfo.data = dataStr;
				} else {
					layerInfo.data = null;
				}
			}


		}.bind(this));

		if (!isFeatureClassExist) {
			return null;
		} else {
			return layerInfo;
		}
	};

	LrsFeatureClassSymbologySq.prototype.getFeatureDataCount = function(layerName, featureClasses) {
		var count = 0;
		$.each(featureClasses, function(index) {
			// debugger
			if (featureClasses[index].name === layerName) {
				count = featureClasses[index].dataRecordCount;
			}
		}.bind(this));

		return count;
	};


	/*-----------Utility class------------*/
	window.LB.Utility = function() {

	};
	LB.Utility.prototype.unpackJsonhData = function(JsonhData) {
		var JsonhDataArray = JSON.parse(JsonhData);
		//---using JSONH to unpack the array
		return JSONH.unpack(JsonhDataArray);
	};
	LB.Utility.prototype.getCurrentFeatureClass = function(featureClassesName, featureClassesData) {
		for (var i = 0; i < featureClassesData.length; i++) {
			if (featureClassesData[i].name === featureClassesName) {
				return featureClassesData[i];
			}
		}
	};
	LB.Utility.prototype.filterVisible = function(filter, symbolName, value) {
		for (var k = 0; k < filter.length; k++) {
			if (filter[k].filterColumn === symbolName) {
				for (var l = 0; l < filter[k].filterValue.length; l++) {
					if (filter[k].filterValue[l] === value) {
						return false;
					}
				}
			}
		}
		return true;
	};
	LB.Utility.prototype.countSymbologyFC = function(featureData, symbology) {
		console.log(featureData);
		console.log(symbology);
		var featureDataStr = this.unpackJsonhData(featureData.featuresClassData.data_str);
		var symbolType = symbology.symbolType;
		var symbolName = symbology.name;
		var symbols = symbology.symbologyData.Symbol;
		var filter = featureData.filter;
		var fromMeasCol = featureData.fromMeasCol;
		var toMeasCol = featureData.toMeasCol;
		var shapeType,
			statistics = [];
		if (fromMeasCol === toMeasCol) {
			shapeType = 'pointStyle';
		} else {
			shapeType = 'lineStyle';
		}
		if (symbolType === 'NOMINAL') {
			/*----------first check and store Others symbology-----------*/
			var othersColor, othersLabel, othersShape, othersScale, othersValue, othersVisible,
				others = false; //---set default false indicate no Others symbology
			for (var i = 0; i < symbols.length; i++) {
				if (symbols[i].value === 'Others') {
					others = true; //---if Others symbology, set true
					othersColor = symbols[i].color;
					othersLabel = symbols[i].label;
					othersShape = symbols[i][shapeType].slice(0, 3);
					othersScale = symbols[i][shapeType].slice(3);
					othersValue = symbols[i].value;
					othersVisible = this.filterVisible(filter, symbolName, othersValue);
					break;
				}
			}
			if (others === true) { //---count Others symbology in featuerData
				var othersCount = 0;
				for (var i = 0; i < featureDataStr.length; i++) {
					var counter = 0;
					for (var j = 0; j < symbols.length; j++) {
						if (featureDataStr[i][symbolName] !== symbols[j].value) {
							//---check current featureDataStr if in symbology list
							//---count total times different in symbology list
							counter++;
						}
					}
					// counter === symbols.length ? othersCount++ : othersCount;
					if (counter === symbols.length) {
						//---counter = symbols.length means
						//---current featureDataStr dosen't meet one of symbology,
						//---it is in Others symbology
						othersCount++;
					}
				}
				if (othersCount > 0) {
					statistics.push({
						label: othersLabel,
						color: othersColor,
						count: othersCount,
						shape: othersShape,
						scale: othersScale,
						value: othersValue,
						visible: othersVisible
					});
				}
			}
			/*---------------------*/
			for (var i = 0; i < symbols.length; i++) {
				var color = symbols[i].color;
				var label = symbols[i].label;
				var shape = symbols[i][shapeType].slice(0, 3);
				var scale = symbols[i][shapeType].slice(3);
				var value = symbols[i].value;
				var visible = this.filterVisible(filter, symbolName, value);
				var counter = 0;
				for (var j = 0; j < featureDataStr.length; j++) {
					if (featureDataStr[j][symbolName] === value) {
						counter++;
					}
				}
				if (counter > 0) {
					//---only push symbology that have count
					statistics.push({
						label: label,
						color: color,
						count: counter,
						shape: shape,
						scale: scale,
						value: value,
						visible: visible
					});
				} else {
					continue;
				}

				// if (counter === 0) {
				// 	//---push all symbology but set visible false if not count
				// 	visible = false;
				// }
				// statistics.push({label:label, color: color, count: counter, visible: visible});
			}
			return statistics;
		} else if (symbolType === 'INTERVAL' || symbolType === 'ORDINAL') {
			for (var i = 0; i < symbols.length; i++) {
				var color = symbols[i].color;
				var label = symbols[i].label;
				var shape = symbols[i][shapeType].slice(0, 3);
				var scale = symbols[i][shapeType].slice(3);
				var value = symbols[i].value;
				var visible = this.filterVisible(filter, symbolName, value);
				var counter = 0;
				var symbolValue = symbols[i].value.split(':'); //-----split(str to array) symbol range eg: '[61:70]' --> ['[61', '70]']
				var minBoundValue = parseFloat(symbolValue[0].replace(/^\D+/g, '')); //-----use regex get number from string
				var maxBoundValue = parseFloat(symbolValue[1].replace(/\D+$/g, ''));
				var startSymbol = symbolValue[0][0];
				var temp = symbolValue[1];
				var endSymbol = temp[temp.length - 1];
				for (var j = 0; j < featureDataStr.length; j++) {
					if (((startSymbol === '(' && featureDataStr[j][symbolName] > minBoundValue) ||
							(startSymbol === '[' && featureDataStr[j][symbolName] >= minBoundValue)) &&
						((endSymbol === ')' && featureDataStr[j][symbolName] < maxBoundValue) ||
							(endSymbol === ']' && featureDataStr[j][symbolName] <= maxBoundValue))) {
						counter++;
					}
				}
				if (counter > 0) {
					//---only push symbology that have count if not count
					statistics.push({
						label: label,
						color: color,
						count: counter,
						shape: shape,
						scale: scale,
						value: value,
						visible: visible
					});
				} else {
					continue;
				}

				// if (counter === 0) {
				// 	//---push all symbology but set visible false if not count
				// 	visible = false;
				// }
				// statistics.push({label:label, color: color, count: counter, visible: visible});
			}
			return statistics;
		}
	};
	LB.Utility.prototype.getTotalCount = function(data) {
		var count = 0;
		for (var i = 0; i < data.length; i++) {
			if (data[i].visible === true) {
				count += data[i].count;
			}
		}
		return count;
	};
	LB.Utility.prototype.getBufferRange = function(feature, metaData, uom) {
		var bufferValue;
		// debugger;
		if (uom === 'MILE') {
			bufferValue = 0.024;
		} else if (uom === 'METER') {
			bufferValue = 40;
		} else if (uom === 'KM') {
			bufferValue = 0.04;
		} else if (uom === 'FT') {
			bufferValue = 120;
		}
		return {
			from: Number(feature[metaData.fromMeasCol]) - bufferValue,
			to: Number(feature[metaData.toMeasCol]) + bufferValue
		};
	};
	LB.Utility.prototype.getMaxRangeForD3 = function(dataList) {
		if (dataList[0].shape !== 'LNS') {
			var highest = dataList[0].x;
			for (var i = 0; i < dataList.length; i++) {
				var temp = dataList[i].x;
				if (temp > highest) {
					highest = temp;
				}
			}
			return highest;
		}
		if (dataList[0].shape === 'LNS') {
			var highest = dataList[0].end;
			for (var i = 0; i < dataList.length; i++) {
				var temp = dataList[i].end;
				if (temp > highest) {
					highest = temp;
				}
			}
			return highest;
		}
	};
	LB.Utility.prototype.getMinRangeForD3 = function(dataList) {
		if (dataList[0].shape !== 'LNS') {
			var lowest = dataList[0].x;
			for (var i = 0; i < dataList.length; i++) {
				var temp = dataList[i].x;
				if (temp < lowest) {
					lowest = temp;
				}
			}
			return lowest;
		}
		if (dataList[0].shape === 'LNS') {
			var lowest = dataList[0].start;
			for (var i = 0; i < dataList.length; i++) {
				var lowest = dataList[i].start;
				if (temp < lowest) {
					lowest = temp;
				}
			}
			return lowest;
		}
	};
	LB.Utility.prototype.getD3PlotData = function(eventData, dataList) {
		var d = eventData;
		var point = null;
		for (var i = 0; i < dataList.length; i++) {
			if (dataList[i].id === d.value) {
				point = dataList[i];
				break;
			}
		}
		var dataSet = [];
		for(i = 0; i < dataList.length; i++){
			if(dataList[i].shape !== 'LNS'){
				if(dataList[i].x >= d.bufferStart && dataList[i].x <= d.bufferEnd){
					if(dataList[i].id !== d.value)
					dataSet.push(dataList[i]);
				}
			}
			if (dataList[i].shape === 'LNS') {
				if (dataList[i].start <= d.bufferStart && dataList[i].end >= d.bufferStart) {
					if (dataList[i].id !== d.value) {
						dataSet.push(dataList[i]);
					}
				}
				if (dataList[i].start >= d.bufferStart && dataList[i].start <= d.bufferEnd) {
					if (dataList[i].id !== d.value) {
						dataSet.push(dataList[i]);
					}
				}
				if (dataList[i].start >= d.bufferStart && dataList[i].end <= d.bufferEnd) {
					if (dataList[i].id !== d.value) {
						dataSet.push(dataList[i]);
					}
				}
			}
		}
		if (point) {
			dataSet.push(point);
		}
		return dataSet;
	};
	LB.Utility.prototype.parseD3PlotData = function(layer, fromMesaCol, toMesaCol, symbology, data, id) {
		var symbols = [];
		var shapeType = '';
		var plotData = [];
		for (var i = 0; i < symbology.length; i += 1) {
			if (symbology[i].name === layer) {
				symbols.push(symbology[i]);
				break;
			}
		}
		if (symbols.length === 0) {
			return null;
		}
		if (fromMesaCol === toMesaCol) {
			shapeType = 'point';
		} else if (fromMesaCol !== toMesaCol) {
			shapeType = 'line';
		}
		var symbol = symbols[0];
		var symbolArray = symbol.symbologyData.Symbol;
		var others = [];
		for (var i = 0; i < symbolArray.length; i += 1) {
			if ('Others' === symbolArray[i].value) {
				others.push(symbolArray[i]);
				console.log(others);
				break;
			}
		}
		for (var i = 0; i < data.length; i += 1) {
			var temp = {};
			for (var j = 0; j < symbolArray.length; j += 1) {
				if ('NOMINAL' === symbols[0].symbolType) {
					if (data[i][layer].toString() === symbolArray[j].value.toString()) {
						temp.id = data[i][id];
						temp.y = symbolArray[j].label;
						temp.color = symbolArray[j].color;
						//debugger;
						if ('point' === shapeType) {
							if (symbolArray[j].pointStyle.startsWith('CIR')) {
								temp.shape = 'circle';
							} else if (symbolArray[j].pointStyle.startsWith('SQR')) {
								temp.shape = 'square';
							} else if (symbolArray[j].pointStyle.startsWith('TRI')) {
								temp.shape = 'triangle-up';
							}
							temp.x = data[i][fromMesaCol];
							temp.scale = symbolArray[j].pointRadius;
						} else if ('line' == shapeType) {
							temp.shape = 'LNS';
							temp.start = data[i][fromMesaCol];
							temp.end = data[i][toMesaCol];
							temp.scale = symbolArray[j].lineWide;
						}
					}
				} else {
					var symbolValue = symbolArray[j].value.split(':'); //-----split(str to array) symbol range eg: '[61:70]' --> ['[61', '70]']
					var minBoundValue = parseFloat(symbolValue[0].replace(/^\D+/g, '')); //-----use regex get number from string
					var maxBoundValue = parseFloat(symbolValue[1].replace(/\D+$/g, ''));
					var startSymbol = symbolValue[0][0];
					var endSymbol = symbolValue[1][symbolValue[1].length - 1];
					var axis = '';
					var symbolTemp = {};
					if (((startSymbol === '(' && data[i][layer] > minBoundValue) ||
							(startSymbol === '[' && data[i][layer] >= minBoundValue)) &&
						((endSymbol === ')' && data[i][layer] < maxBoundValue) ||
							(endSymbol === ']' && data[i][layer] <= maxBoundValue))) {
						temp.id = data[i][id];
						temp.y = symbolArray[j].label;
						temp.color = symbolArray[j].color;
						if ('point' === shapeType) {
							temp.scale = symbolArray[j].pointRadius;
							if (symbolArray[j].pointStyle.startsWith('CIR')) {
								temp.shape = 'circle';
							} else if (symbolArray[j].pointStyle.startsWith('SQR')) {
								temp.shape = 'square';
							} else if (symbolArray[j].pointStyle.startsWith('TRI')) {
								temp.shape = 'triangle-up';
							}
							temp.x = data[i].MILEPOINT;
						} else {
							temp.shape = 'LNS';
							temp.start = data[i][fromMesaCol];
							temp.end = data[i][toMesaCol];
							temp.scale = symbolArray[j].lineWide;
						}
					}
				}
			}
			// debugger
			if (temp.shape !== undefined) {
				plotData.push(temp);
			} else {
				if (others !== undefined) {
					temp.y = others[0].label;
					temp.color = others[0].color;
					temp.id = data[i][id];
					if ('point' === shapeType) {
						temp.x = data[i][fromMesaCol];
						if (others[0].pointStyle.startsWith('CIR')) {
							temp.shape = 'circle';
						} else if (others[0].pointStyle.startsWith('SQR')) {
							temp.shape = 'square';
						} else if (others[0].pointStyle.startsWith('TRI')) {
							temp.shape = 'triangle-up';
						}
					} else {
						temp.shape = 'LNS';
						temp.start = data[i][fromMesaCol];
						temp.end = data[i][toMesaCol];
						temp.scale = others[0].lineWide;
					}
					plotData.push(temp);
				}
			}
		}
		return plotData;
	};

	/*--------------------------------*/


	/*-----------Map class------------*/
	var Strategy = function() {
		return {
			searchMPLoc: function(routeGeom, milePost, seg_count, presicion) {
				var target_seg = null;
				// console.log(seg_count);
				for (var i = 0; i < seg_count; i++) {
					var tmp_seg = routeGeom[i];
					// console.log(tmp_seg);
					tmp_seg.sort(function(prev, next) {
						return (prev[2] - next[2]);
					});
					var node_count = tmp_seg.length;
					if (node_count === 0) {
						return [];
					}
					var seg_start_mp = parseFloat(tmp_seg[0][2].toFixed(presicion));
					var seg_end_mp = parseFloat(tmp_seg[node_count - 1][2].toFixed(presicion));
					if (milePost > seg_start_mp && milePost < seg_end_mp) {
						target_seg = tmp_seg;
						break;
					} else if (milePost === seg_start_mp || milePost === seg_end_mp) {
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
					} else if (typeof(prevCoord) === 'undefined') {
						return [midCoord[0], midCoord[1], milePost];
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
			filterCacheData: function(CacheData, startMP, endMP, fromMeasCol, toMeasCol) {
				var CacheDataArray = JSON.parse(CacheData);
				//---using JSONH to unpack the array
				var CacheDataObj = JSONH.unpack(CacheDataArray);
				console.log(CacheDataObj);
				console.log(fromMeasCol);
				console.log(toMeasCol);
				// debugger;
				if (fromMeasCol === toMeasCol) { //if event point (formMeas & toMeas have same col name)
					for (var i = 0; i < CacheDataObj.length; i++) {
						if (parseFloat(CacheDataObj[i][fromMeasCol]) < parseFloat(startMP) ||
							parseFloat(CacheDataObj[i][fromMeasCol]) > parseFloat(endMP)) {
							CacheDataObj.splice(i, 1); //remove data not within from-to range
							i -= 1;
						}
					}
				} else { //else event line
					for (var i = 0; i < CacheDataObj.length; i++) {
						if (CacheDataObj[i][fromMeasCol] === CacheDataObj[i][toMeasCol]) { //startMP value = endMP value (draw in point)
							if (parseFloat(CacheDataObj[i][fromMeasCol]) < parseFloat(startMP) ||
								parseFloat(CacheDataObj[i][fromMeasCol]) > parseFloat(endMP)) {
								CacheDataObj.splice(i, 1); //remove data not within from-to range
								i -= 1;
							}
						}
					}
				}
				return CacheDataObj;
			},
			filterEventData: function(eventObjArray, filter, currentSyData) {
				// var eventInfoArray = JSON.parse(eventInfo);
				// //---using JSONH to unpack the array
				// var eventObjArray = JSONH.unpack(eventInfoArray);
				console.log(eventObjArray);
				var currentSymbology = currentSyData;
				var currSymbolType = currentSymbology.symbolType;
				var currSymbolCol = currentSymbology.symbolCol;
				var symbols = currentSymbology.symbologyData.Symbol;
				if (filter) {
					var filterCol;
					for (var i = 0; i < filter.length; i += 1) {
						filterCol = filter[i].filterColumn;
						if (filterCol === currSymbolCol) {
							if (currSymbolType === 'NOMINAL') {
								for (var j = 0; j < filter[i].filterValue.length; j += 1) {
									if (filter[i].filterValue[j] === 'Others') {
										for (var k = 0; k < eventObjArray.length; k += 1) {
											var counter = 0;
											for (var l = 0; l < symbols.length; l += 1) {
												if (eventObjArray[k][filterCol] !== symbols[l].value) {
													//---check current featureDataStr if in symbology list
													//---count total times different in symbology list
													counter += 1;
												}
											}
											if (counter === symbols.length) {
												//---counter = symbols.length means
												//---current featureDataStr dosen't meet one of symbology,
												//---it is in Others symbology
												eventObjArray.splice(k, 1);
												k -= 1;
											}
										}
									} else {
										for (var m = 0; m < eventObjArray.length; m += 1) {
											if (filter[i].filterValue[j] === eventObjArray[m][filterCol]) {
												eventObjArray.splice(m, 1);
												//---length will reduce after splice element
												//---decrease one index so that doesn't miss any elements
												m -= 1;
											}
										}
									}
								}
							} else {
								for (var j = 0; j < filter[i].filterValue.length; j += 1) {
									for (var k = 0; k < eventObjArray.length; k += 1) {
										//-----split(str to array) symbol range eg: '[61:70]' --> ['[61', '70]']
										var symbolValue = filter[i].filterValue[j].split(':');
										//-----use regex get number from string
										var minBoundValue = parseFloat(symbolValue[0].replace(/^\D+/g, ''));
										var maxBoundValue = parseFloat(symbolValue[1].replace(/\D+$/g, ''));
										var startSymbol = symbolValue[0][0];
										var temp = symbolValue[1];
										var endSymbol = temp[temp.length - 1];
										var featureValue = eventObjArray[k][filterCol];
										// console.log(featureValue);
										if (((startSymbol === '(' && featureValue > minBoundValue) ||
												(startSymbol === '[' && featureValue >= minBoundValue)) &&
											((endSymbol === ')' && featureValue < maxBoundValue) ||
												(endSymbol === ']' && featureValue <= maxBoundValue))) {
											eventObjArray.splice(k, 1);
											//---length will reduce after splice element
											//---decrease one index so that doesn't miss any elements
											k -= 1;
										}
									}
								}
							}
						}
					}
				}
				return eventObjArray;
			},
			getEventPoint: function(dataArray, fromMeasCol, toMeasCol) {
				// if (eventName == 'Crashes' || eventName == 'Culverts' || eventName == 'Structures') {
				// var eventInfoArray = JSON.parse(eventInfo);
				// //---using JSONH to unpack the array
				// var eventObjArray = JSONH.unpack(eventInfoArray);
				console.log(fromMeasCol);
				console.log(toMeasCol);
				// debugger;
				var eventInfo_count = dataArray.length;
				var pointArry = [];
				for (var i = 0; i < eventInfo_count; i++) {
					if (fromMeasCol === toMeasCol) {
						pointArry.push(dataArray[i][fromMeasCol]);
					} else {
						var tmp_line = [dataArray[i][fromMeasCol], dataArray[i][toMeasCol]];
						pointArry.push(tmp_line);
					}
				}
				return pointArry;
			},
			getSegmentCount: function(routeGeom) {
				//var geometry_name = route_meta_data['routeGeomCol'];
				var geometry = routeGeom.geometry;
				var geom_type = geometry.type;
				if (geom_type === 'MultiLineString') {
					return geometry.coordinates.length;
				} else if (typeof(geom_type) === 'undefined') {
					if (typeof(geometry.coordinates[0][0][0]) === 'undefined') {
						return 1;
					} else {
						return geometry.coordinates.length;
					}
				}
				return 1;
			},
			getCurFeaName: function(symbSqs) { //use symbologySqs to find current event and return event name
				var SymSqsArray = symbSqs.lrsFCSymSqs;
				// var SymSqsArray_count = SymSqsArray.length;
				// console.log(SymSqsArray);
				for (var i = 0; i < SymSqsArray.length; i++) {
					if (SymSqsArray[i].isCurrent === true) { //should be true after Terry fix from driver
						return SymSqsArray[i].featureClassName;
					}
				}
				return false;
			},
			getCurSymData: function(symbSqs) {
				console.log(symbSqs);
				// debugger;
				var symSqsArr = symbSqs.lrsFCSymSqs;
				// console.log(symSqsArr);
				for (var i = 0; i < symSqsArr.length; i++) {
					if (symSqsArr[i].isCurrent === true) { //should be true after Terry fix from driver
						var symbo = symSqsArr[i].symbologys;
						for (var j = 0; j < symbo.length; j++) {
							if (symbo[j].isCurrent === true) { //should be true after Terry fix from driver

								return {
									symbolCol: symbo[j].symbolCol,
									symbolType: symbo[j].symbolType,
									symbologyData: symbo[j].symbologyData
								};
							}
						}
					}
				}
				return false;
			},
			getCurData: function(lrsFC, feaName) {
				var lrsFeaClass = lrsFC.lrsFeatureClasses;
				for (var i = 0; i < lrsFeaClass.length; i++) {
					if (lrsFeaClass[i].name === feaName) {
						return lrsFeaClass[i].featuresClassData.data_str;
					}
				}
				return false;
			},
			//Get bbox's x/y of the rotating feature
			getRotBboxRatio: function(GeoJson, Radian) {
				var coordsRotate = [];
				var coordsPointRotate, maxX, minX, maxY, minY, bboxRatio;
				var coordsRaw, coordsRawMutiString;
				if (GeoJson.geometry.type === 'LineString') {
					coordsRaw = GeoJson.geometry.coordinates;
					for (var i = 0; i < coordsRaw.length; i++) {
						coordsPointRotate = ol.coordinate.rotate([coordsRaw[i][0], coordsRaw[i][1]], -Radian); // rotate each point of the line, COUNTER-CLOCKWISE
						//console.log(coordsPointRotate); //[x,y];
						coordsRotate.push(coordsPointRotate);
						if (!maxX || maxX < coordsPointRotate[0]) { // find the max and min value of x and y after rotation
							maxX = coordsPointRotate[0];
						}
						if (!minX || minX > coordsPointRotate[0]) {
							minX = coordsPointRotate[0];
						}
						if (!maxY || maxY < coordsPointRotate[1]) {
							maxY = coordsPointRotate[1];
						}
						if (!minY || minY > coordsPointRotate[1]) {
							minY = coordsPointRotate[1];
						}
					}
					bboxRatio = (maxX - minX) / (maxY - minY);
				} else if (GeoJson.geometry.type === 'MultiLineString') {
					coordsRawMutiString = GeoJson.geometry.coordinates; //if GeoJson's type is MultiLineString, the coorinate array consists of arrays of LineString coordinates
					for (var j = 0; j < coordsRawMutiString.length; j++) {
						coordsRaw = coordsRawMutiString[j];
						for (var i = 0; i < coordsRaw.length; i++) {
							coordsPointRotate = ol.coordinate.rotate([coordsRaw[i][0], coordsRaw[i][1]], -Radian);
							coordsRotate.push(coordsPointRotate);
							if (!maxX || maxX < coordsPointRotate[0]) { // find the max and min value of x and y after rotation
								maxX = coordsPointRotate[0];
							}
							if (!minX || minX > coordsPointRotate[0]) {
								minX = coordsPointRotate[0];
							}
							if (!maxY || maxY < coordsPointRotate[1]) {
								maxY = coordsPointRotate[1];
							}
							if (!minY || minY > coordsPointRotate[1]) {
								minY = coordsPointRotate[1];
							}
						}
					}
					bboxRatio = (maxX - minX) / (maxY - minY);
				}
				return bboxRatio;
			},
			getMapBbox: function() {
				var mapDiv = {};
				mapDiv.mapWidth = $('#layout_map').width();
				mapDiv.mapHeight = $('#layout_map').height();
				return mapDiv;
			},
			getMpFromXY: function(routeJson, XYcoord) {
				console.log(XYcoord);
				console.log(routeJson.geometry.type);
				var routeSeg = [];
				if (routeJson.geometry.type === 'LineString') {
					routeSeg.push(routeJson.geometry.coordinates);
					console.log(routeSeg);
				} else if (routeJson.geometry.type === 'MultiLineString') {
					routeSeg = routeJson.geometry.coordinates; // So that LineString and MultiLineString would have same formats of routeSeg
					console.log(routeSeg);
				}
				var pointsArray, milePoint, Xmax, Xmin, Ymax, Ymin;
				for (var i = 0; i < routeSeg.length; i++) {
					pointsArray = routeSeg[i];
					for (var x = 0; x < pointsArray.length - 1; x++) { // find the two points that XYcoord falls in between
						Xmax = Math.max(pointsArray[x][0], pointsArray[x + 1][0]);
						Xmin = Math.min(pointsArray[x][0], pointsArray[x + 1][0]);
						Ymax = Math.max(pointsArray[x][1], pointsArray[x + 1][1]);
						Ymin = Math.min(pointsArray[x][1], pointsArray[x + 1][1]);
						var determinant;
						if (Xmin <= XYcoord[0] && XYcoord[0] <= Xmax && Ymin <= XYcoord[1] && XYcoord[1] <= Ymax) {
							// if XYcoord falls in between, check if the three points are collinear using the determinant of Matrix
							var matrixCollinear = [
								[pointsArray[x][0], pointsArray[x][1], 1],
								[pointsArray[x + 1][0], pointsArray[x + 1][1], 1],
								[XYcoord[0], XYcoord[1], 1]
							];
							console.log('in extent');
							console.log(pointsArray[x]);
							// debugger;
							// The condition of collinearity is -- the determinant of the matrix equals 0, which is the ideal case. Usually, the det would be around 0.
							// smaller det is better
							if (!determinant || (Math.abs(math.det(matrixCollinear)) < determinant)) {
								determinant = math.det(matrixCollinear);
								var segDist = Math.sqrt(Math.pow((pointsArray[x][0] - pointsArray[x + 1][0]), 2) + Math.pow((pointsArray[x][1] - pointsArray[x + 1][1]), 2)); // distance between the two points on route
								var prev_XYcoord_Dist = Math.sqrt(Math.pow((pointsArray[x][0] - XYcoord[0]), 2) + Math.pow((pointsArray[x][1] - XYcoord[1]), 2)); // distance between the previous point and XYcoord
								var mpPrev = pointsArray[x][2];
								var mpNext = pointsArray[x + 1][2];
								milePoint = mpPrev + (mpNext - mpPrev) * prev_XYcoord_Dist / segDist;
								// debugger;
								return milePoint;
							}
						}
					}
				}
			},
			setInvisableContrastLayer: function(rouGeom) {
				var geojson = JSON.parse(rouGeom.data_str);
				return new ol.layer.Vector({
					// title: 'Route',
					visible: false,
					source: new ol.source.Vector({
						features: (new ol.format.GeoJSON()).readFeatures(geojson)
					})
				});
			},
			getSameRouteIDFeatures: function(allFeatures, routeIDCol, idValue) {
				var sameFeatures = [];
				for (var i = 0; i < allFeatures.length; i++) {
					if (allFeatures[i][routeIDCol] === idValue) {
						sameFeatures.push(allFeatures[i]);
					}
				}
				return sameFeatures;
			}
		};
	};
	var Lrs = function() {
		return {
			getLrsMetaData: function() {
				var metaObject = {};
				var unit_of_measure = ''; //uom
				var dim = 2;
				var precis = 3;
				var route_id_col = 'ID';
				var route_geom_col = 'geometry';
				metaObject['UOM'] = unit_of_measure;
				metaObject['Dimensions'] = dim;
				metaObject['Measure_Precision'] = precis;
				metaObject['routeIDCol'] = route_id_col;
				metaObject['routeGeomCol'] = route_geom_col;
				return metaObject;
			},
			setEventMetaData: function() {
				var metaObject = {};
				metaObject['type'] = 'FeatureCollection';
				metaObject['features'] = [];
				return metaObject;
			},
			setFeatureMeataData: function(type, propert, coordina) {
				var metaObject = {};
				var geometryObj = {};
				// var properObj = {};
				geometryObj['type'] = type;
				geometryObj['coordinates'] = coordina;
				// properObj['']
				metaObject['type'] = 'Feature';
				metaObject['properties'] = propert;
				metaObject['geometry'] = geometryObj;
				return metaObject;
			},
			setTempModifyPointMetaData: function(startFeature, endFeature, properties) {
				return {
					type: 'Feature',
					geometry: {
						type: 'MultiPoint',
						coordinates: [startFeature, endFeature]
					},
					properties: properties
				};
			}
		};
	};
	var BaseMap = function() {
		this.description = '';
		this.layerInfo = null;
		this.name = '';
		this.mapType = '';
		this.epsg = 0;
		this.url = '';
		this.mapFullExtent = null;
		this.initialExtent = null;
		this.visible = false;
	};
	window.LB.Map = function(id) {
		// this.cusID = null;
		this.previousRouteID = null;
		this.previousStartMP = null;
		this.previousEndMP = null;
		// this.rouGeom = null;
		this.map = null;
		this.target = id;
		this.layers = [];
		// this.overlayer = [];
		this.controls = [];
		this.view = null;
		this.projection = null;
		this.extent = [];
		this.basemaps = [];
		this.serInfo = null;
		// this.layerInfo = null;
		this.layerExtent = [];
		this.currEventData = null;
		// this.eventName = 'CRASH_SEVERITY_ID';
		this.fromMeasCol = '';
		this.toMeasCol = '';
		this.currentSyData = null;
		this.selectedFeature = null;
		// this.routeSegment = LB.RouteSegment();
		// this._eventList = {};

		//this is used to store the current layer featureIDCol,
		//which is used to get the current selected feature
		this.currentLayerFeatureIDCol = null;
		this.cursorLayer = null;
		this.CurrentRouteGeom = null;
		// this.modifiedFeatures = [];
	};
	LB.Map.prototype.updateSize = function() {
		this.map.updateSize();
	};
	LB.Map.prototype.getMapInfo = function(rootUrl, customerID) {
		return $.ajax({
			method: 'POST',
			url: rootUrl + 'GetMapServiceInfo',
			context: this,
			data: {
				customerID: customerID
			}
		}).then(function(result) {
			//console.log(result);
			this.serInfo = result;
			console.log(result);
			return this;
		});
	};
	LB.Map.prototype.getEventInfo = function(feaClasses, symbSqs) {
		if (feaClasses) {
			var currentFeatureName = Strategy().getCurFeaName(symbSqs);
			var FCArray = feaClasses.lrsFeatureClasses;
			for (var i = 0; i < FCArray.length; i++) {
				if (FCArray[i].name === currentFeatureName) {
					var DataArray = JSON.parse(FCArray[i].featuresClassData.data_str);
					//---using JSONH to unpack the array
					this.currEventData = JSONH.unpack(DataArray);
					this.fromMeasCol = FCArray[i].fromMeasCol;
					this.toMeasCol = FCArray[i].toMeasCol;
					this.filter = FCArray[i].filter;
					break;
				}
			}
			this.currentSyData = Strategy().getCurSymData(symbSqs);
			console.log(this.fromMeasCol);
			// debugger;
		}
	};
	LB.Map.prototype.buildBasemapObj = function() {
		console.log(this.serInfo);
		var basemapDefs = this.serInfo.BasemapInfo.Server;
		var basemapCount = this.serInfo.BasemapInfo.Server.length;
		var mapextent = JSON.parse(this.serInfo.MapExtent);
		// var testmap = new Array();
		if (basemapCount) {
			for (var i = 0; i < basemapCount; i++) {
				var info;
				if (basemapDefs[i].LayerInfo !== '') {
					info = JSON.parse(basemapDefs[i].LayerInfo);
				}
				var baseMap = new BaseMap();
				baseMap.description = basemapDefs[i].Description;
				baseMap.url = basemapDefs[i].Url;
				baseMap.mapType = basemapDefs[i].Type;
				baseMap.layerInfo = info;
				baseMap.epsg = info.spatialReference.wkid;
				baseMap.mapFullExtent = info.fullExtent;
				baseMap.initialExtent = mapextent;
				this.basemaps.push(baseMap);
			}
			console.log(this.basemaps);
		} else {
			alert('No available layers!');
		}
	};
	LB.Map.prototype.setWFSmap = function(url, scaleDependecy, color) {
		var wfsSource = new ol.source.Vector({
			format: new ol.format.GeoJSON(),
			url: function(extent, resolution, projection) {
				return url;
			},
			strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({

			}))
		});
		this.wfsLayer = new ol.layer.Vector({
			title: 'WFS',
			source: wfsSource,
			maxResolution: scaleDependecy,
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: color,
					width: 3
				})
			})
		});
		this.layers.push(this.wfsLayer);
	};
	LB.Map.prototype.setBasemap = function() {
		var basemaps = [];
		var basemapArray = this.basemaps;
		basemapArray[0].visible = true; //-----set 'UDOT Streets' visible
		for (var i = 0; i < basemapArray.length; i++) {
			var basemapType = basemapArray[i].mapType;
			if (basemapType === 'ArcGIS Cache') {
				var baseMap = new ol.layer.Tile({
					title: basemapArray[i].description,
					type: 'base',
					visible: basemapArray[i].visible,
					source: new ol.source.TileArcGISRest({
						url: basemapArray[i].url
					})
				});
				basemaps.push(baseMap);
			} else {
				console.log('Service does not contain Cached Layer');
			}
		}
		var BaseMap = new ol.layer.Group({
			title: 'Basemaps',
			layers: basemaps,
		});
		this.layers.push(BaseMap);
	};
	LB.Map.prototype.drawEventPoint = function(routeSeg, idCol, idValue) {
		var routeGeom, seg_array;
		var coordin = [];
		routeGeom = JSON.parse(routeSeg.routeGeom.data_str);
		console.log(routeGeom);
		var seg_count = Strategy().getSegmentCount(routeGeom);
		var routeMetaData = Lrs().getLrsMetaData();
		var measure_precis = routeMetaData['Measure_Precision']; // for example, keep decimal places in three digits
		var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;
		console.log(routeMetaData);
		if (seg_count === 1) { //if LineString
			seg_array = [routeGeom.geometry.coordinates];
		} else { //esle MuiltLineString
			seg_array = routeGeom.geometry.coordinates;
		}
		var eventData = Lrs().setEventMetaData();
		var locArray = [];
		var formMeas = this.fromMeasCol;
		var toMeas = this.toMeasCol;
		// debugger;
		if (this.currEventData.length) {
			//---only use same route id features
			var currentRouteFeatures = Strategy().getSameRouteIDFeatures(this.currEventData, idCol, idValue);
			// debugger;
			var pointArray = Strategy().getEventPoint(currentRouteFeatures, formMeas, toMeas);
			console.log(pointArray);
			var featureData, eventLoc;
			if (formMeas === toMeas) { //if event point (formMeas & toMeas have same col name)
				for (var i = 0; i < pointArray.length; i++) {
					eventLoc = Strategy().searchMPLoc(seg_array, pointArray[i], seg_count, precis);
					// coorArray.push(eventLoc);
					featureData = Lrs().setFeatureMeataData('Point', currentRouteFeatures[i], eventLoc);
					locArray.push(featureData);
				}
				eventData.features = locArray;
				// debugger;
				console.log(eventData);
			} else if (formMeas !== toMeas) { //if event line
				for (var i = 0; i < pointArray.length; i++) {
					var startMP = pointArray[i][0];
					var endMP = pointArray[i][1];
					if (startMP === endMP) { //startMP value = endMP value (draw in point)
						eventLoc = Strategy().searchMPLoc(seg_array, startMP, seg_count, precis);
						featureData = Lrs().setFeatureMeataData('Point', currentRouteFeatures[i], eventLoc);
						locArray.push(featureData);
					} else { //startMP value != endMP value (draw in line)
						for (var j = 0; j < seg_count; j++) {
							coordin = []; //reset emtry coordin aviode repeat adding last data
							var tmp_seg = seg_array[j];
							tmp_seg.sort(function(prev, next) {
								return (prev[2] - next[2]);
							});
							var node_count = tmp_seg.length;
							var seg_start_mp = tmp_seg[0][2];
							var seg_end_mp = tmp_seg[node_count - 1][2];
							if (seg_end_mp <= startMP || seg_start_mp >= endMP) {
								continue;
							}
							if (seg_start_mp >= startMP && seg_end_mp <= endMP) {
								coordin = tmp_seg;
							} else if (seg_start_mp >= startMP && seg_end_mp > endMP) {
								for (var k = 0; k < node_count; k++) { // middle vertices
									var tmp_node = tmp_seg[k];
									if (tmp_node[2] < endMP) {
										coordin.push(tmp_node);
									}
								}
								var loc_End = Strategy().searchMPLoc(seg_array, endMP, seg_count, precis); // end vertices
								coordin.push(loc_End);
							} else if (seg_start_mp < startMP && seg_end_mp <= endMP) {
								var loc_Start = Strategy().searchMPLoc(seg_array, startMP, seg_count, precis); // start vertices
								coordin.push(loc_Start);
								for (var k = 0; k < node_count; k++) { // middle vertices
									var tmp_node = tmp_seg[k];
									if (tmp_node[2] > startMP) {
										coordin.push(tmp_node);
									}
								}
							} else if (seg_start_mp < startMP && seg_end_mp > endMP) {
								var loc_Start = Strategy().searchMPLoc(seg_array, startMP, seg_count, precis); // start vertices
								coordin.push(loc_Start);
								for (var k = 0; k < node_count; k++) { // middle vertices
									var tmp_node = tmp_seg[k];
									if (tmp_node[2] > startMP && tmp_node[2] < endMP) {
										coordin.push(tmp_node);
									}
								}
								var loc_End = Strategy().searchMPLoc(seg_array, endMP, seg_count, precis); // end vertices
								coordin.push(loc_End);
							}
							// debugger;
							featureData = Lrs().setFeatureMeataData('LineString', currentRouteFeatures[i], coordin);
							locArray.push(featureData);
						}
					}
					eventData.features = locArray;
					// debugger;
					// console.log(eventData);
				}
			}
		}
		return eventData;
	};
	LB.Map.prototype.drawModifiedLine = function(rouGeom, property, startMP, endMP) {
		var seg_array;
		var coordin = [];
		var routeGeom = JSON.parse(rouGeom.routeGeom.data_str);
		console.log(routeGeom);
		var seg_count = Strategy().getSegmentCount(routeGeom);
		var routeMetaData = Lrs().getLrsMetaData();
		var measure_precis = routeMetaData['Measure_Precision']; //---for example, keep decimal places in three digits
		var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;
		console.log(routeMetaData);
		if (seg_count === 1) { //---if LineString
			seg_array = [routeGeom.geometry.coordinates];
		} else { //---esle MuiltLineString
			seg_array = routeGeom.geometry.coordinates;
		}
		var modifiedLineData = Lrs().setEventMetaData();
		var featureData,
			locArray = [];
		// debugger;
		//---startMP value != endMP value (draw in line)
		for (var j = 0; j < seg_count; j++) {
			coordin = []; //reset emtry coordin aviode repeat adding last data
			var tmp_seg = seg_array[j];
			tmp_seg.sort(function(prev, next) {
				return (prev[2] - next[2]);
			});
			var node_count = tmp_seg.length;
			var seg_start_mp = tmp_seg[0][2];
			var seg_end_mp = tmp_seg[node_count - 1][2];
			if (seg_end_mp <= startMP || seg_start_mp >= endMP) {
				continue;
			}
			if (seg_start_mp >= startMP && seg_end_mp <= endMP) {
				coordin = tmp_seg;
			} else if (seg_start_mp >= startMP && seg_end_mp > endMP) {
				for (var k = 0; k < node_count; k++) { // middle vertices
					var tmp_node = tmp_seg[k];
					if (tmp_node[2] < endMP) {
						coordin.push(tmp_node);
					}
				}
				var loc_End = Strategy().searchMPLoc(seg_array, endMP, seg_count, precis); // end vertices
				coordin.push(loc_End);
			} else if (seg_start_mp < startMP && seg_end_mp <= endMP) {
				var loc_Start = Strategy().searchMPLoc(seg_array, startMP, seg_count, precis); // start vertices
				coordin.push(loc_Start);
				for (var k = 0; k < node_count; k++) { // middle vertices
					var tmp_node = tmp_seg[k];
					if (tmp_node[2] > startMP) {
						coordin.push(tmp_node);
					}
				}
			} else if (seg_start_mp < startMP && seg_end_mp > endMP) {
				var loc_Start = Strategy().searchMPLoc(seg_array, startMP, seg_count, precis); // start vertices
				coordin.push(loc_Start);
				for (var k = 0; k < node_count; k++) { // middle vertices
					var tmp_node = tmp_seg[k];
					if (tmp_node[2] > startMP && tmp_node[2] < endMP) {
						coordin.push(tmp_node);
					}
				}
				var loc_End = Strategy().searchMPLoc(seg_array, endMP, seg_count, precis); // end vertices
				coordin.push(loc_End);
			}
			// debugger;
			featureData = Lrs().setFeatureMeataData('LineString', property, coordin);
			locArray.push(featureData);
		}
		modifiedLineData.features = locArray;
		// debugger;
		console.log(modifiedLineData);
		return modifiedLineData;
	};
	LB.Map.prototype.setModifyLayer = function(geojson) {
		var styleFunction = function(feature, resolution) { //-----set style function for symbol
			var styles = [],
				geometry_type = feature.getGeometry().getType();
			styles['Point'] = [
				new ol.style.Style({
					image: new ol.style.Circle({
						fill: new ol.style.Fill({
							color: 'rgb(0, 128, 255)'
						}),
						stroke: new ol.style.Stroke({
							width: 1,
							color: 'rgb(0, 128, 255)'
						}),
						radius: 5
					})
				})
			];
			styles['LineString'] = [
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: 'rgb(0, 128, 255)',
						width: 3,
						// lineJoin: 'round',
						// lineCap: 'round',
						// lineDash: [6],
					})
				})
			];
			return styles[geometry_type];
		};
		var modifyLayer = new ol.layer.Vector({
			title: 'EventPoint',
			visible: true,
			source: new ol.source.Vector({
				features: (new ol.format.GeoJSON()).readFeatures(geojson)
			}),
			style: styleFunction
		});
		return modifyLayer;
	};
	LB.Map.prototype.setTempLayer = function(geojson) {
		var tempLayer = new ol.layer.Vector({
			title: 'TempLayer',
			visible: true,
			source: new ol.source.Vector({
				features: (new ol.format.GeoJSON()).readFeatures(geojson)
			}),
			style: new ol.style.Style({
				image: new ol.style.Circle({
					fill: new ol.style.Fill({
						color: 'rgb(0, 128, 255)'
					}),
					stroke: new ol.style.Stroke({
						width: 1,
						color: 'rgb(0, 128, 255)'
					}),
					radius: 5
				})
			})
		});
		return tempLayer;
	};
	LB.Map.prototype.getFeatureGeojson = function(selectCol, currentData) {
		// var currentData = this.eventData;
		var Map = this.map;
		var currentFeature;
		var formMeas = this.fromMeasCol;
		var toMeas = this.toMeasCol;
		// debugger;
		for (var i = 0; i < currentData.features.length; i++) {
			if (currentData.features[i].properties[selectCol['idCol']] === selectCol.value) {
				currentFeature = currentData.features[i];
				break;
			}
		}
		// debugger;
		if (currentFeature.geometry.type === 'Point') {
			var featuresWithinBuffer = Lrs().setEventMetaData();
			// var milePoint = Number(currentFeature.geometry.coordinates[2]);
			var startPoint = selectCol.bufferStart;
			var endPoint = selectCol.bufferEnd;
			for (var j = 0; j < currentData.features.length; j++) {
				if (Number(currentData.features[j].geometry.coordinates[2]) > startPoint &&
					Number(currentData.features[j].geometry.coordinates[2]) < endPoint) {
					featuresWithinBuffer.features.push(currentData.features[j]);
				}
			}
			// console.log(featuresWithinBuffer);
			// debugger;
			return featuresWithinBuffer;
		} else { //---else line layer
			//---remove previous tempe layer and draw new for modify line layer
			if (this.tempLayer) {
				Map.removeLayer(this.tempLayer);
			}
			var startCoordinates = currentFeature.geometry.coordinates[0];
			var endCoordinates = currentFeature.geometry.coordinates[currentFeature.geometry.coordinates.length - 1];
			var tempGeojson = Lrs().setTempModifyPointMetaData(startCoordinates, endCoordinates, currentFeature.properties);
			this.tempLayer = this.setTempLayer(tempGeojson);
			// debugger;
			Map.addLayer(this.tempLayer);
		}
		//---return line data for display
		return currentFeature;
	};
	LB.Map.prototype.showModifyLayer = function(selectCol, routeSeg) {
		console.log(selectCol);
		var self = this;
		var Map = this.map;
		if (this.modifyLayer) {
			Map.removeLayer(this.modifyLayer);
		}
		if (this.tempLayer) { //---tempLayer is the point for line layer to modify
			Map.removeLayer(this.tempLayer);
		}
		this.currentSelectCol = {
			idCol: selectCol.idCol,
			value: selectCol.value
		};
		this.CurrentRouteSegment = routeSeg;
		this.CurrentRouteGeom = JSON.parse(routeSeg.routeGeom.data_str);
		this.contrastLayer = Strategy().setInvisableContrastLayer(routeSeg.routeGeom);
		this.currentRouteData = this.drawEventPoint(routeSeg, selectCol.routeIDCol, selectCol.routeID);
		// debugger;
		//---get geojson of selected feature
		var selectedFeatureGeojon = this.getFeatureGeojson(selectCol, this.currentRouteData);
		//---set selected feature geojson to modifyLayer for display and modify by user
		this.modifyLayer = this.setModifyLayer(selectedFeatureGeojon);
		Map.addLayer(this.modifyLayer);
		this.highLightFeature(selectCol);
		//---get buffer extent and zoom to it
		var invisibleBufferLayer = this.getBufferExtent(selectCol.bufferStart, selectCol.bufferEnd, this.CurrentRouteSegment);
		//rotate the map base on buffer layer to fit map viewport
		var rotateRad = this.getMapRotateAngleRad(this.rotateGeojson);
		//-------------rotation setting must before extent setting--------------------------
		this.rotateAngleRad(rotateRad);
		Map.getView().fit(invisibleBufferLayer.getSource().getExtent(), Map.getSize());

		this.setCursorLayerOnTop();
	};
	LB.Map.prototype.mapViewAfterD3Pan = function(range) {
		var self = this;
		var newRangeData = {
			idCol: self.currentSelectCol.idCol,
			value: self.currentSelectCol.value,
			bufferStart: range.routeBegin,
			bufferEnd: range.routeEnd
		};
		// debugger;
		var Map = this.map;
		if (this.modifyLayer) {
			Map.removeLayer(this.modifyLayer);
		}
		if (this.tempLayer) { //---tempLayer is the point for line layer to modify
			Map.removeLayer(this.tempLayer);
		}
		//---get geojson of selected feature
		var selectedFeatureGeojon = this.getFeatureGeojson(newRangeData, this.currentRouteData);
		//---set selected feature geojson to modifyLayer for display and modify by user
		this.modifyLayer = this.setModifyLayer(selectedFeatureGeojon);
		Map.addLayer(this.modifyLayer);
		// this.highLightFeature(newRangeData);
		//---get buffer extent and zoom to it
		var invisibleBufferLayer = this.getBufferExtent(newRangeData.bufferStart, newRangeData.bufferEnd, this.CurrentRouteSegment);
		//rotate the map base on buffer layer to fit map viewport
		var rotateRad = this.getMapRotateAngleRad(this.rotateGeojson);
		//-------------rotation setting must before extent setting--------------------------
		this.rotateAngleRad(rotateRad);
		Map.getView().fit(invisibleBufferLayer.getSource().getExtent(), Map.getSize());

		this.setCursorLayerOnTop();
	};
	LB.Map.prototype.getBufferExtent = function(startMP, endMP, routeSeg) {
		var geoJson, routeGeom, seg_array;
		var coordin = [];
		var mulcoordin = [];
		routeGeom = JSON.parse(routeSeg.routeGeom.data_str);
		//console.log(routeGeom);
		// debugger;
		var seg_count = Strategy().getSegmentCount(routeGeom); //-----check LineString type return count
		var routeMetaData = Lrs().getLrsMetaData();
		var measure_precis = routeMetaData['Measure_Precision']; //-----for example, keep decimal places in three digits
		var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;
		//console.log(routeMetaData);
		// debugger;
		if (startMP === endMP) {
			console.log('From = End, should be different');
		} else if (startMP < endMP) {
			if (seg_count === 1) { //-----if LineString
				seg_array = [routeGeom.geometry.coordinates];
			} else { //-----esle MuiltLineString
				seg_array = routeGeom.geometry.coordinates;
			}
			for (var i = 0; i < seg_count; i++) {
				coordin = []; //-----reset emtry coordin aviode repeat adding last data
				var tmp_seg = seg_array[i];
				tmp_seg.sort(function(prev, next) {
					return (prev[2] - next[2]);
				});
				var node_count = tmp_seg.length;
				var seg_start_mp = tmp_seg[0][2];
				var seg_end_mp = tmp_seg[node_count - 1][2];
				if (seg_end_mp <= startMP || seg_start_mp >= endMP) {
					continue;
				}
				if (seg_start_mp >= startMP && seg_end_mp <= endMP) {
					coordin = tmp_seg;
				} else if (seg_start_mp >= startMP && seg_end_mp > endMP) {
					for (var j = 0; j < node_count; j++) //-----middle vertices
					{
						var tmp_node = tmp_seg[j];
						if (tmp_node[2] < endMP) {
							coordin.push(tmp_node);
						}
					}
					var loc_End = Strategy().searchMPLoc(seg_array, endMP, seg_count, precis); //-----end vertices
					coordin.push(loc_End);
				} else if (seg_start_mp < startMP && seg_end_mp <= endMP) {
					var loc_Start = Strategy().searchMPLoc(seg_array, startMP, seg_count, precis); //-----start vertices
					coordin.push(loc_Start);
					for (var j = 0; j < node_count; j++) //-----middle vertices
					{
						var tmp_node = tmp_seg[j];
						if (tmp_node[2] > startMP) {
							coordin.push(tmp_node);
						}
					}
				} else if (seg_start_mp < startMP && seg_end_mp > endMP) {
					var loc_Start = Strategy().searchMPLoc(seg_array, startMP, seg_count, precis); //-----start vertices
					coordin.push(loc_Start);
					for (var j = 0; j < node_count; j++) //-----middle vertices
					{
						var tmp_node = tmp_seg[j];
						if (tmp_node[2] > startMP && tmp_node[2] < endMP) {
							coordin.push(tmp_node);
						}
					}
					var loc_End = Strategy().searchMPLoc(seg_array, endMP, seg_count, precis); //-----end vertices
					coordin.push(loc_End);
					//console.log(coordin);

				}

				mulcoordin.push(coordin); //-----for MuiltLineString use only
			}
			// var ext_beg, ext_end, ext;
			if (seg_count === 1) { //-----if LineString
				geoJson = routeGeom;
				delete geoJson.bbox;
				geoJson.geometry.coordinates = coordin;
			} else { //-----else MuiltLineString
				geoJson = routeGeom;
				delete geoJson.bbox;
				geoJson.geometry.coordinates = mulcoordin;
			}
			//console.log(geoJson);
		} else {
			console.log('Please enter vaild number');
		}
		if (geoJson) {
			// this.layerBbox = geoJson.bbox;
			this.rotateGeojson = geoJson; //---for map rotate use
			return new ol.layer.Vector({
				title: 'bufferViewLayer',
				visible: true,
				source: new ol.source.Vector({
					features: (new ol.format.GeoJSON()).readFeatures(geoJson)
				})
			});
		}
	};
	LB.Map.prototype.setCursorLayer = function() {
		var cursorIcon = this.serInfo.Cursor;
		this.cursorLayer = new ol.layer.Vector({
			// title: 'Route',
			visible: true,
			source: new ol.source.Vector({
				features: [new ol.Feature({
					geometry: new ol.geom.Point([])
				})]
			}),
			style: new ol.style.Style({
				image: new ol.style.Icon({
					// anchor: [0.5, 46],
					// anchorXUnits: 'fraction',
					// anchorYUnits: 'pixels',
					// opacity: 0.75,
					src: '../styles/css/images/' + cursorIcon
				})
			})
		});
	};
	LB.Map.prototype.setCursorLayerOnTop = function() {
		if (this.cursorLayer) {
			//---make sure cursor layer is on the tp
			this.map.removeLayer(this.cursorLayer);
			//---cursor layer must the last layer to add that cursor could on the top of all layers
			this.map.addLayer(this.cursorLayer);
		}
	};
	LB.Map.prototype.setMapFeatureLoc = function(selectCol){
		// console.log('success');
		var self = this;
		var currentFeature;
		for (var i = 0; i < self.currentRouteData.features.length; i++) {
			if (self.currentRouteData.features[i].properties[selectCol['idCol']] === selectCol.idValue) {
				var currentFeature = self.currentRouteData.features[i];
				break;
			}
		}
		
		var routeGeom = this.CurrentRouteGeom;
		var seg_count = Strategy().getSegmentCount(routeGeom);
		var routeMetaData = Lrs().getLrsMetaData();
		var measure_precis = routeMetaData['Measure_Precision']; // for example, keep decimal places in three digits
		var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;
		var seg_array;
		if (seg_count === 1) { //if LineString
			seg_array = [routeGeom.geometry.coordinates];
		} else { //esle MuiltLineString
			seg_array = routeGeom.geometry.coordinates;
		}
		console.log(self.currentRouteData);
		// debugger;
		if (selectCol.fromValue === selectCol.endValue) {//---point
			var mileMeasure  = selectCol.fromValue;
			var Coordinate = Strategy().searchMPLoc(seg_array, mileMeasure, seg_count, precis);
			// debugger;
			// console.log(this.selectSingleClick.getFeatures());
			var feature = this.selectSingleClick.getFeatures();
			var geometry = feature.a[0].getGeometry();
			geometry.setCoordinates(Coordinate.slice(0, -1));
		} else {//---line
			var newStart = selectCol.fromValue;
			var newEnd = selectCol.endValue;
			var newStartCoordinate = Strategy().searchMPLoc(seg_array, newStart, seg_count, precis);
			var newEndCoordinate = Strategy().searchMPLoc(seg_array, newEnd, seg_count, precis);

			if (self.modifyLayer) {
				self.map.removeLayer(self.modifyLayer);
			}
			//---redraw modify layer base on new data
			var lineGeojson = self.drawModifiedLine(self.CurrentRouteSegment, currentFeature.properties, newStart, newEnd);
			self.modifyLayer = self.setModifyLayer(lineGeojson);
			self.map.addLayer(self.modifyLayer);
			//---redraw temp layer for line modify base on new data
			if (self.tempLayer) {
				self.map.removeLayer(self.tempLayer);
			}
			var newTempGeojson = Lrs().setTempModifyPointMetaData(newStartCoordinate, newEndCoordinate, currentFeature.properties);
			self.tempLayer = self.setTempLayer(newTempGeojson);
			self.map.addLayer(self.tempLayer);
			// debugger;

			self.selectSingleClick.getFeatures().clear();
			//---get new selected feature and push to collection highlight it
			var features = self.tempLayer.getSource().getFeatures();
			self.selectSingleClick.getFeatures().push(features[0]);
		}
		
	};
	LB.Map.prototype.setCursorLoc = function(milePoint) {
		var routeGeom = this.CurrentRouteGeom;
		var seg_count = Strategy().getSegmentCount(routeGeom);
		var routeMetaData = Lrs().getLrsMetaData();
		var measure_precis = routeMetaData['Measure_Precision']; // for example, keep decimal places in three digits
		var precis = parseInt(measure_precis) > 0 ? parseInt(measure_precis) : 3;
		var seg_array;
		if (seg_count === 1) { //if LineString
			seg_array = [routeGeom.geometry.coordinates];
		} else { //esle MuiltLineString
			seg_array = routeGeom.geometry.coordinates;
		}
		var Coordinate = Strategy().searchMPLoc(seg_array, milePoint, seg_count, precis);
		var cursor = this.cursorLayer;
		var source = cursor.getSource();
		var feature = source.getFeatures();
		var geometry = feature[0].getGeometry();
		geometry.setCoordinates(Coordinate.slice(0, -1));
	};
	LB.Map.prototype.setControls = function() {
		var control = new ol.control.defaults({
			attribution: false,
			rotateOptions: ({
					autoHide: false
				})
				// attributionOptions: ({
				//     collapsible: true
				// })
		}).extend([
			new ol.control.FullScreen({
				label: '\u2922'
			})
		]);
		this.controls = control;
	};
	LB.Map.prototype.setProExt = function() {
		var projection = new ol.proj.Projection({
			code: 'EPSG:26912',
			extent: [196765.3486, 2749459.8086, 803234.6514, 8799482.7282]
		});
		var extent = [94689.91512691721, 4066802.5045000003, 807838.104873083, 4681513.205499999];
		this.projection = projection;
		this.extent = extent;
	};
	LB.Map.prototype.setView = function() {
		var view = new ol.View({
			// center: [-12500148, 4869099],
			projection: this.projection,
			extent: this.extent,
			enableRotation: true,
			// rotation: -Math.PI / 2,
			maxZoom: 20
		});
		this.view = view;
	};
	LB.Map.prototype.setViewPosition = function() {
		var ext = this.basemaps[0].initialExtent;
		this.map.getView().fit([ext.xmin, ext.ymin, ext.xmax, ext.ymax], this.map.getSize());
	};
	LB.Map.prototype.getMapRotateAngleRad = function(geojson) {
		var line = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: (new ol.format.GeoJSON()).readFeatures(geojson)
			})
		});
		var bbox = line.getSource().getExtent(); //current geojson's bbox
		var bboxViewPort;
		var bboxRatioMap = Strategy().getMapBbox().mapWidth / Strategy().getMapBbox().mapHeight; //current map view port's bbox x/y
		var bboxRatioCurrent = (bbox[0] - bbox[2]) / (bbox[1] - bbox[3]); //Current geojson's bbox x/y
		var radPerRot, radPeak; // radian per rotation, the best radian that make x/y max/min
		var rad = 128;
		var bboxRatioRotate = Strategy().getRotBboxRatio(geojson, Math.PI / rad); // get a test bbox ratio by rotating pi/rad
		if (bboxRatioMap > 1) { // the bbox of the view port is fat rather than tall
			if (bboxRatioRotate > bboxRatioCurrent) { // if the route bbox x/y gets larger after the test rotation, keep clock-wise rotating
				radPerRot = Math.PI / rad;
				while (Strategy().getRotBboxRatio(geojson, Math.PI / rad + radPerRot) > bboxRatioRotate) {
					bboxRatioRotate = Strategy().getRotBboxRatio(geojson, Math.PI / rad + radPerRot);
					radPerRot += Math.PI / rad;
				}
				return radPerRot - Math.PI / rad;
			} else { // if the route bbox x/y gets smaller after the test rotation, do counter-clockwise rotating
				bboxRatioRotate = Strategy().getRotBboxRatio(geojson, -Math.PI / rad);
				radPerRot = -Math.PI / rad;
				while (Strategy().getRotBboxRatio(geojson, -Math.PI / rad + radPerRot) > bboxRatioRotate) {
					bboxRatioRotate = Strategy().getRotBboxRatio(geojson, -Math.PI / rad + radPerRot);
					radPerRot -= Math.PI / rad;
				}
				return radPerRot + Math.PI / rad;
			}
		} else { // the bbox of the view port is tall rather than fat
			if (bboxRatioRotate < bboxRatioCurrent) { // if the route bbox x/y gets smaller after the test rotation, keep clock-wise rotating
				radPerRot = Math.PI / rad;
				while (Strategy().getRotBboxRatio(geojson, Math.PI / rad + radPerRot) < bboxRatioRotate) {
					bboxRatioRotate = Strategy().getRotBboxRatio(geojson, Math.PI / rad + radPerRot);
					radPerRot += Math.PI / rad;
				}
				return radPerRot - Math.PI / rad;
			} else { // if the route bbox x/y gets larger after the test rotation, do counter-clockwise rotating
				bboxRatioRotate = Strategy().getRotBboxRatio(geojson, Math.PI / rad);
				radPerRot = -Math.PI / rad;
				while (Strategy().getRotBboxRatio(geojson, -Math.PI / rad + radPerRot) < bboxRatioRotate) {
					bboxRatioRotate = Strategy().getRotBboxRatio(geojson, -Math.PI / rad + radPerRot);
					radPerRot -= Math.PI / rad;
				}
				return radPerRot + Math.PI / rad;
			}
		}
	};
	LB.Map.prototype.rotateAngleRad = function(radian) {
		var Map = this.map;
		if (radian || radian === 0) {
			Map.getView().setRotation(radian);
			// console.log(radian);
		} else {
			console.log('No Rotation Is Applied');
		}
	};
	LB.Map.prototype.resetMap = function() {
		this.selectSingleClick.getFeatures().clear();
		if (this.tempLayer) { //---tempLayer is the point for line layer to modify
			this.map.removeLayer(this.tempLayer);
		}
		if (this.modifyLayer) {
			this.map.removeLayer(this.modifyLayer);
		}
		if (this.cursorLayer) {
			this.map.removeLayer(this.cursorLayer);
		}
		this.rotateAngleRad(0);
		this.setViewPosition();
	};
	LB.Map.prototype.build = function(feaClasses, symbolSeqs) {
		var self = this;
		var map = new ol.Map({
			target: this.target,
			layers: this.layers,
			controls: this.controls,
			view: this.view
		});
		this.map = map;

		console.log(this.layers);
		var layerSwitcher = new ol.control.LayerSwitcher({
			tipLabel: 'Legend' // Optional label for button
		});
		var layerFeatureID = null;
		var currentLayerMetaData = symbolSeqs.getCurrentLayerMetaData(feaClasses);
		if (feaClasses) {
			layerFeatureID = currentLayerMetaData.idCol;
		}
		this.currentLayerFeatureIDCol = layerFeatureID;

		//---# For map pan/zoom cal new route from/to use
		this.map.getView().on('change:center', function(e){
			//---user pan/zoom and get current map extent
			var currentMapExtent = e.g.calculateExtent(map.getSize(self.map.getSize()));
			//---creat current map extent geojson for interest use
			var geojsonObject = {
				'type': 'Feature',
				'geometry': {
					'type': 'Polygon',
					'coordinates': [[[currentMapExtent[0], currentMapExtent[1]],
									 [currentMapExtent[2], currentMapExtent[1]],
									 [currentMapExtent[2], currentMapExtent[3]],
									 [currentMapExtent[0], currentMapExtent[3]],
									 [currentMapExtent[0], currentMapExtent[1]]]]
				}
			};
			//---use OL to read geojson for interest use
			var format = new ol.format.GeoJSON();
			var features = format.readFeatures(geojsonObject);
			//---use third lib jsts for interestion
			var parser = new jsts.io.OL3Parser();
			//---if user picked a route already
			if (self.contrastLayer) {
				//---convert the map extent geometry to JSTS geom
				var extentGeom = parser.read(features[0].getGeometry());
				//---get current route geom and convert it to JSTS geom
				var currentRouteGeom = parser.read(self.contrastLayer.getSource().getFeatures()[0].getGeometry());
				//---intersect and get the new geom
				var intersection = extentGeom.intersection(currentRouteGeom);
				//---convert back from JSTS and get coordinate
				var newRouteCoordinate = parser.write(intersection).u;
				var newStartCoordinate = [newRouteCoordinate[0], newRouteCoordinate[1]];
				var newEndCoordinate = [newRouteCoordinate[newRouteCoordinate.length-2], newRouteCoordinate[newRouteCoordinate.length-1]];
				//---check if route out of current map viewport
				if (self.contrastLayer.getSource().getClosestFeatureToCoordinate(newStartCoordinate)) {
					//---cal new start/end in current map view after pan/zoom
					var StartMilePoint = self.contrastLayer.getSource().getClosestFeatureToCoordinate(newStartCoordinate).getGeometry().getClosestPoint(newStartCoordinate)[2];
					var EndMilePoint = self.contrastLayer.getSource().getClosestFeatureToCoordinate(newEndCoordinate).getGeometry().getClosestPoint(newEndCoordinate)[2];
					$(document).trigger('D3routeChange', {routeBegin: StartMilePoint, routeEnd: EndMilePoint, selected: self.currentSelectCol.value, source: 'map'});
				} else {
					//---show error message
					toastr["warning"]("Selected Route is out of current map viewport!")
				}
			}
		})
		this.selectSingleClick = new ol.interaction.Select({
			// style: Lrs().styleFunction(feature, resolution),
			style: function(feature, resolution) {
				var styles = [],
					geometry_type = feature.getGeometry().getType();
				styles['Point'] = [
					new ol.style.Style({
						image: new ol.style.Circle({
							fill: new ol.style.Fill({
								color: 'rgb(255,165,0)'
							}),
							stroke: new ol.style.Stroke({
								width: 1,
								color: 'rgb(255,165,0)'
							}),
							radius: 5
						})
					})
				];
				styles['MultiPoint'] = styles['Point'];
				styles['LineString'] = [
					new ol.style.Style({
						stroke: new ol.style.Stroke({
							color: 'rgb(255,165,0)',
							width: 3
						})
					})
				];
				return styles[geometry_type];
			},
			layers: function(layer) {
				console.log(layer.B.title);
				if (layer.B.title === 'Route' || layer.B.title === undefined) {
					return false; //---let Route and Curesor layer not selectable
				} else {
					return true; //---only allow Eventpoint and WFS layers selectable
				}
			},
			toggleCondition: ol.events.condition.never //---disable multi-select
		});
		//---# For user select map feature use
		this.selectSingleClick.on('select', function(e) {
			console.log(e);
			console.log(Number(self.previousRouteID));
			if (e.selected[0]) {
				if (e.selected[0].B.bbox && (e.selected[0].B.ROUTE_DIR_ID !== Number(self.previousRouteID))) { // A WFS route feature selected and selected route should be different than previous selected route
					//---clear previous highlight feature firest
					self.selectSingleClick.getFeatures().clear();
					var routeid = e.selected[0].B.ROUTE_DIR_ID;
					var routeSegment = new LB.RouteSegment;
					var closestPoint = e.selected[0].B.geometry.getClosestPoint(e.mapBrowserEvent.coordinate); //point on the slcted route that is closest to the click point
					// debugger;
					routeSegment.setRouteSegGeom(routeid).then(function(result) {
						console.log('ajax success');
						var routeGeom = result.routeGeom;
						var routeJson = JSON.parse(routeGeom.data_str);
						var clickPoint = Strategy().getMpFromXY(routeJson, closestPoint);
						console.log(clickPoint);
						var routeData = {
							routeID: routeid,
							fromPoint: parseFloat(clickPoint.toFixed(3)) - 0.5,
							toPoint: parseFloat(clickPoint.toFixed(3)) + 0.5
						};
						// debugger;
						$(document).trigger('updateRouteData', routeData);
						console.log(routeData);
					});
				} else if (e.selected[0].B[self.currentLayerFeatureIDCol]) { // event feature on map is selected
					// debugger;
					console.log(e.selected[0].B[self.currentLayerFeatureIDCol]);
					self.selectedFeature = {
						layer: 'Culverts' + Math.random().toString(36).substring(2),
						symbolColumn: 'MATERIAL',
						data: e.selected[0].B[self.currentLayerFeatureIDCol],
						layerFeatureID: self.currentLayerFeatureIDCol
					};
					console.log('feature selected');
					// debugger;
					$(document).trigger('onMapClicked', self.selectedFeature);
					if (self.tempLayer) {
						self.selectSingleClick.getFeatures().clear();
						// debugger;
						self.highLightFeature();
					}
					// debugger;
				} else if (e.selected[0].B.bbox && (e.selected[0].B.ROUTE_DIR_ID === Number(self.previousRouteID))) {
					//---if selceted same route on WFS layer, dont hightlight it
					self.selectSingleClick.getFeatures().clear();
				}
			}
		});
		map.addInteraction(this.selectSingleClick);
		
		//---# For user modify map featuer use
		this.modify = new ol.interaction.Modify({
			style: function(feature, resolution) {
				var styles = [],
					geometry_type = feature.getGeometry().getType();
				styles['Point'] = [
					new ol.style.Style({
						image: new ol.style.Circle({
							fill: new ol.style.Fill({
								color: 'rgb(255,165,0)'
							}),
							stroke: new ol.style.Stroke({
								width: 1,
								color: 'rgb(255,165,0)'
							}),
							radius: 5
						})
					})
				];
				styles['MultiPoint'] = styles['Point'];
				styles['LineString'] = [
					new ol.style.Style({
						stroke: new ol.style.Stroke({
							color: 'rgb(255,165,0)',
							width: 3
						})
					})
				];
				return styles[geometry_type];
			},
			features: self.selectSingleClick.getFeatures()
		});
		this.modify.on('modifyend', function(e) {
			// console.log(self.modifiedFeatures);
			console.log(e);
			console.log('feature modified');
			console.log(self.contrastLayer);
			//---creat obj to store modified data
			var modifiedFeature = {
				idCol: self.currentLayerFeatureIDCol,
				value: e.features.a[0].B[self.currentLayerFeatureIDCol],
				start: 0,
				end: 0,
				source:"map"
			};
			// debugger;
			console.log(modifiedFeature);
			//---coordina when relase mouse
			var mouseCoordina = e.mapBrowserPointerEvent.coordinate;
			//---use obj.assign to clone a obj that delete will not effect orginal obj
			var property = Object.assign({}, e.features.a[0].B);
			delete property.geometry;
			//---use contrastLayer as target layer to get closest feature and get new coordina on route seg
			var newCoordina = self.contrastLayer.getSource().getClosestFeatureToCoordinate(mouseCoordina).getGeometry().getClosestPoint(mouseCoordina);
			var newGeometry = {};
			if (e.features.a[0].B.geometry.u.length > 3) { //---line
				var milePost = newCoordina[2];
				// var from, to;
				var fromCoordinates, toCoordinates;
				if (e.features.a[0].B.geometry.u[2] === 0) { //---user modified Start point
					newGeometry.newFrom = milePost;
					newGeometry.newTo = e.features.a[0].B.geometry.u[5];
					fromCoordinates = newCoordina;
					toCoordinates = [e.features.a[0].B.geometry.u[3], e.features.a[0].B.geometry.u[4], e.features.a[0].B.geometry.u[5]];
				} else { //---user modified End point
					newGeometry.newFrom = e.features.a[0].B.geometry.u[2];
					newGeometry.newTo = milePost;
					fromCoordinates = [e.features.a[0].B.geometry.u[0], e.features.a[0].B.geometry.u[1], e.features.a[0].B.geometry.u[2]];
					toCoordinates = newCoordina;
				}
				// debugger;
				console.log(newGeometry);
				if (self.modifyLayer) {
					map.removeLayer(self.modifyLayer);
				}
				//---redraw modify layer base on new data
				var lineGeojson = self.drawModifiedLine(self.CurrentRouteSegment, property, newGeometry.newFrom, newGeometry.newTo);
				self.modifyLayer = self.setModifyLayer(lineGeojson);
				map.addLayer(self.modifyLayer);
				//---redraw temp layer for line modify base on new data
				if (self.tempLayer) {
					map.removeLayer(self.tempLayer);
				}
				var newTempGeojson = Lrs().setTempModifyPointMetaData(fromCoordinates, toCoordinates, property);
				self.tempLayer = self.setTempLayer(newTempGeojson);
				map.addLayer(self.tempLayer);
				// debugger;

				self.selectSingleClick.getFeatures().clear();
				//---get new selected feature and push to collection highlight it
				var features = self.tempLayer.getSource().getFeatures();
				self.selectSingleClick.getFeatures().push(features[0]);
				//---trigger event
				modifiedFeature.start = newGeometry.newFrom;
				modifiedFeature.end = newGeometry.newTo;
				console.log(modifiedFeature);
				$(document).trigger('dragPosition', modifiedFeature);

			} else { //---point
				newGeometry = newCoordina;
				//---set new coordina to modified point that snap back to route seg
				e.features.a[0].getGeometry().setCoordinates(newGeometry);
				//---trigger event
				modifiedFeature.start = newCoordina[2];
				modifiedFeature.end = newCoordina[2];
				console.log(modifiedFeature);
				$(document).trigger('dragPosition', modifiedFeature);
			}
			self.setCursorLayerOnTop();
		});
		map.addInteraction(this.modify);
		this.modify.setActive(true); //---defult disable modify

		map.addControl(layerSwitcher);
		this.setCursorLayer();
		//---cursor layer must the last layer to add that cursor could on the top of all layers
		map.addLayer(this.cursorLayer);
	};
	LB.Map.prototype.setModifyActive = function(active) {
		this.modify.setActive(active);
	}
	LB.Map.prototype.highLightFeature = function(selectedCol) {
		//---clear previous selected featuer
		this.selectSingleClick.getFeatures().clear();
		// debugger;
		if (this.tempLayer) { //---line
			//---get new selected feature and push to collection
			var features = this.tempLayer.getSource().getFeatures();
			this.selectSingleClick.getFeatures().push(features[0]);
		} else { //---point
			//---get new selected feature and push to collection
			var layerSource = this.modifyLayer.getSource();
			var features = layerSource.getFeatures();
			var featureIndex = _.findIndex(features, function(o) {
				return o.B[selectedCol.idCol] === selectedCol.value;
			});
			this.selectSingleClick.getFeatures().push(features[featureIndex]);
		}
	};
	LB.Map.prototype.initMap = function(rootUrl, customerID, feaClasses, symbSqs) {
		Strategy().getMapBbox();
		// console.log(routeSegment);
		console.log(feaClasses);
		console.log(symbSqs);
		// debugger;
		this.getMapInfo(rootUrl, customerID).then(function(mapInfo) {
			this.buildBasemapObj();
			this.setBasemap();
			if (feaClasses.lrsFeatureClasses.length) {
				this.getEventInfo(feaClasses, symbSqs);
			}
			this.setControls();
			this.setProExt();
			this.setView();
			this.build(feaClasses, symbSqs);
			this.setViewPosition();
		});
	};
	LB.Map.prototype.updateMap = function(feaClasses, symbSqs) {
		//---clear previous selected featuer
		this.selectSingleClick.getFeatures().clear();
		//---update featureIDCol for selected feature use
		var layerFeatureID = null;
		var currentLayerMetaData = symbSqs.getCurrentLayerMetaData(feaClasses);
		if (feaClasses) {
			layerFeatureID = currentLayerMetaData.idCol;
		}
		this.currentLayerFeatureIDCol = layerFeatureID;
		var Map = this.map;
		console.log(feaClasses);
		console.log(symbSqs);
		this.setViewPosition();
		// debugger;
		//---reset map rotation
		Map.getView().setRotation(0);
		//---remove previous layer
		if (this.modifyLayer) { 
			Map.removeLayer(this.modifyLayer);
		}
		if (this.tempLayer) {
			Map.removeLayer(this.tempLayer);
			this.tempLayer = null;
		}
		this.setViewPosition();
		if (feaClasses) { //---if user pick a layer
			// debugger;
			console.log(symbSqs);
			this.getEventInfo(feaClasses, symbSqs);
		}
		this.setCursorLayerOnTop();
	};
	/*------------------------------*/
})(window);