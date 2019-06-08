# Cryptomancy-extended-oblivion

## DISCLAIMER

I'm writing this code as a hobby project.

I don't recommend that you use it for anything critical.

## About

[cryptomancy-oblivion](https://github.com/ansuz/cryptomancy-oblivion) implements _Oblivious-Transfer_ (OT). That means Bob can choose between two options offered by Alice without revealing which of the options he chose. That's pretty cool and can be useful in situations where you have a yes/no choice to make. If you have more choices to make, you need something a little fancier.

[cryptomancy-shard](https://github.com/ansuz/cryptomancy-shard/) implements a very simple (non-threshold) secret-sharing algorithm, in which a secret can be divided into any number of components, all of which will be necessary to recover the input.

The sharding algorithm allows for us to implement a logical-and operation across choices, facilitating composition into more complex decision structures.

For example, given four secrets {A,B,C,D}

|      | 0| 1|
|     -| -| -|
| **0**| A| B|
| **1**| C| D|

To implement choices from larger numbers of elements, you only need to execute more oblivious-transfer protocols.

This module provides basic functions which make this process easier.

## Use

### comparisons

```javascript
var Extended = require("cryptomancy-extended-oblivion");

// 'comparisons' computes how many oblivious transfers
// are required to choose between a number of options

var secrets = [" ONE ", " TWO ", "THREE", " FOUR", " FIVE"];

Extended.comparisons(secrets.length); // 3
```

### chooseBuckets

```javascript
// 'chooseBuckets' takes the index of the element you'd like to choose
// and the number of transfers required for the set
// and returns the choices you'll have to make to choose that item.
// notably, Alice and Bob need to agree on this protocol for Bob to receive
// the element he'd actually like to obtain
Extended.chooseBuckets(1,
    Extended.comparisons(secrets.length)); // [0, 0, 1]
```

### compose

```javascript
// 'compose' requires a source of randomness to produce shares
// it's pluggable so that you can design your protocol however you want
// you can use a deterministic source of entropy if you want reproducable results.
// unless you have a good reason to do so, use a cryptographically secure source of bytes
var Source = require("cryptomancy-source");

// it's also worth mentionting that you need to convert your secrets into Uint8Arrays
var Format = require("cryptomancy-format");

var u8_secrets = secrets.map(Format.decodeUTF8);

// an array of binary choices is returned
// each choice is an object containing labeled shares
Extended.compose(Source.bytes.secure(), u8_secrets);
```

### Choice structure

```javascript
// the structure of the choices for [A, B, C, D] is as follows:

/*
var SET = [
    [
        {0: 'A0', 1: 'B0'},
        {2: 'C0', 3: 'D0'},
    ],
    [
        {0: 'A1', 2: 'C1'},
        {1: 'B1', 3: 'D1'}
    ]
];
*/
```

### Recovery

```javascript
// to recover C from SET, you would choose like so:

// the first array access indicates the index of the choice
// the second indicates which of the two buckets you'd like
// the third indicates the element you'd like from that bucket
var share1 = SET[0][1][2];
var share2 = SET[1][0][2];

// ...and use my shard library to combine the secrets
var Shard = require("cryptomancy-shard");

Shard.combine([
    share1,
    share2
]);
```

### Caveats

In a practical OT protocol you'd want to serialize each bucket in encrypted form, and pad the plaintext to prevent information leak via the size of the ciphertexts.


