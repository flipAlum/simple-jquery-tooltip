(function($) {
    $.fn.toolTip = function(options) {
        options = $.extend({
            // show hide with a fade effect
            fade: true,
            // time before the tooltip appears
            delay: 1000,
            // custom tooltip content ignores the title attr value
            hoverContent: "",
            // class to add to the tooltip
            elementClass: "ui-tooltip",
            // wrapper template for tooltip
            template: "",
            // filter out unwanted elems which have a title attr
            filter: null,
            // speed of the fade effect
            fadeSpeed: "fast",
            // length of a string before it is broken for IE
            lineLength: 38
        }, options || {});


        var target = "",
            toolTip = null,
            delayToolTip = null,
            toolTipInDom = false
            pointerWidth = 18,
            pointerHeight = 15,
            targetSet = "*[title]:not(" + options.filter + ")",
            mouseOutTarget = "",
			toolTipContent = null,
            title = "";

        // if browser doesn't support opacity we are going to disable fadein
        !$.support.opacity ? options.fade = false : null;

        // define html structure for differant types of tooltip
        if (options.template !== "") {
				toolTip = $(options.template);
			} else {
				toolTip = $("<div class='tooltip-wrapper default'><span id='tooltip-content' class='tooltip-inner-content'></span></div>");
			}

        // cache the tooltip content elem
        toolTipContent = $(toolTip).find("#tooltip-content");

        // mouse enters trigger, tooltip is created, positioned and shown after delay
        // mouseover event deligation
        $(this).live("mouseover.tooltip", function(event) {

            var eTarget = event.target;

            // cache the target elem if it is in the targetset (has a title attr)
            var $target = $(eTarget).closest(targetSet);

            // set target var only if it has a title attribute
            if ($target.length > 0 && (eTarget.title || $target.attr("title"))) {
                title = eTarget.title || $target.attr("title");
                target = $target;
                showTip();

            }
        });

        // mouseout event
        $(this).live("mouseout.tooltip", function(event) {
            killToolTip(event);
        });

        // this function positions the tooltip relative to the target element    
        function positionTip() {

            // get initial positioning values
            var targetWidth = target.outerWidth(),
                targetHeight = target.outerHeight(),
                offsetTop = target.offset().top,
                offsetLeft = target.offset().left,
                actualWidth = toolTip.outerWidth(),
                actualHeight = toolTip.outerHeight(),
                screenWidth = $(document).width(),
				edgeCollision = false,
                topBottomCollision = false;

            // call the correct positioning function                     
            switch (options.type) {
                case "rounded":
                    roundedPosition();
                    break;
                default:
                    defaultPosition();
            }

            // default positioning function
            function defaultPosition() {
                var leftOffset = offsetLeft + targetWidth / 2 - actualWidth / 2, topOffset = offsetTop - actualHeight;

                // test for edge collision
                if (offsetLeft + targetWidth / 2 < actualWidth / 2) {
                    // left collision
                    leftOffset = offsetLeft;
                } else if (offsetLeft + targetWidth / 2 + actualWidth / 2 > screenWidth) {
                    // right collision
                    leftOffset = offsetLeft - actualWidth + (targetWidth / 2);
                }

                // test for top bottom collision
                if (offsetTop < (actualHeight)) {
                    // top collision
                    topOffset = offsetTop + targetHeight;
                }

                toolTip.css({
                    "top": topOffset,
                    "left": leftOffset
                });

            }

        };

        // function to show the tooltip
        function showTip() {

            target.attr("title", "");

            // timeout to delay the tooltip from showing
            delayToolTip = setTimeout(function() {

                // set the hover content if there is none specified
                if (options.hoverContent === "") {
                    if (title) {
                        
						toolTipContent.html(title);                            

                        // store the original title attribute and remove the title attr from the target
                        toolTip.data("title", title);
                    }
                    else {
                        return false
                    }

                } else {
                    toolTipContent.html(options.hoverContent);
                }

                // set data for shown tooltip state
                toolTip.data("tipActive", true);
                target.data("currentTip", true);

                // if the tooltip container is not in the dom yet insert it
                if (!toolTipInDom) {
                    toolTip
                    .addClass(options.elementClass)
                    .css({
                        "position": "absolute",
                        "z-index": 2147483647
                    })
                    .appendTo("body");
                } else {
                    toolTipInDom = true;
                }

                // position the tooltip on the page
                positionTip();

                // determine if we need to fade in the tooltip
                if (options.fade) {
                    toolTip.stop().css({
                        "visibility": "visible",
                        "display": "none"
                    }).fadeIn(options.fadeSpeed);
                }
                // if we arn"t fading just show it
                else {
                    toolTip.css({
                        "visibility": "visible"
                    });
                }

                // bind a single click event to the target to hide the tip
                target.one("click.tooltip", function(event) {

                    killToolTip(event);

                });

            }, options.delay);

        };

        // hide tooltip or clear timeout
        function killToolTip(event) {
            // when the mouse leaves the trigger the timeout is canceled or the element is hidden
            if (toolTip.data("tipActive")) {
                var eTarget = event.target;

                if (!eTarget.title && $(eTarget).data("currentTip")) {
                    if (event.type != "click") {
                        eTarget.title = toolTip.data("title");
                    } else {
                        hideToolTip();
                        return
                    }
                }

                toolTip.removeData("tipActive").removeData("title").stop();
                target.removeData("currentTip");

                hideToolTip();

                // unbind the click event
                target.unbind("click.tooltip");

            } else {

                // replace title attribute if it existed and was removed
                if (target && target.attr("title") === "") {
                    target.attr("title", title);
                }

                clearTimeout(delayToolTip);
            }
        };

        function hideToolTip() {
            // reset styles      
            toolTip.css({
                "visibility": "hidden",
                "z-index": "0",
                "width": "",
                "opacity": "",
                "left": "-999px",
                "display": ""
            });
        }

    };
})(jQuery);