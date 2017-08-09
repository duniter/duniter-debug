# duniter-debug [![Build Status](https://api.travis-ci.org/duniter-debug/duniter.png)](https://travis-ci.org/duniter/duniter-debug) [![Dependencies](https://david-dm.org/duniter-debug/duniter.svg)](https://david-dm.org/duniter/duniter-debug)

A module providing blockchain debugging tools.

## Features

### Database comparison

```bash
node run.js --mdb dbA reset data
node run.js --mdb dbA sync gtest.duniter.org 10900
node run.js --mdb dbB reset data
node run.js --mdb dbB sync some.other.node 10900
node run.js --mdb dbA dbg-compare dbB m_index meld
```

Explanations:

* first, create a new database `dbA` from the synchronization of gtest.duniter.org:10900
* second, create a new database `dbB` from the synchronization of some.other.node:10900
* third, compare the resulting table `m_index` from these 2 databases with `meld` software.

Notes:

* you could replace `m_index` with one of `c_index`, `i_index`, `s_index`
* you could replace `meld` with `diff` or whatever comparison program available on your machine
