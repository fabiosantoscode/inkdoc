/*jshint browser:true, node:false, laxcomma:true */
/*global Ink:false */

/*Ink.createModule(
    'Inkx', 'Autocomplete',
    ['Ink.UI.Aux_1', 'Ink.Dom.Css_1', 'Ink.Dom.Element_1', 'Ink.Dom.Event_1', 'Ink.Dom.Selector_1'],*/

Ink.requireModules(
    ['Ink.UI.Aux_1', 'Ink.Dom.Css_1', 'Ink.Dom.Element_1', 'Ink.Dom.Event_1', 'Ink.Dom.Selector_1'],
    function(Aux, Css, Elem, Event, Selector) {
        
        var Autocomplete = function(selector, options) {
            this._el = Aux.elOrSelector(selector, '1st argument');

            this._ulEl = Ink.s('ul', this._el.parentNode);

            this._options = Ink.extendObj({
                //maxResults: 0
                itemRenderer: function(text, item) {
                    return item.toString();
                },
                isMatch: function(text, item) {
                    return text === item;
                }
            }, Elem.data(this._el));

            this._options = Ink.extendObj( this._options, options || {});

            Event.observe(this._el.parentNode, 'keyup', Ink.bindEvent(this._onKeyUp, this) );

            Event.observe(this._ulEl, 'click', Ink.bindEvent(this._onClick, this) );

            this.hide();
        };

        Autocomplete.prototype = {
            test: function() {
                var text = this._el.value.toLowerCase().trim();
                var results = [];
                var html = [];
                var len = 0;

                if (text.length === '') {
                    return this.hide();
                }

                var mdl      = this._options.model, item;
                var isMatch  = this._options.isMatch;
                var renderer = this._options.itemRenderer;
                var max      = this._options.maxResults;
                for (var i = 0, f = mdl.length; i < f; ++i) {
                    item = mdl[i];

                    if (isMatch(text, item)) {
                        results.push(item);
                        html.push( renderer(text, item) );

                        ++len;
                        if (max && len === max) {
                            break;
                        }
                    }
                }

                this._ulEl.innerHTML = html.join('');

                this._results = results;

                this.show();
            },

            show: function() {
                Css.removeClassName(this._ulEl, 'hidden');
            },

            hide: function() {
                Css.addClassName(this._ulEl, 'hidden');
            },



            _fetchPossibleFocuses: function() {
                return Selector.select('input, a', this._el.parentNode);
            },

            _onKeyUp: function(ev) {
                //console.log(ev);

                // ignore keyboard events with modifier keys
                if (ev.altKey || ev.altGraphKey || ev.ctrlKey || ev.shiftKey || ev.metaKey) {
                    return;
                }



                // autocomplete navigation
                var kCode = ev.keyCode;

                var delta = 0;
                if (kCode === 27) {
                    Event.stop(ev);
                    this._el.value = '';
                    return this.hide();
                }
                else if (kCode === 13) {
                    this.hide();
                    this._el.focus();
                    return;
                }
                else if (kCode === 38) {
                    delta = -1;
                }
                else if (kCode === 40) {
                    delta = 1;
                }

                if (delta) {
                    var els = this._fetchPossibleFocuses();
                    var len = els.length;
                    var currentEl = document.activeElement;
                    var index = els.indexOf(currentEl);
                    index += delta;
                    if      (index < 0) {    index += len; }
                    else if (index >= len) { index -= len; }
                    currentEl = els[index];
                    currentEl.focus();
                    return;
                }



                // check which autocomplete results match and display them
                this.test();
            },

            _onClick: function(ev) {
                var el = Event.element(ev);

                this.hide();
                this._el.focus();

                if (el === this._el) {
                    return;
                }
                
                var els = this._fetchPossibleFocuses();
                els.shift(); // get rid of input
                var index = els.indexOf(el);

                if (this._options.onSuggestionActivated) {
                    this._options.onSuggestionActivated(el, this._results[index]);
                }
            }
        };

        window.Autocomplete = Autocomplete;

        //return Autocomplete;
    }
);