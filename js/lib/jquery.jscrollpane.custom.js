/*!
 * jScrollPane - v2.0.0beta12 - 2012-09-27
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT or GPL licenses.
 *
 * modified by Collin Hover @ collinhover.com
 */
define( [
    'jquery',
    "TweenMax"
],
function( $ ){

	$.fn.jScrollPane = function(settings)
	{
		// JScrollPane "class" - public methods are available through $('selector').data('jsp')
		function JScrollPane(elem, s)
		{
			var settings,
				jsp = this,
				pane,
				paneWidth,
				paneHeight,
				container,
				contentWidth,
				contentHeight,
				contentWidthLast,
				contentHeightLast,
				percentInViewH,
				percentInViewV,
				isScrollableV,
				isScrollableH,
				verticalDrag,
				horizontalDrag,
				scrollPositionTargetX = { x: 0 },
                scrollPositionTargetY = { y: 0 },
				scrollPosition = { x: 0, y: 0 },
				scrollPositionLast = { x: 0, y: 0 },
				dragMax = { x: 0, y: 0 },
				contentPosition = { x: 0, y: 0 },
				contentPositionLast = { x: 0, y: 0 },
				suppressTriggers = false,
				triggers = [],
				verticalBar,
				verticalTrack,
				scrollbarWidth,
				verticalTrackHeight,
				verticalDragHeight,
				arrowUp,
				arrowDown,
				horizontalBar,
				horizontalTrack,
				horizontalTrackWidth,
				horizontalDragWidth,
				arrowLeft,
				arrowRight,
				reinitialiseInterval,
				originalPadding,
				originalPaddingTotalWidth,
				wasAtTop = true,
				wasAtLeft = true,
				wasAtBottom = false,
				wasAtRight = false,
				originalElement = elem.clone(false, false).empty(),
				mwEvent = $.fn.mwheelIntent ? 'mwheelIntent.jsp' : 'mousewheel.jsp';

			originalPadding = elem.css('paddingTop') + ' ' +
								elem.css('paddingRight') + ' ' +
								elem.css('paddingBottom') + ' ' +
								elem.css('paddingLeft');
			originalPaddingTotalWidth = (parseInt(elem.css('paddingLeft'), 10) || 0) +
										(parseInt(elem.css('paddingRight'), 10) || 0);

			function initialise(s) {

				var /*firstChild, lastChild, */isMaintainingPositon, contentPositionLastX, contentPositionLastY,
						hasContainingSpaceChanged, originalScrollTop, originalScrollLeft,
						maintainAtBottom = false, maintainAtRight = false;

				settings = s;
				
				if (pane === undefined) {
					originalScrollTop = elem.scrollTop();
					originalScrollLeft = elem.scrollLeft();

					elem.css(
						{
							overflow: 'hidden',
							padding: 0
						}
					);
					// TODO: Deal with where width/ height is 0 as it probably means the element is hidden and we should
					// come back to it later and check once it is unhidden...
					paneWidth = elem.innerWidth() + originalPaddingTotalWidth;
					paneHeight = elem.innerHeight();

					elem.width(paneWidth);
					
					pane = $('<div class="jspPane" />').css('padding', originalPadding).append(elem.children());
					container = $('<div class="jspContainer" />')
						.css({
							'width': paneWidth + 'px',
							'height': paneHeight + 'px'
						}
					).append(pane).appendTo(elem);

					/*
					// Move any margins from the first and last children up to the container so they can still
					// collapse with neighbouring elements as they would before jScrollPane 
					firstChild = pane.find(':first-child');
					lastChild = pane.find(':last-child');
					elem.css(
						{
							'margin-top': firstChild.css('margin-top'),
							'margin-bottom': lastChild.css('margin-bottom')
						}
					);
					firstChild.css('margin-top', 0);
					lastChild.css('margin-bottom', 0);
					*/
				}
				else {
					
					elem.css('width', '');

					maintainAtBottom = settings.stickToBottom && isCloseToBottom();
					maintainAtRight  = settings.stickToRight  && isCloseToRight();

					hasContainingSpaceChanged = elem.innerWidth() + originalPaddingTotalWidth != paneWidth || elem.outerHeight() != paneHeight;

					if (hasContainingSpaceChanged) {
						paneWidth = elem.innerWidth() + originalPaddingTotalWidth;
						paneHeight = elem.innerHeight();
						container.css({
							width: paneWidth + 'px',
							height: paneHeight + 'px'
						});
					}

					// If nothing changed since last check...
					if (!hasContainingSpaceChanged && contentWidthLast == contentWidth && pane.outerHeight() == contentHeight) {
						elem.width(paneWidth);
						return;
					}
					
					pane.css('width', '');
					elem.width(paneWidth);
					
					// remove bars on reinit always?
					//container.find('>.jspVerticalBar,>.jspHorizontalBar').remove();
					
				}
				
				suppressTriggers = true;
				
				contentWidthLast = contentWidth;
				contentHeightLast = contentHeight;
				
				pane.css('overflow', 'auto');
				if (s.contentWidth) {
					contentWidth = s.contentWidth;
				}
				else {
					contentWidth = pane[0].scrollWidth;
				}
				contentHeight = pane[0].scrollHeight;
				pane.css('overflow', '');

				percentInViewH = contentWidth / paneWidth;
				percentInViewV = contentHeight / paneHeight;
				isScrollableVLast = isScrollableV;
				isScrollableHLast = isScrollableH;
				isScrollableV = percentInViewV > 1;
				isScrollableH = percentInViewH > 1;
				
				//console.log(paneWidth, paneHeight, contentWidth, contentHeight, percentInViewH, percentInViewV, isScrollableH, isScrollableV);
				
				// remove bars only when not scrollable
				
				if ( isScrollableH !== true ) {
					
					container.find('>.jspHorizontalBar').remove();
					
				}
				if ( isScrollableV !== true ) {
					
					container.find('>.jspVerticalBar').remove();
					
				}
				
				if (!(isScrollableH || isScrollableV)) {
					
					// trigger one final reposition / scroll
					_positionDragX( scrollPosition.x, true );
					_positionDragY( scrollPosition.y, true );
					
					elem.removeClass('jspScrollable');
					pane.css({
						top: 0,
						width: container.width() - originalPaddingTotalWidth
					});
					
					removeMousewheel();
					removeFocusHandler();
					removeKeyboardNav();
					removeClickOnTrack();
					
				}
				else {
					
					elem.addClass('jspScrollable');
					
					isMaintainingPositon = settings.maintainPosition && (scrollPosition.y || scrollPosition.x);
					if (isMaintainingPositon) {
						contentPositionLastX = contentPosition.x;
						contentPositionLastY = contentPosition.y;
					}
					
					initialiseVerticalScroll();
					initialiseHorizontalScroll();
					resizeScrollbars();
					
					if (isMaintainingPositon) {
						//scrollToX(maintainAtRight  ? (contentWidth  - paneWidth ) : contentPositionLastX, 0 );
						//scrollToY(maintainAtBottom ? (contentHeight - paneHeight) : contentPositionLastY, 0 );
					}

					initFocusHandler();
					initMousewheel();
					initTouch();
					
					if (settings.enableKeyboardNavigation) {
						initKeyboardNav();
					}
					if (settings.clickOnTrack) {
						initClickOnTrack();
					}
					
					observeHash();
					if (settings.hijackInternalLinks) {
						hijackInternalLinks();
					}
					
				}

				if (settings.autoReinitialise && !reinitialiseInterval) {
					reinitialiseInterval = setInterval(
						function()
						{
							initialise(settings);
						},
						settings.autoReinitialiseDelay
					);
				} else if (!settings.autoReinitialise && reinitialiseInterval) {
					clearInterval(reinitialiseInterval);
				}
				
				//originalScrollTop && elem.scrollTop(0) && scrollToY(originalScrollTop, 0);
				//originalScrollLeft && elem.scrollLeft(0) && scrollToX(originalScrollLeft, 0);
				
				suppressTriggers = false;
				
				elem.trigger('jsp-initialised', [isScrollableH || isScrollableV]);
				
			}

			function initialiseVerticalScroll() {
				
				if (isScrollableV) {
					
					if ( isScrollableVLast !== true ) {
						
						container.append(
							$('<div class="jspVerticalBar" />').append(
								$('<div class="jspCap jspCapTop" />'),
								$('<div class="jspTrack" />').append(
									$('<div class="jspDrag" />').append(
										$('<div class="jspDragTop" />'),
										$('<div class="jspDragBottom" />')
									)
								),
								$('<div class="jspCap jspCapBottom" />')
							)
						);

						verticalBar = container.find('>.jspVerticalBar');
						verticalTrack = verticalBar.find('>.jspTrack');
						verticalDrag = verticalTrack.find('>.jspDrag');
						
					}

					if (settings.showArrows) {
						arrowUp = $('<a class="jspArrow jspArrowUp" />').on(
							'mousedown.jsp', getArrowScroll(0, -1)
						).on('click.jsp', nil);
						arrowDown = $('<a class="jspArrow jspArrowDown" />').on(
							'mousedown.jsp', getArrowScroll(0, 1)
						).on('click.jsp', nil);
						if (settings.arrowScrollOnHover) {
							arrowUp.on('mouseover.jsp', getArrowScroll(0, -1, arrowUp));
							arrowDown.on('mouseover.jsp', getArrowScroll(0, 1, arrowDown));
						}

						appendArrows(verticalTrack, settings.verticalArrowPositions, arrowUp, arrowDown);
					}

					verticalTrackHeight = paneHeight;
					container.find('>.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow').each(
						function()
						{
							verticalTrackHeight -= $(this).outerHeight();
						}
					);


					verticalDrag.hover(
						function()
						{
							verticalDrag.addClass('jspHover');
						},
						function()
						{
							verticalDrag.removeClass('jspHover');
						}
					).on(
						'mousedown.jsp',
						function(e)
						{
							// Stop IE from allowing text selection
							$('html').on('dragstart.jsp selectstart.jsp', nil);

							verticalDrag.addClass('jspActive');

							var startY = e.pageY - verticalDrag.position().top;

							$('html').on(
								'mousemove.jsp',
								function(e)
								{
									positionDragY(e.pageY - startY, 0);
								}
							).on('mouseup.jsp mouseleave.jsp', cancelDrag);
							return false;
						}
					);
					
					sizeVerticalScrollbar();
					
				}
				
			}

			function sizeVerticalScrollbar() {
				verticalTrack.height(verticalTrackHeight + 'px');
				//scrollPosition.y = 0;
				scrollbarWidth = settings.verticalGutter + verticalTrack.outerWidth();

				// Make the pane thinner to allow for the vertical scrollbar
				pane.width(paneWidth - scrollbarWidth - originalPaddingTotalWidth);

				// Add margin to the left of the pane if scrollbars are on that side (to position
				// the scrollbar on the left or right set it's left or right property in CSS)
				try {
					if (verticalBar.position().left === 0) {
						pane.css('margin-left', scrollbarWidth + 'px');
					}
				} catch (err) {
				}
			}

			function initialiseHorizontalScroll() {
				
				if (isScrollableH) {
					
					if ( isScrollableHLast !== true ) {
						
						container.append(
							$('<div class="jspHorizontalBar" />').append(
								$('<div class="jspCap jspCapLeft" />'),
								$('<div class="jspTrack" />').append(
									$('<div class="jspDrag" />').append(
										$('<div class="jspDragLeft" />'),
										$('<div class="jspDragRight" />')
									)
								),
								$('<div class="jspCap jspCapRight" />')
							)
						);

						horizontalBar = container.find('>.jspHorizontalBar');
						horizontalTrack = horizontalBar.find('>.jspTrack');
						horizontalDrag = horizontalTrack.find('>.jspDrag');
						
					}

					if (settings.showArrows) {
						arrowLeft = $('<a class="jspArrow jspArrowLeft" />').on(
							'mousedown.jsp', getArrowScroll(-1, 0)
						).on('click.jsp', nil);
						arrowRight = $('<a class="jspArrow jspArrowRight" />').on(
							'mousedown.jsp', getArrowScroll(1, 0)
						).on('click.jsp', nil);
						if (settings.arrowScrollOnHover) {
							arrowLeft.on('mouseover.jsp', getArrowScroll(-1, 0, arrowLeft));
							arrowRight.on('mouseover.jsp', getArrowScroll(1, 0, arrowRight));
						}
						appendArrows(horizontalTrack, settings.horizontalArrowPositions, arrowLeft, arrowRight);
					}

					horizontalDrag.hover(
						function()
						{
							horizontalDrag.addClass('jspHover');
						},
						function()
						{
							horizontalDrag.removeClass('jspHover');
						}
					).on(
						'mousedown.jsp',
						function(e)
						{
							// Stop IE from allowing text selection
							$('html').on('dragstart.jsp selectstart.jsp', nil);

							horizontalDrag.addClass('jspActive');

							var startX = e.pageX - horizontalDrag.position().left;

							$('html').on(
								'mousemove.jsp',
								function(e)
								{
									positionDragX(e.pageX - startX, 0);
								}
							).on('mouseup.jsp mouseleave.jsp', cancelDrag);
							return false;
						}
					);
					
					horizontalTrackWidth = container.innerWidth();
					sizeHorizontalScrollbar();
					
				}
				
			}

			function sizeHorizontalScrollbar() {
				container.find('>.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow').each(
					function() {
						horizontalTrackWidth -= $(this).outerWidth();
					}
				);

				horizontalTrack.width(horizontalTrackWidth + 'px');
				scrollPosition.x = 0;
			}

			function resizeScrollbars() {
				if (isScrollableH && isScrollableV) {
					var horizontalTrackHeight = horizontalTrack.outerHeight(),
						verticalTrackWidth = verticalTrack.outerWidth();
					verticalTrackHeight -= horizontalTrackHeight;
					$(horizontalBar).find('>.jspCap:visible,>.jspArrow').each(
						function()
						{
							horizontalTrackWidth += $(this).outerWidth();
						}
					);
					horizontalTrackWidth -= verticalTrackWidth;
					paneHeight -= verticalTrackWidth;
					paneWidth -= horizontalTrackHeight;
					horizontalTrack.parent().append(
						$('<div class="jspCorner" />').css('width', horizontalTrackHeight + 'px')
					);
					sizeVerticalScrollbar();
					sizeHorizontalScrollbar();
				}
				// reflow content
				if (isScrollableH) {
					pane.width((container.outerWidth() - originalPaddingTotalWidth) + 'px');
				}
				contentHeight = pane.outerHeight();
				percentInViewV = contentHeight / paneHeight;
				
				// before repositioning scrollbars, fix triggers
				
				repositionTriggers();

				if (isScrollableH) {
					horizontalDragWidth = Math.ceil(1 / percentInViewH * horizontalTrackWidth);
					if (horizontalDragWidth > settings.horizontalDragMaxWidth) {
						horizontalDragWidth = settings.horizontalDragMaxWidth;
					} else if (horizontalDragWidth < settings.horizontalDragMinWidth) {
						horizontalDragWidth = settings.horizontalDragMinWidth;
					}
					horizontalDrag.width(horizontalDragWidth + 'px');
					dragMax.x = horizontalTrackWidth - horizontalDragWidth;
					
					// force update to position all new items correctly
					_positionDragX(scrollPosition.x, true);
				}
				if (isScrollableV) {
					verticalDragHeight = Math.ceil(1 / percentInViewV * verticalTrackHeight);
					if (verticalDragHeight > settings.verticalDragMaxHeight) {
						verticalDragHeight = settings.verticalDragMaxHeight;
					} else if (verticalDragHeight < settings.verticalDragMinHeight) {
						verticalDragHeight = settings.verticalDragMinHeight;
					}
					verticalDrag.height(verticalDragHeight + 'px');
					dragMax.y = Math.round( verticalTrackHeight - verticalDragHeight );
					
					// force update to position all new items correctly
					_positionDragY(scrollPosition.y, true);
				}
				
			}

			function appendArrows(ele, p, a1, a2) {
				var p1 = "before", p2 = "after", aTemp;
				
				// Sniff for mac... Is there a better way to determine whether the arrows would naturally appear
				// at the top or the bottom of the bar?
				if (p == "os") {
					p = /Mac/.test(navigator.platform) ? "after" : "split";
				}
				if (p == p1) {
					p2 = p;
				} else if (p == p2) {
					p1 = p;
					aTemp = a1;
					a1 = a2;
					a2 = aTemp;
				}

				ele[p1](a1)[p2](a2);
			}

			function getArrowScroll(dirX, dirY, ele) {
				return function()
				{
					arrowScroll(dirX, dirY, this, ele);
					this.blur();
					return false;
				};
			}

			function arrowScroll(dirX, dirY, arrow, ele) {
				arrow = $(arrow).addClass('jspActive');

				var eve,
					scrollTimeout,
					isFirst = true,
					doScroll = function() {
						if (dirX !== 0) {
							jsp.scrollByX(dirX * settings.arrowButtonSpeed);
						}
						if (dirY !== 0) {
							jsp.scrollByY(dirY * settings.arrowButtonSpeed);
						}
						scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.arrowRepeatFreq);
						isFirst = false;
					};

				doScroll();

				eve = ele ? 'mouseout.jsp' : 'mouseup.jsp';
				ele = ele || $('html');
				ele.on(
					eve,
					function() {
						arrow.removeClass('jspActive');
						scrollTimeout && clearTimeout(scrollTimeout);
						scrollTimeout = null;
						ele.off(eve);
					}
				);
			}

			function initClickOnTrack() {
				removeClickOnTrack();
				if (isScrollableV) {
					verticalTrack.on(
						'mousedown.jsp',
						function(e)
						{
							if (e.originalTarget === undefined || e.originalTarget == e.currentTarget) {
								var clickedTrack = $(this),
									offset = clickedTrack.offset(),
									direction = e.pageY - offset.top - scrollPosition.y,
									scrollTimeout,
									isFirst = true,
									doScroll = function()
									{
										var offset = clickedTrack.offset(),
											pos = e.pageY - offset.top - verticalDragHeight / 2,
											contentDragY = paneHeight * settings.scrollPagePercent,
											dragY = dragMax.y * contentDragY / (contentHeight - paneHeight);
										if (direction < 0) {
											if (scrollPosition.y - dragY > pos) {
												jsp.scrollByY(-contentDragY);
											} else {
												positionDragY(pos);
											}
										} else if (direction > 0) {
											if (scrollPosition.y + dragY < pos) {
												jsp.scrollByY(contentDragY);
											} else {
												positionDragY(pos);
											}
										} else {
											cancelClick();
											return;
										}
										scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.trackClickRepeatFreq);
										isFirst = false;
									},
									cancelClick = function()
									{
										scrollTimeout && clearTimeout(scrollTimeout);
										scrollTimeout = null;
										$(document).off('mouseup.jsp', cancelClick);
									};
								doScroll();
								$(document).on('mouseup.jsp', cancelClick);
								return false;
							}
						}
					);
				}
				
				if (isScrollableH) {
					horizontalTrack.on(
						'mousedown.jsp',
						function(e)
						{
							if (e.originalTarget === undefined || e.originalTarget == e.currentTarget) {
								var clickedTrack = $(this),
									offset = clickedTrack.offset(),
									direction = e.pageX - offset.left - scrollPosition.x,
									scrollTimeout,
									isFirst = true,
									doScroll = function()
									{
										var offset = clickedTrack.offset(),
											pos = e.pageX - offset.left - horizontalDragWidth / 2,
											contentDragX = paneWidth * settings.scrollPagePercent,
											dragX = dragMax.x * contentDragX / (contentWidth - paneWidth);
										if (direction < 0) {
											if (scrollPosition.x - dragX > pos) {
												jsp.scrollByX(-contentDragX);
											} else {
												positionDragX(pos);
											}
										} else if (direction > 0) {
											if (scrollPosition.x + dragX < pos) {
												jsp.scrollByX(contentDragX);
											} else {
												positionDragX(pos);
											}
										} else {
											cancelClick();
											return;
										}
										scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.trackClickRepeatFreq);
										isFirst = false;
									},
									cancelClick = function()
									{
										scrollTimeout && clearTimeout(scrollTimeout);
										scrollTimeout = null;
										$(document).off('mouseup.jsp', cancelClick);
									};
								doScroll();
								$(document).on('mouseup.jsp', cancelClick);
								return false;
							}
						}
					);
				}
			}

			function removeClickOnTrack() {
				if (horizontalTrack) {
					horizontalTrack.off('mousedown.jsp');
				}
				if (verticalTrack) {
					verticalTrack.off('mousedown.jsp');
				}
			}

			function cancelDrag() {
				$('html').off('dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp');

				if (verticalDrag) {
					verticalDrag.removeClass('jspActive');
				}
				if (horizontalDrag) {
					horizontalDrag.removeClass('jspActive');
				}
			}

			function positionDragY( destY, duration, animateParameters ) {
				
				if (!isScrollableV) {
					return;
				}
				
				animateParameters = animateParameters || {};
				animateParameters.y = Math.round( Math.max( 0, Math.min( dragMax.y, destY ) ) );
				animateParameters.onUpdate = positionDragUpdateY;
				
				if ( settings.animate !== true || scrollPosition.y === animateParameters.y || duration === false ) {
					
					duration = 0;
					
				}
				// ensures a smooth scroll if no duration passed
				else if ( duration === true || isNumber( duration ) !== true ) {
					
					duration = settings.animateDuration;
					
				}
				
				TweenMax.to( scrollPositionTargetY, duration, animateParameters);
				
				return this;
				
			}
            
            function positionDragUpdateY () {
                
                _positionDragY( scrollPositionTargetY.y );
                
            }

			function _positionDragY( destY, force ) {
                
				if (destY === undefined) {
					destY = verticalDrag.position().top;
				}
				
				// find basic destination y and top
				
				destY = Math.round( Math.max( 0, Math.min( dragMax.y, destY ) ) );
				var percentScrolled = destY / dragMax.y;
				var destTop = Math.round( percentScrolled * (contentHeight - paneHeight) );
				
				if ( isNaN( destTop ) ) {
					
					destTop = destY = 0;
					
				}
				
				if ( contentPosition.y !== destTop || force === true ) {
					
					container.scrollTop(0);
					scrollPositionLast.y = scrollPosition.y;
					scrollPosition.y = destY;
					
					contentPositionLast.y = contentPosition.y;
					contentPosition.y = destTop;
					
					var isAtTop = scrollPosition.y === 0;
					var isAtBottom = scrollPosition.y == dragMax.y;
					
					if (wasAtTop != isAtTop || wasAtBottom != isAtBottom) {
						wasAtTop = isAtTop;
						wasAtBottom = isAtBottom;
						elem.trigger('jsp-arrow-change', [wasAtTop, wasAtBottom, wasAtLeft, wasAtRight]);
					}
					
					updateVerticalArrows(isAtTop, isAtBottom);
					if ( verticalDrag ) verticalDrag.css('top', destY);
					
					pane.css('top', -destTop);
					
					elem.trigger('jsp-scroll-y', [destTop, isAtTop, isAtBottom]).trigger('scroll');
					
					handleTriggers();
					
				}
				
			}
			
			function positionDragX( destX, duration, animateParameters ) {
				
				if (!isScrollableH) {
					return;
				}
				
				animateParameters = animateParameters || {};
                animateParameters.x = Math.round( Math.max( 0, Math.min( dragMax.x, destX ) ) );
                animateParameters.onUpdate = positionDragUpdateX;
				
				if ( settings.animate !== true || scrollPosition.x === animateParameters.x || duration === false ) {
					
					duration = 0;
					
				}
				// ensures a smooth scroll if no duration passed
				else if ( duration === true || isNumber( duration ) !== true ) {
					
					duration = settings.animateDuration;
					
				}
				
				TweenMax.to( scrollPositionTargetX, duration, animateParameters);
				
				return this;

			}
            
            function positionDragUpdateX () {
                
                _positionDragX( scrollPositionTargetX.x );
                
            }

			function _positionDragX( destX, force ) {
				
				if (destX === undefined) {
					destX = horizontalDrag.position().left;
				}
				
				destX = Math.round( Math.max( 0, Math.min( dragMax.x, destX ) ) );
				
				var percentScrolled = destX / dragMax.x;
				var destLeft = Math.round( percentScrolled * (contentWidth - paneWidth) );
				
				if ( isNaN( destLeft ) ) {
					
					destLeft = destX = 0;
					
				}
				
				if ( contentPosition.x !== destLeft || force === true ) {
					
					container.scrollLeft(0);
					scrollPositionLast.x = scrollPosition.x;
					scrollPosition.x = destX;
					
					contentPositionLast.x = contentPosition.x;
					contentPosition.x = destLeft;
					
					var isAtLeft = scrollPosition.x === 0;
					var isAtRight = scrollPosition.x == dragMax.x;
					
					if (wasAtLeft != isAtLeft || wasAtRight != isAtRight) {
						wasAtLeft = isAtLeft;
						wasAtRight = isAtRight;
						elem.trigger('jsp-arrow-change', [wasAtTop, wasAtBottom, wasAtLeft, wasAtRight]);
					}
					
					updateHorizontalArrows(isAtLeft, isAtRight);
					if ( horizontalDrag ) horizontalDrag.css('left', destX);
					pane.css('left', -destLeft);
					
					elem.trigger('jsp-scroll-x', [destLeft, isAtLeft, isAtRight]).trigger('scroll');
					
					handleTriggers();
					
				}
				
			}

			function updateVerticalArrows(isAtTop, isAtBottom) {
				if (settings.showArrows) {
					arrowUp[isAtTop ? 'addClass' : 'removeClass']('jspDisabled');
					arrowDown[isAtBottom ? 'addClass' : 'removeClass']('jspDisabled');
				}
			}

			function updateHorizontalArrows(isAtLeft, isAtRight) {
				if (settings.showArrows) {
					arrowLeft[isAtLeft ? 'addClass' : 'removeClass']('jspDisabled');
					arrowRight[isAtRight ? 'addClass' : 'removeClass']('jspDisabled');
				}
			}

			function scrollToY(destY, duration, animateParameters) {
				var percentScrolled = destY / (contentHeight - paneHeight);
				positionDragY(percentScrolled * dragMax.y, duration, animateParameters);
			}

			function scrollToX(destX, duration, animateParameters) {
				var percentScrolled = destX / (contentWidth - paneWidth);
				positionDragX(percentScrolled * dragMax.x, duration, animateParameters);
			}
			
			function scrollToElement( elements, stickToTop, duration, animateParameters) {
				
				var destY, destX;
				
				var $elements = $( elements );
				var $elementClosest = $elements;
				var screenCenterX = contentPosition.x + paneWidth * 0.5;
				var screenCenterY = contentPosition.y + paneHeight * 0.5;
				var distanceMin = Number.MAX_VALUE;
				var boundsMin;
				
				// find closest element
				
				$elements.each( function () {
					
					var $element = $( this );
					var bounds = getBounds( $element );
					var cX = bounds.left + ( bounds.right - bounds.left ) * 0.5;
					var cY = bounds.top + ( bounds.bottom - bounds.top ) * 0.5;
					var distance = Math.pow( screenCenterX - cX, 2 ) + Math.pow( screenCenterY - cY, 2 );
					
					if ( distance < distanceMin ) {
						
						distanceMin = distance;
						boundsMin = bounds;
						$elementClosest = $element;
						
					}
					
				} );
				
				if ( $elementClosest.length > 0 && boundsMin ) {
					
					var viewportTop = contentPosition.y;
					var maxVisibleEleTop = viewportTop + paneHeight;
					if (boundsMin.top < viewportTop || stickToTop) { // element is above viewport
						destY = boundsMin.top - Math.max( 0, settings.verticalGutter );
					} else if (boundsMin.bottom > maxVisibleEleTop) { // element is below viewport
						destY = boundsMin.bottom - paneHeight + Math.max( 0, settings.verticalGutter );
					}
					
					var viewportLeft = contentPosition.x;
					var maxVisibleEleLeft = viewportLeft + paneWidth;
					if (boundsMin.left < viewportLeft || stickToTop) { // element is to the left of viewport
						destX = boundsMin.left - Math.max( 0, settings.horizontalGutter );
					} else if (boundsMin.right > maxVisibleEleLeft) { // element is to the right viewport
						destX = boundsMin.right - paneWidth + Math.max( 0, settings.horizontalGutter );
					}
					
					handleMultiScroll( destX, destY, duration, animateParameters );
					
				}	
				
			}
			
			function handleMultiScroll ( destX, destY, duration, animateParameters ) {
				
				animateParameters = animateParameters || {};
				
                var animateParametersX = $.extend( {}, animateParameters );
				var animateParametersY = $.extend( {}, animateParameters );
				var onComplete = animateParameters.onComplete;
				var waitHorizontal = isScrollableH;
				var waitVertical = isScrollableV;
				
				if ( typeof onComplete === 'function' ) {
					
					if ( waitHorizontal && waitVertical ) {
						
						animateParametersX.onComplete = function () {
							waitHorizontal = false;
							if ( waitVertical !== true && waitHorizontal !== true ) onComplete();
						};
                        
                        animateParametersY.onComplete = function () {
							waitVertical = false;
							if ( waitVertical !== true && waitHorizontal !== true ) onComplete();
						};
						
					}
					else if ( !waitHorizontal && !waitVertical ) {
						
						onComplete();
						
					}
					
				}
				
				scrollToY(destY, duration, animateParametersY);
				scrollToX(destX, duration, animateParametersX);
				
			}

			function isCloseToBottom() {
				var scrollableHeight = contentHeight - paneHeight;
				return (scrollableHeight > 20) && (scrollableHeight - contentPosition.y < 10);
			}

			function isCloseToRight() {
				var scrollableWidth = contentWidth - paneWidth;
				return (scrollableWidth > 20) && (scrollableWidth - contentPosition.x < 10);
			}
			
			function isNumber ( n ) {
				
				return !isNaN( n ) && isFinite( n ) && typeof n !== 'boolean';
				
			}

			function initMousewheel() {
				container.off(mwEvent).on(
					mwEvent,
					function (event, delta, deltaX, deltaY) {
						var dX = scrollPosition.x, dY = scrollPosition.y;
						jsp.scrollBy(deltaX * settings.mouseWheelSpeed, -deltaY * settings.mouseWheelSpeed);
						// return true if there was no movement so rest of screen can scroll
						return dX == scrollPosition.x && dY == scrollPosition.y;
					}
				);
			}

			function removeMousewheel() {
				container.off(mwEvent);
			}

			function nil() {
				return false;
			}

			function initFocusHandler() {
				pane.find(':input,a').off('focus.jsp').on(
					'focus.jsp',
					function(e) {
						scrollToElement(e.target);
					}
				);
			}

			function removeFocusHandler() {
				pane.find(':input,a').off('focus.jsp');
			}
			
			function initKeyboardNav() {
				var keyDown, elementHasScrolled, validParents = [];
				isScrollableH && validParents.push(horizontalBar[0]);
				isScrollableV && validParents.push(verticalBar[0]);
				
				// IE also focuses elements that don't have tabindex set.
				pane.focus(
					function() {
						elem.focus();
					}
				);
				
				elem.attr('tabindex', 0)
					.off('keydown.jsp keypress.jsp')
					.on(
						'keydown.jsp',
						function(e)
						{
							if (e.target !== this && !(validParents.length && $(e.target).closest(validParents).length)){
								return;
							}
							var dX = scrollPosition.x, dY = scrollPosition.y;
							switch(e.keyCode) {
								case 40: // down
								case 38: // up
								case 34: // page down
								case 32: // space
								case 33: // page up
								case 39: // right
								case 37: // left
									keyDown = e.keyCode;
									keyDownHandler();
									break;
								case 35: // end
									scrollToY(contentHeight - paneHeight);
									keyDown = null;
									break;
								case 36: // home
									scrollToY(0);
									keyDown = null;
									break;
							}

							elementHasScrolled = e.keyCode == keyDown && dX != scrollPosition.x || dY != scrollPosition.y;
							return !elementHasScrolled;
						}
					).on(
						'keypress.jsp', // For FF/ OSX so that we can cancel the repeat key presses if the JSP scrolls...
						function(e)
						{
							if (e.keyCode == keyDown) {
								keyDownHandler();
							}
							return !elementHasScrolled;
						}
					);
				
				if (settings.hideFocus) {
					elem.css('outline', 'none');
					if ('hideFocus' in container[0]){
						elem.attr('hideFocus', true);
					}
				} else {
					elem.css('outline', '');
					if ('hideFocus' in container[0]){
						elem.attr('hideFocus', false);
					}
				}
				
				function keyDownHandler()
				{
					var dX = scrollPosition.x, dY = scrollPosition.y;
					switch(keyDown) {
						case 40: // down
							jsp.scrollByY(settings.keyboardSpeed);
							break;
						case 38: // up
							jsp.scrollByY(-settings.keyboardSpeed);
							break;
						case 34: // page down
						case 32: // space
							jsp.scrollByY(paneHeight * settings.scrollPagePercent);
							break;
						case 33: // page up
							jsp.scrollByY(-paneHeight * settings.scrollPagePercent);
							break;
						case 39: // right
							jsp.scrollByX(settings.keyboardSpeed);
							break;
						case 37: // left
							jsp.scrollByX(-settings.keyboardSpeed);
							break;
					}

					elementHasScrolled = dX != scrollPosition.x || dY != scrollPosition.y;
					return elementHasScrolled;
				}
			}
			
			function removeKeyboardNav() {
				elem.attr('tabindex', '-1')
					.removeAttr('tabindex')
					.off('keydown.jsp keypress.jsp');
			}

			function observeHash() {
				if (location.hash && location.hash.length > 1) {
					var e,
						retryInt,
						hash = escape(location.hash.substr(1)) // hash must be escaped to prevent XSS
						;
					try {
						e = $('#' + hash + ', a[name="' + hash + '"]');
					} catch (err) {
						return;
					}

					if (e.length && pane.find(hash)) {
						// nasty workaround but it appears to take a little while before the hash has done its thing
						// to the rendered page so we just wait until the container's scrollTop has been messed up.
						if (container.scrollTop() === 0) {
							retryInt = setInterval(
								function()
								{
									if (container.scrollTop() > 0) {
										scrollToElement(e, true);
										$(document).scrollTop(container.position().top);
										clearInterval(retryInt);
									}
								},
								50
							);
						} else {
							scrollToElement(e, true);
							$(document).scrollTop(container.position().top);
						}
					}
				}
			}

			function hijackInternalLinks() {
				// only register the link handler once
				if ($(document.body).data('jspHijack')) {
					return;
				}

				// remember that the handler was bound
				$(document.body).data('jspHijack', true);

				// use live handler to also capture newly created links
				$(document.body).delegate('a[href*=#]', 'click', function(event) {
					// does the link point to the same page?
					// this also takes care of cases with a <base>-Tag or Links not starting with the hash #
					// e.g. <a href="index.html#test"> when the current url already is index.html
					var href = this.href.substr(0, this.href.indexOf('#')),
						locationHref = location.href,
						hash,
						element,
						container,
						jsp,
						scrollTop,
						elementTop;
					if (location.href.indexOf('#') !== -1) {
						locationHref = location.href.substr(0, location.href.indexOf('#'));
					}
					if (href !== locationHref) {
						// the link points to another page
						return;
					}

					// check if jScrollPane should handle this click event
					hash = escape(this.href.substr(this.href.indexOf('#') + 1));

					// find the element on the page
					element;
					try {
						element = $('#' + hash + ', a[name="' + hash + '"]');
					} catch (e) {
						// hash is not a valid jQuery identifier
						return;
					}

					if (!element.length) {
						// this link does not point to an element on this page
						return;
					}

					container = element.closest('.jspScrollable');
					jsp = container.data('jsp');

					// jsp might be another jsp instance than the one, that bound this event
					// remember: this event is only bound once for all instances.
					jsp.scrollToElement(element, true);

					if (container[0].scrollIntoView) {
						// also scroll to the top of the container (if it is not visible)
						scrollTop = $(window).scrollTop();
						elementTop = element.offset().top;
						if (elementTop < scrollTop || elementTop > scrollTop + $(window).height()) {
							container[0].scrollIntoView();
						}
					}

					// jsp handled this event, prevent the browser default (scrolling :P)
					event.preventDefault();
				});
			}
			
			// Init touch on iPad, iPhone, iPod, Android
			function initTouch() {
				var startX,
					startY,
					touchStartX,
					touchStartY,
					moved,
					moving = false;
  
				container.off('touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick').on(
					'touchstart.jsp',
					function(e) {
						var touch = e.originalEvent.touches[0];
						startX = contentPosition.x;
						startY = contentPosition.y;
						touchStartX = touch.pageX;
						touchStartY = touch.pageY;
						moved = false;
						moving = true;
					}
				).on(
					'touchmove.jsp',
					function(ev) {
						if(!moving) {
							return;
						}
						
						var touchPos = ev.originalEvent.touches[0],
							dX = scrollPosition.x, dY = scrollPosition.y;
						
						jsp.scrollTo(startX + touchStartX - touchPos.pageX, startY + touchStartY - touchPos.pageY);
						
						moved = moved || Math.abs(touchStartX - touchPos.pageX) > 5 || Math.abs(touchStartY - touchPos.pageY) > 5;
						
						// return true if there was no movement so rest of screen can scroll
						return dX == scrollPosition.x && dY == scrollPosition.y;
					}
				).on(
					'touchend.jsp',
					function(e) {
						moving = false;
						/*if(moved) {
							return false;
						}*/
					}
				).on(
					'click.jsp-touchclick',
					function(e) {
						if(moved) {
							moved = false;
							return false;
						}
					}
				);
			}
			
			function addTrigger ( parameters ) {
				
				var triggerNew = $.extend( {}, parameters );
				var $element = triggerNew.$element = $( triggerNew.element );
				var bounds = triggerNew.bounds = getBounds( $element );
				var context = parameters.context;
				var callback = parameters.callback;
				
				// ensure trigger does not already exist
				
				var i, il, trigger;
				
				for( i = 0, il = triggers.length; i < il; i++ ) {
					
					trigger = triggers[ i ];
					
					if ( trigger.callback === callback && trigger.context === context && trigger.$element.is( $element ) ) {
						
						trigger.once = parameters.once;
						
						return trigger;
						
					}
					
				}
				
				triggers.push( triggerNew );
				
				return triggerNew;
				
			}
			
			function removeTrigger ( trigger ) {
				
				if ( typeof trigger !== 'undefined' ) {
					
					var i, trigger;
					
					for( i = triggers.length - 1; i >= 0; i-- ) {
						
						if ( trigger === triggers[ i ] ) {
							
							removeTriggerByIndex( i );
							
							break;
							
						}
						
					}
					
				}
				
			}
			
			function removeTriggerByIndex ( index ) {
				
				var trigger = triggers[ index ];
				
				triggers.splice( index, 1 );
				
				if ( typeof trigger.onRemoved === 'function' ) {
					
					trigger.onRemoved.call( trigger.context );
					
				}
				
			}
			
			function addTriggers ( list ) {
				
				var i, il, added = [];
				
				if ( typeof list !== 'undefined' ) {
					
					for( i = 0, il = list.length; i < il; i++ ) {
						
						added.push( addTrigger( list[ i ] ) );
						
					}
					
				}
				
				return added;
				
			}
			
			function removeTriggers ( list ) {
				
				var i, il;
				
				if ( typeof list !== 'undefined' ) {
					
					for( i = 0, il = list.length; i < il; i++ ) {
						
						removeTrigger( list[ i ] );
						
					}
					
				}
				
			}
			
			function handleTriggers () {
				
				if ( ( contentPosition.x !== contentPositionLast.x || contentPosition.y !== contentPositionLast.y ) && suppressTriggers !== true ) {
					
					var paneWidthHalf = paneWidth * 0.5;
					var paneHeightHalf = paneHeight * 0.5;
					var cx = contentPosition.x + paneWidthHalf;
					var cy = contentPosition.y + paneHeightHalf;
					var lcx = contentPositionLast.x + paneWidthHalf;
					var lcy = contentPositionLast.y + paneHeightHalf;
					var i, trigger;
					
					for( i = triggers.length - 1; i >= 0; i-- ) {
						
						trigger = triggers[ i ];
						
						if ( isInsideTriggerArea( cx, cy, lcx, lcy, trigger ) ) {
							
							if ( trigger.ignore !== true ) {
								
								if ( trigger.once === true ) {
									
									removeTriggerByIndex( i );
									
								}
								else if ( trigger.continuous !== true ) {
									
									trigger.ignore = true;
									
								}
								
								trigger.callback.call( trigger.context );
								
							}
							
						}
						else {
							
							trigger.ignore = false;
							
						}
						
					}
					
				}
				
			}
			
			function isInsideTriggerArea ( maxX, maxY, minX, minY, trigger ) {
				
				var bounds = trigger.bounds;
				
				// do a 2D AABB-AABB test
				
				if ( minX > bounds.right ) return false;
				if ( maxX < bounds.left ) return false;
				if ( minY > bounds.bottom ) return false;
				if ( maxY < bounds.top ) return false;
				
				return true;
				
			}
			
			function repositionTriggers () {
				
				var i, il, trigger;
				
				for ( i = 0, il = triggers.length; i < il; i++ ) {
					
					trigger = triggers[ i ];
					trigger.bounds = getBounds( trigger.$element );
					
				}
				
			}
			
			function getBounds ( elements ) {

				var $elements = $( elements );
				var bounds = {
					$elements: $elements,
					left: Number.MAX_VALUE,
					right: -Number.MAX_VALUE,
					top: Number.MAX_VALUE,
					bottom: -Number.MAX_VALUE
				};
				
				// create total box from all elements
				// for simplicity, assumes all elements form a rectangle

				$elements.each( function () {
					
					var $element = $( this );
					
					if ( $element.length > 0 ) {
						
						var left = 0, right, top = 0, bottom;
						
						// loop through parents adding the offset top of any elements that are relatively positioned between
						// the focused element and the jspPane so we can get the true distance from the top
						// of the focused element to the top of the scrollpane...
						var $elementCurrent = $element, position;
						
						while ( !$elementCurrent.is('.jspPane') ) {
							position = $elementCurrent.position();
							left += position.left;
							top += position.top;
							$elementCurrent = $elementCurrent.offsetParent();
							if ( /^body|html$/i.test( $elementCurrent[0].nodeName ) ) {
								// we ended up too high in the document structure. Quit!
								return;
							}
						}
						
						right = left + $element.outerWidth();
						bottom = top + $element.outerHeight();
						
						if ( right > bounds.right ) bounds.right = right;
						if ( left < bounds.left ) bounds.left = left;
						if ( bottom > bounds.bottom ) bounds.bottom = bottom;
						if ( top < bounds.top ) bounds.top = top;
						
					}
					
				} );
				
				bounds.rightSansPane = bounds.right - container.width();
				bounds.bottomSansPane = bounds.bottom - container.height();
				
				// bounds won't be entered by scrolling center point
				
				if ( isScrollableH === false && bounds.right - bounds.left < contentWidth ) {
					
					bounds.left = -Number.MAX_VALUE;
					bounds.right = Number.MAX_VALUE;
					
				}
				
				if ( isScrollableV === false && bounds.bottom - bounds.top < contentHeight ) {
					
					bounds.top = -Number.MAX_VALUE;
					bounds.bottom = Number.MAX_VALUE;
					
				}
				
				return bounds;
				
			}
			
			function destroy(){
				var currentY = contentPosition.y,
					currentX = contentPosition.x;
				elem.removeClass('jspScrollable').off('.jsp');
				elem.replaceWith(originalElement.append(pane.children()));
				originalElement.scrollTop(currentY);
				originalElement.scrollLeft(currentX);

				// clear reinitialize timer if active
				if (reinitialiseInterval) {
					clearInterval(reinitialiseInterval);
				}
			}

			// Public API
			$.extend(
				jsp,
				{
					// Reinitialises the scroll pane (if it's internal dimensions have changed since the last time it
					// was initialised). The settings object which is passed in will override any settings from the
					// previous time it was initialised - if you don't pass any settings then the ones from the previous
					// initialisation will be used.
					reinitialise: function(s) {
						s = $.extend({}, settings, s);
						initialise(s);
						return this;
					},
					// Scrolls the specified element (a jQuery object, DOM node or jQuery selector string) into view so
					// that it can be seen within the viewport. If stickToTop is true then the element will appear at
					// the top of the viewport, if it is false then the viewport will scroll as little as possible to
					// show the element.
					scrollToElement: function (ele, stickToTop, duration, animateParameters) {
						scrollToElement(ele, stickToTop, duration, animateParameters);
						return this;
					},
					// Scrolls the pane so that the specified co-ordinates within the content are at the top left
					// of the viewport. 
					scrollTo: function(destX, destY, duration, animateParameters) {
						handleMultiScroll( destX, destY, duration, animateParameters );
						return this;
					},
					// Scrolls the pane so that the specified co-ordinate within the content is at the left of the viewport.
					scrollToX: function (destX, duration, animateParameters) {
						scrollToX(destX, duration, animateParameters);
						return this;
					},
					// Scrolls the pane so that the specified co-ordinate within the content is at the top of the viewport.
					scrollToY: function (destY, duration, animateParameters) {
						scrollToY(destY, duration, animateParameters);
						return this;
					},
					// Scrolls the pane to the specified percentage of its maximum horizontal scroll position. 
					scrollToPercentX: function(destPercentX, duration, animateParameters) {
						scrollToX(destPercentX * (contentWidth - paneWidth), duration, animateParameters);
						return this;
					},
					// Scrolls the pane to the specified percentage of its maximum vertical scroll position. 
					scrollToPercentY: function(destPercentY, duration, animateParameters) {
						scrollToY(destPercentY * (contentHeight - paneHeight), duration, animateParameters);
						return this;
					},
					// Scrolls the pane by the specified amount of pixels. 
					scrollBy: function(deltaX, deltaY, duration, animateParameters) {
                        
						var destX = contentPosition.x + Math[deltaX<0 ? 'floor' : 'ceil'](deltaX),
							destY = contentPosition.y + Math[deltaY<0 ? 'floor' : 'ceil'](deltaY);
						
						handleMultiScroll( destX, destY, duration, animateParameters );
						return this;
					},
					// Scrolls the pane by the specified amount of pixels. 
					scrollByX: function(deltaX, duration, animateParameters) {
						var destX = contentPosition.x + Math[deltaX<0 ? 'floor' : 'ceil'](deltaX),
							percentScrolled = destX / (contentWidth - paneWidth);
						positionDragX(percentScrolled * dragMax.x, duration, animateParameters);
						return this;
					},
					// Scrolls the pane by the specified amount of pixels. 
					scrollByY: function(deltaY, duration, animateParameters) {
						var destY = contentPosition.y + Math[deltaY<0 ? 'floor' : 'ceil'](deltaY),
							percentScrolled = destY / (contentHeight - paneHeight);
						positionDragY(percentScrolled * dragMax.y, duration, animateParameters);
						return this;
					},
					// Positions the horizontal drag at the specified x position (and updates the viewport to reflect this).
					positionDragX: function (destX, duration, animateParameters) {
						positionDragX(destX, duration, animateParameters);
						return this;
					},
					// Positions the vertical drag at the specified y position (and updates the viewport to reflect this).
					positionDragY: function (destY, duration, animateParameters) {
						positionDragY(destY, duration, animateParameters);
						return this;
					},
					// trigger callback once area has been entered / crossed
					addTrigger: function ( parameters ) {
						return addTrigger( parameters );
					},
					addTriggers: function ( list ) {
						return addTriggers( list );
					},
					removeTrigger: function ( trigger ) {
						removeTrigger( trigger );
						return this;
					},
					removeTriggers: function ( list ) {
						removeTriggers( list );
						return this;
					},
					// Returns the current x position of the viewport with regards to the content pane.
					getContentPositionX: function() {
						return contentPosition.x;
					},
					// Returns the current y position of the viewport with regards to the content pane.
					getContentPositionY: function() {
						return contentPosition.y;
					},
					// Returns the width of the content within the scroll pane.
					getContentWidth: function() {
						return contentWidth;
					},
					// Returns the height of the content within the scroll pane.
					getContentHeight: function() {
						return contentHeight;
					},
					// Returns the horizontal position of the viewport within the pane content.
					getPercentScrolledX: function() {
						return contentPosition.x / (contentWidth - paneWidth);
					},
					// Returns the vertical position of the viewport within the pane content.
					getPercentScrolledY: function() {
						return contentPosition.y / (contentHeight - paneHeight);
					},
					// Returns whether or not this scrollpane has a horizontal scrollbar.
					getIsScrollableH: function() {
						return isScrollableH;
					},
					// Returns whether or not this scrollpane has a vertical scrollbar.
					getIsScrollableV: function() {
						return isScrollableV;
					},
					// Gets a reference to the content pane. It is important that you use this method if you want to
					// edit the content of your jScrollPane as if you access the element directly then you may have some
					// problems (as your original element has had additional elements for the scrollbars etc added into
					// it).
					getContentPane: function() {
						return pane;
					},
					// Scrolls this jScrollPane down as far as it can currently scroll.
					scrollToBottom: function(duration, animateParameters) {
						positionDragY(dragMax.y, duration, animateParameters);
						return this;
					},
					// Hijacks the links on the page which link to content inside the scrollpane. If you have changed
					// the content of your page (e.g. via AJAX) and want to make sure any new anchor links to the
					// contents of your scroll pane will work then call this function.
					hijackInternalLinks: $.noop,
					// Removes the jScrollPane and returns the page to the state it was in before jScrollPane was
					// initialised.
					destroy: function() {
						destroy();
						return this;
					}
				}
			);
			
			initialise(s);
		}

		// Pluginifying code...
		settings = $.extend( {}, $.fn.jScrollPane.defaults, settings);
		
		// Apply default speed
		$.each(['mouseWheelSpeed', 'arrowButtonSpeed', 'trackClickSpeed', 'keyboardSpeed'], function() {
			settings[this] = settings[this] || settings.speed;
		});

		return this.each(
			function() {
				var elem = $(this), jspApi = elem.data('jsp');
				if (jspApi) {
					jspApi.reinitialise(settings);
				} else {
					$("script",elem).filter('[type="text/javascript"],:not([type])').remove();
					jspApi = new JScrollPane(elem, settings);
					elem.data('jsp', jspApi);
				}
			}
		);
	};

	$.fn.jScrollPane.defaults = {
		showArrows: false,
		maintainPosition: true,
		stickToBottom: false,
		stickToRight: false,
		clickOnTrack: true,
		autoReinitialise: false,
		autoReinitialiseDelay: 500,
		verticalDragMinHeight: 0,
		verticalDragMaxHeight: 99999,
		horizontalDragMinWidth: 0,
		horizontalDragMaxWidth: 99999,
		contentWidth: undefined,
		animateDuration: 0.3,
		animate: true,
		hijackInternalLinks: false,
		verticalGutter: 4,
		horizontalGutter: 4,
		mouseWheelSpeed: 0,
		arrowButtonSpeed: 0,
		arrowRepeatFreq: 50,
		arrowScrollOnHover: false,
		trackClickSpeed: 0,
		trackClickRepeatFreq: 70,
		verticalArrowPositions: 'split',
		horizontalArrowPositions: 'split',
		enableKeyboardNavigation: true,
		hideFocus: false,
		keyboardSpeed: 0,
		initialDelay: 300,        // Delay before starting repeating
		speed: 60,		// Default speed when others falsey
		scrollPagePercent: .8		// Percent of visible area scrolled when pageUp/Down or track area pressed
	};

} );