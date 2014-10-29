(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var e = require('../')(typeof document !== 'undefined' ? document : domlite.document);

function slowe(){
    var args = arguments;
    return function(callback){
        setTimeout(function(){
            e.apply(e, args)(callback);
        }, Math.random() * 1000);
    };
}

/*
    slowe is just e except that it can take up to 1 second to complete.
*/

window.onload = function(){
    e(document.body,
        slowe('header',
            slowe('h1', 'Hello'),
            e('span', 'header stuff')
        )
    );

    var image = document.createElement('img');
    image.setAttribute('src', 'http://placekitten.com/g/200/300');

    e(document.body,
        slowe('div',
            e('section', {'class':'first'},
                e('label', 'Things:'),
                e('input'),
                slowe('button', 'first section button')
            ),
            slowe('section', {'class':'second'},
                slowe('label', 'Stuff:'),
                slowe('input', {type: 'number'}),
                e('button', 'second section button')
            ),
            image // Normal, synchronous DOM node
        )
    );
    e(document.body,
        slowe('footer',
            e('ul',
                slowe('li', 'some'),
                e('li', 'footer'),
                slowe('li', 'stuff')
            )
        )
    );
};
},{"../":2}],2:[function(require,module,exports){
var waitFor = require('wait-for');

module.exports = function(document){
    var fn = 'function',
        obj = 'object',
        isType = function(a, type){
            return typeof a === type;
        },
        isNode = typeof Node === fn ? function (object) {
            return object instanceof Node;
        } :
        // in IE <= 8 Node is an object, obviously..
        function(object){
            return object &&
                isType(object, obj) &&
                ('nodeType' in object) &&
                isType(object.ownerDocument,obj);
        },
        isElement = function (object) {
            return e.isNode(object) && (object.nodeType === 1 || object.nodeType === 11);
        },
        isArray = function(a){
            return a instanceof Array;
        };


    function e(){
        var args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
            element = args[0],
            child,
            settings = args[1],
            childIndex = 2,
            argumentsLength = args.length,
            attributeMap = e.attrMap;

        if(element === 'fragment'){
            element = document.createDocumentFragment();
        }

        element = e.isElement(element) ? element : document.createElement(element);
        // shortcut
        if(argumentsLength === 1){
            return function(callback){
                callback(null, element);
            };
        }

        if(!isType(settings,obj) || e.isNode(settings) || isArray(settings)) {
            --childIndex;
            settings = null;
        }

        var complete,
            err,
            after = waitFor(function(error){
                if(!complete){
                    err = error;
                    return;
                }
                complete(error, element);
            });

        var done = after(true, function(callback){
            if(err){
                return callback(e);
            }
            complete = callback;
        });

        function append(child, reference) {
            if(!isNode(child)){
                child = document.createTextNode(child);
            }
            element.insertBefore(child, reference);
        }

        function asyncAppend(child, reference){
            var placeholder = document.createElement('e-placeholder');
            insert(placeholder, reference);
            child(after(function(error, childElement){
                if(error){
                    element.removeChild(placeholder);
                    return;
                }
                insert(childElement, placeholder);
                element.removeChild(placeholder);
            }));
        }

        function insert(child, reference){
            if(isType(child, fn)){
                asyncAppend(child, reference);
            } else if (isArray(child)) {
              for(var i = 0; i < child.length; i++){
                  insert(child[i], reference);
              }
            } else {
              append(child, reference);
            }
        }

        // shortcut if there is only one child that is a string
        if((argumentsLength - childIndex) === 1 && isType(args[childIndex], 'string') && element.textContent !== undefined){
            element.textContent = args[childIndex];
        }else{
            for(; childIndex < argumentsLength; ++childIndex){
                child = args[childIndex];

                if(child == null){
                    continue;
                }

                insert(child);
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                element.setAttribute(key, settings[key] == null ? '' : settings[key]);
            }else{
                var attr = e.attrMap[key];
                if(typeof attr === fn){
                    attr(element, settings[key]);
                }else{
                    element.setAttribute(attr, settings[key] == null ? '' : settings[key]);
                }
            }
        }

        return done;
    }

    // Used for mapping one kind of attribute to the supported version of that in bad browsers.
    // String referenced so that compilers maintain the property name.
    e['attrMap'] = {};

    // String referenced so that compilers maintain the property name.
    e['isElement'] = isElement;
    e['isNode'] = isNode;
    e.document = document;
    e.html = function(html){
        var x = document.createElement('temp');
        x.toString = function(){
            return html;
        };
        return x;
    };
    return e;
};
},{"wait-for":3}],3:[function(require,module,exports){
module.exports = function waitFor(done){
    var pending = 0;
    var errored;
    return function(ignoreErrors, fn){
        pending++;

        if(typeof ignoreErrors === 'function'){
            fn = ignoreErrors;
            ignoreErrors = null;
        }

        return function(error){
            pending--;
            fn.apply(this, arguments);

            if(errored){
                return;
            }

            if(error && !ignoreErrors){
                errored = true;
                done(error);
                return;
            }

            if(pending === 0){
                done();
            }
        }
    }
};
},{}]},{},[1]);
