var assert = require("assert");
var EOT = require(".");
var Source = require("cryptomancy-source");
var Format = require("cryptomancy-format");
var Shard = require("cryptomancy-shard");

(function () {
    var comparisons = EOT.comparisons;

    assert.equal(comparisons(31), 5);
    assert.equal(comparisons(17), 5);
    assert.equal(comparisons(16), 4);
    assert.equal(comparisons(9), 4);
    assert.equal(comparisons(8), 3);
    assert.equal(comparisons(7), 3);
    assert.equal(comparisons(4), 2);
    assert.equal(comparisons(3), 2);
    assert.equal(comparisons(2), 1);
    assert.equal(comparisons(1), 0);
}());


(function () {
    var chooseBuckets = EOT.chooseBuckets;
    assert.deepEqual(chooseBuckets(3, 3), [0, 1, 1]);
    assert.deepEqual(chooseBuckets(4, 4), [0, 1, 0, 0]);
    assert.deepEqual(chooseBuckets(0, 5), [0, 0, 0, 0, 0]);
    assert.deepEqual(chooseBuckets(4, 5), [0, 0, 1, 0, 0]);
}());

var die = function (n) {
    return Math.floor(Math.random() * n);
};

(function () {
    // TODO test EOT.compose for actually dividing things across buckets
    // and recovering them

    // all your secrets should have the same length
    // otherwise you're leaking some data
    // leftpad(JSON.stringify(secret)); should do the trick
    var secrets = [
        "ONE  ",
        "TWO  ",
        "THREE",
        "FOUR "
    ];

    var u8_secrets = secrets.map(Format.decodeUTF8);

    var buckets = EOT.compose(Source.bytes.secure(), u8_secrets);

/*
    buckets.forEach(function (choice) {
        choice.forEach(function (o) {
            Object.keys(o).forEach(function (k) {
                console.log("%s: [%s]", k, Format.encode64(o[k]));
            });
        });
    });
*/

    // choose a random secret to unlock...
    var r = die(secrets.length);

    var my_choice = EOT.chooseBuckets(r, EOT.comparisons(secrets.length));
    //console.log(my_choice);

    var first = buckets[0][my_choice[0]];
    var second = buckets[1][my_choice[1]];

    //console.log(r);
    //console.log(first);
    //console.log(second);

    var combined = Shard.combine([
        first[r],
        second[r]
    ]);

    assert.equal(Format.encodeUTF8(combined), secrets[r]);

}());
