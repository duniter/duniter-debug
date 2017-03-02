#!/bin/bash

DB_1=$1
DB_2=$2
TABLE=$3
DIFF=diff

if [ ! -z $4 ]; then
  DIFF=$4
fi

node run.js dbg-dump $TABLE --mdb $DB_1 --dbg-order 'CAST(written_on as int)' > a
node run.js dbg-dump $TABLE --mdb $DB_2 --dbg-order 'CAST(written_on as int)' > b
$DIFF a b
