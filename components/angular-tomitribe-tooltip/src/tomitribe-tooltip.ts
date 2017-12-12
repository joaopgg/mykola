/**
 * @ngdoc directive
 * @name tomitribe-tooltip.directive:tribeTooltip
 * @function
 *
 * @restrict 'A'
 *
 * @description
 * Create a tooltip
 *
 * @param {string}      tribeTooltip            Tooltip text
 * @param {string=}     tribeTooltipPosition    Tooltip box direction
 *
 * @example

 */

module tomitribe_fab {
    require('./tomitribe-tooltip.scss');
    angular
        .module('tomitribe-tooltip', [])
        .directive('tribeTooltip', tribeTooltip);

    function tribeTooltip()
    {
        return {
            restrict: 'A',
            scope:
            {
                tooltip: '@tribeTooltip',
                position: '@?tribeTooltipPosition',
                showDelay: '=?tribeTooltipShowDelay'
            },
            link: link,
            controller: ['$element', '$scope', '$timeout', tribeTooltipController], //'tribeDepthService',
            controllerAs: 'tribeTooltip',
            bindToController: true
        };

        function link(scope, element, attrs, ctrl)
        {
            if (angular.isDefined(attrs.tribeTooltip))
            {
                attrs.$observe('tribeTooltip', function(newValue)
                {
                    ctrl.updateTooltipText(newValue);
                    //The text length my change so we need to recalculate the tooltip position.
                    ctrl.calcTooltipPosition();
                });
            }

            if (angular.isDefined(attrs.tribeTooltipPosition))
            {
                attrs.$observe('tribeTooltipPosition', function(newValue)
                {
                    scope.tribeTooltip.position = newValue;
                });
            }

            scope.showDelay = angular.isDefined(attrs.tribeTooltipShowDelay) ? attrs.tribeTooltipShowDelay : 0;

            element.on('mouseenter', ctrl.showTooltip);
            element.on('mouseleave', ctrl.hideTooltip);

            scope.$on('$destroy', function()
            {
                element.off();
            });
        }
    }

    function tribeTooltipController($element, $scope, $timeout) //, tribeDepthService
    {
        var tribeTooltip = this;
        var timer1;
        var timer2;
        var timer3;
        var tooltip;
        var tooltipBackground;
        var tooltipLabel;

        tribeTooltip.hideTooltip = hideTooltip;
        tribeTooltip.showTooltip = showTooltip;
        tribeTooltip.updateTooltipText = updateTooltipText;
        tribeTooltip.calcTooltipPosition = calcTooltipPosition;


        tribeTooltip.position = angular.isDefined(tribeTooltip.position) ? tribeTooltip.position : 'top middle';

        $scope.$on('$destroy', function()
        {
            if (angular.isDefined(tooltip))
            {
                tooltip.remove();
                tooltip = undefined;
            }

            $timeout.cancel(timer1);
            cancelShowTooltipTimers();
        });

        function cancelShowTooltipTimers() {
            $timeout.cancel(timer2);
            $timeout.cancel(timer3);
        }

        function hideTooltip()
        {
            cancelShowTooltipTimers();

            if (angular.isDefined(tooltip))
            {
                tooltip.removeClass('tooltip-is-active');

                timer1 = $timeout(function()
                {
                    if (angular.isDefined(tooltip))
                    {
                        tooltip.remove();
                        tooltip = undefined;
                    }
                }, 200);
            }
        }

        function calcTooltipPosition() {
            if (!angular.isDefined(tribeTooltip) || !angular.isDefined(tooltip)) return;

            let positions = tribeTooltip.position.split(' ');

            if(positions.length === 1) {
                positions.push("middle");
            }

            var width = $element.outerWidth(),
                height = $element.outerHeight(),
                top = $element.offset().top,
                left = $element.offset().left;

            let options = {
                left: left - (tooltip.outerWidth() / 2) + (width / 2),
                top: top + (height / 2) - (tooltip.outerHeight() / 2)
            };

            if (positions.indexOf('top') > -1 || positions.indexOf('bottom') > -1) {
                options.top = positions.indexOf('top') > -1 ? top - tooltip.outerHeight() : top + height
            }
            if (positions.indexOf('left') > -1 || positions.indexOf('right') > -1) {
                if (positions.indexOf('top') > -1 || positions.indexOf('bottom') > -1) {
                    options.left = positions.indexOf('left') > -1 ? left - width : left;
                } else {
                    options.left = positions.indexOf('left') > -1 ? left - tooltip.outerWidth() : left + width
                }
            }

            tooltip.css(options);
        }

        function setTooltipPosition()
        {
            tooltip
                .append(tooltipBackground)
                .append(tooltipLabel)
                .appendTo('body');

            calcTooltipPosition();
        }

        function showTooltip()
        {
            timer3 = $timeout(() => {
                if (angular.isUndefined(tooltip))
                {
                    //tribeDepthService.register();

                    tooltip = angular.element('<div/>',
                        {
                            class: 'tooltip tooltip-' + tribeTooltip.position.split(' ')[0]
                        });

                    tooltipLabel = angular.element('<span/>',
                        {
                            class: 'tooltip__label',
                            text: tribeTooltip.tooltip
                        });

                    setTooltipPosition();

                    timer2 = $timeout(function()
                    {
                        tooltip.addClass('tooltip-is-active');
                    });
                }
            }, $scope.showDelay)
        }

        function updateTooltipText(_newValue)
        {
            if (angular.isDefined(tooltipLabel))
            {
                tooltipLabel.text(_newValue);
            }
        }
    }
}
