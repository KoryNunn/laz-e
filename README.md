# laz-e

asynchronously create DOM with a nice syntax.

# usage

require:

```javascript
// you must pass in window.document OR an object that implements the same API as document.
var e = require('laz-e')(document);
```

laz-e has the same syntax as [crel](https://www.npmjs.org/package/crel) except that it returns a function, that takes a callback.

```javascript

var dom = e('div',
        e('h1', 'Page heading'),
        e('section', {'class': 'main'}
            'Welcome to my awesome webpage!'
        )
    );

// Pass a callback to the result to get the element.
dom(function(error, element){
    document.body.appendChild(element);
});

```

Because you pass in document, you can use laz-e in node, using a module such as [dom-lite](https://www.npmjs.org/package/dom-lite):


```javascript

var domLite = require('dom-lite'),
    e = require('laz-e')(domLite.document);

var dom = e('div',
        e('h1', 'Page heading'),
        e('section', {'class': 'main'}
            'Welcome to my awesome webpage!'
        )
    );

// Pass a callback to the result to get the element.
dom(function(error, element){
    response.end(element.outerHTML);
});

```