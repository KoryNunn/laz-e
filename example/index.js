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