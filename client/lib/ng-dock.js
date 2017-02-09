angular.module('ngDock', [])
  .factory('dock', function() {
    var valids = ['left', 'right', 'top', 'bottom', 'fill'];
    return {
      dockRefs: {},
      valids: valids,
      handlesByDock: {
        "top": "s",
        "left": "e",
        "right": "w",
        "bottom": "n"
      },
      Area: (function() {
        function setPosition(r, s, pos) {
          r.position = 'absolute';
          if (pos != "bottom") r.top = s.top;
          else {
            r.top = 'auto';
          }
          if (pos != "left") r.right = s.right;
          else {
            r.right = 'auto';
          }
          if (pos != "right") r.left = s.left;
          else {
            r.left = 'auto';
          }
          if (pos != "top") r.bottom = s.bottom;
          else {
            r.bottom = 'auto';
          }
        }

        function decreaseSize($element, pos, s) {
          if ("top|bottom".indexOf(pos) != -1) size = $element.outerHeight(true);
          if ("left|right".indexOf(pos) != -1) size = $element.outerWidth(true);
          if (pos == "bottom") s.bottom += size;
          if (pos == "left") s.left += size;
          if (pos == "right") s.right += size;
          if (pos == "top") s.top += size;
        }

        function removeClasses($element) {
          var x = valids.length;
          while (x--)
            $element.removeClass("dock-" + valids[x]);
        }

        function update($element, pos, s) {
          var r = {};
          removeClasses($element);
          setPosition(r, s, pos);
          $element.addClass("dock-" + pos);
          $element.css(r);
          decreaseSize($element, pos, s);
        }
        var Area = function($div, $scope) {
          var s = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          };
          var childList = [];
          this.addChild = function($element, $pos) {
            var pos = $scope.$eval($pos);

            if (valids.indexOf(pos) == -1)
              throw {
                message: "dock position must be one of this: " + valids.join(', ')
              };
            childList.push({
              element: $element,
              pos: $pos,
              order: childList.length
            });
            update($element, pos, s);
          };
          this.refresh = function() {
            s.top = 0;
            s.bottom = 0;
            s.left = 0;
            s.right = 0;
            for (var x = 0; x < childList.length; x++) {
              var pos = $scope.$eval(childList[x].pos);
              update(childList[x].element, pos, s);
            }
          };

          var _this = this;
          $(window).resize(function() {
            _this.refresh();
          });
          $scope.$watch(function() {
            _this.refresh();
          });
        };
        return Area;
      })()
    };
  })
  .directive('dockRef', function(dock) {
    return {
      restrict: "A",
      controller: function($scope, $element) {
        $scope.__dock_ref_id = String(Math.random()).replace(/\./g, "");
        dock.dockRefs[$scope.__dock_ref_id] = new dock.Area($element, $scope);
      },
      scope: true
    };
  })
  .directive('dock', function(dock) {
    return {
      restrict: "A",
      controller: function($scope, $element) {
        var dp = $element.attr('dock');
        $scope.__dock_id = String(Math.random()).replace(/\./g, "");
        var area = dock.dockRefs[$scope.$parent.__dock_ref_id];
        area.addChild($element, dp);
      },
      scope: true
    };
  })
  .directive("dockResizable", function(dock) {
    function enableResize($element, dp) {
      $element.resizable({
        handles: dock.handlesByDock[dp]
      });
    }
    return {
      require: 'dock',
      restrict: "A",
      controller: function($scope, $element) {
        var dp = $scope.$eval($element.attr('dock'));
        if (dock.valids.indexOf(dp) >= 0 && dp != "fill") enableResize($element, dp);
        $scope.$watch(function() {
          var newdp = $scope.$eval($element.attr('dock'));
          if (newdp != dp) {
            if (dock.valids.indexOf(newdp) == -1)
              throw {
                message: "dock position must be one of this: " + valids.join(', ')
              };
            dp = newdp;
            $element.resizable('destroy');
            if (newdp != 'fill') enableResize($element, dp);
          }
        });
      }
    }
  })
  .directive("dockOnResize", function(dock) {
    return {
        link: function( scope, elem, attrs ) {
            console.log(elem[0].offsetWidth);
            scope.$watch( elem, function( newHeight, oldHeight ) {
                console.log(elem[0].offsetWidth);
            } );

            // angular.element(elem).bind('resize', function() {
            //   // scope.onResizeFunction();
            //   // scope.$apply();
            //   alert(123);
            // });
        }
    }
  })
  .directive('onSizeChanged', ['$window', function ($window) {
    return {
        restrict: 'A',
        scope: {
            onSizeChanged: '&'
        },
        link: function (scope, $element, attr) {
            var element = $element[0];

            cacheElementSize(scope, element);
            $window.addEventListener('resize', onWindowResize);

            function cacheElementSize(scope, element) {
                scope.cachedElementWidth = element.offsetWidth;
                scope.cachedElementHeight = element.offsetHeight;
            }

            function onWindowResize() {
                var isSizeChanged = scope.cachedElementWidth != element.offsetWidth || scope.cachedElementHeight != element.offsetHeight;
                if (isSizeChanged) {
                    var expression = scope.onSizeChanged();
                    expression();
                }
            };
        }
    }
}])


  //     // link: function(scope, elem, attrs) {
  //     //   console.log(elem);
  //     //   scope.$watch(function() {
  //     //       return elem.context.clientHeight;
  //     //     },
  //     //     function(newValue, oldValue) {
  //     //       if (newValue != oldValue) {
  //     //         // Do something ...
  //     //         console.log(newValue);
  //     //       }
  //     //     });
  //     // }
  // })
  //# sourceURL=http://plnkr.co/edit/ng-dock.js