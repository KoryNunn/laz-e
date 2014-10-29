var domlite = require('dom-lite'),
    test = require('tape'),
    e = require('../')(typeof document !== 'undefined' ? document : domlite.document);

test('create DOM sync', function(t){
    t.plan(3);

    e('div')
    (function(error, element){
        t.notOk(error);
        t.ok(element);
        t.equal(element.tagName, 'DIV');
    });
});

test('create DOM async', function(t){
    t.plan(4);

    e('div',
        function(callback){
            Date.now(),
            setTimeout(function(){
                e('span', Date.now())(callback);
            },100);
        }
    )
    (function(error, element){
        t.notOk(error);
        t.ok(element);
        t.equal(element.tagName, 'DIV');
        t.equal(element.firstChild.tagName, 'SPAN');
    });
});

test('create DOM async with error', function(t){
    t.plan(5);

    e('div',
        function(callback){
            Date.now(),
            setTimeout(function(){
                callback('failed');
            },100);
        }
    )
    (function(error, element){
        t.ok(error);
        t.ok(element);
        t.equal(element.tagName, 'DIV');
        t.equal(element.childNodes.length, 0);
        t.equal(error, 'failed');
    });
});