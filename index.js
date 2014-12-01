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
            if(child == null){
                return;
            }
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

                insert(child);
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                settings[key] == null ? 
                    element.removeAttribute(key) :
                    element.setAttribute(key, settings[key]);
            }else{
                var attr = e.attrMap[key];
                if(typeof attr === fn){
                    attr(element, settings[key]);
                }else{
                    settings[key] == null ? 
                        element.removeAttribute(attr) :
                        element.setAttribute(attr, settings[key]);
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
        var tempElement = document.createElement('temp');
        tempElement.toString = function(){
            return html;
        };
        return tempElement;
    };
    return e;
};