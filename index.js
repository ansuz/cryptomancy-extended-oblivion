var EOT = module.exports;

var Shard = require("cryptomancy-shard");
//var Source = require("cryptomancy-source");
//var Format = require("cryptomancy-format");

/*  Determine how many oblivious transfer protocols you'll have to execute
    in order to choose 1/n options from a set.
*/
EOT.comparisons = function (n) {
    // let's assume n is a number
    // because we'll get it via .length
    if (n < 2) { return 0; }
    var x = 1,
        i = x;

    // jshint doesn't like bitwise operators
    // it thinks you screwed up a comparison in your conditional
    while (((x << i) < n) && i < 32) { i++; }  // jshint ignore:line
    return i;
};

// for each comparison, create two buckets
var makeBuckets = function (n) {
    var B = [];
    while (n--) {
        B.push([{}, {}]);
    }
    return B;
};

/*  Given the index of a particular choice, and the total number of choices
    decide among which buckets the shards should be distributed
*/
EOT.chooseBuckets = function (i, n) {
    var A = Number(i).toString(2).split('').map(Number);
    while (A.length < n) { A.unshift(0); }
    return A;
};

/*  Given n secrets, divide those secrets into shares
    and spread the shares amongst the buckets, such that
    choosing the right buckets will allow you to recover
    only one secret.
*/
EOT.compose = function (source, secrets) {
    if (!Array.isArray(secrets)) { throw new Error("expected an array"); }
    // every element should be a Uint8Array

    // determine how many comparisons you'll need
    var n = EOT.comparisons(secrets.length);
    var B = makeBuckets(n);

    secrets.forEach(function (secret, i) {
        // shard the secret and serialize all its values
        var shards = Shard.create(source, secret, n);

        // split it between buckets
        EOT.chooseBuckets(i, n).forEach(function (bit, j) {
            // FIXME use constant-size ids
            B[j][bit][i] = shards[j];
        });
    });

    return B;
};

