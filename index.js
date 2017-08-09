"use strict";

const _ = require('underscore')
const spawn = require('child_process').spawn
const exec = require('child_process').exec
const fs = require('fs')
const path = require('path')
const co = require('co');
const colors = require('colors');
const Table = require('cli-table');

colors.enabled = false;

module.exports = {

  duniter: {

    /*********** CLI gen-next + gen-root **************/

    cliOptions: [
      { value: '--dbg-order <columns>', desc: 'Order the records of a table with `dbg-dump` command. Ex: --dbg-order \'CAST(written_on as int)\''},
      { value: '--dbg-diff <tool>',     desc: 'Diff program to use for `dbg-compare`'},
      { value: '--dbg-log',             desc: 'Displays the dump of a `dbg-dump`'},
      { value: '--dbg-omit-cols <cols>', desc: 'Columns to omit during the dump`'}
    ],

    cli: [{
      name: 'dbg-dump [table]',
      desc: 'Dumps a database table.',
      logs: false,
      onDatabaseExecute: (server, conf, program, params, stopServices, startServices, stack) => co(function*() {
        const table = params[0];
        if (!table) {
          throw 'Usage: dbg-dump [table]';
        }
        let res;
        if (table === 'wotb') {
          res = yield new Promise((resolve) => {
            exec(process.argv.slice(0,2).join(' ') + ' dbg-wotdump', (error, stdout) => {
              resolve(stdout)
            })
          })
        }
        else {
          const orderBy = program.dbgOrder ? ' ORDER BY ' + program.dbgOrder : ' ';
          const rows = yield server.dal.metaDAL.query('SELECT * FROM ' + table + orderBy);
          // Table columns
          const omitCols = (program.dbgOmitCols || "").split(',')
          const columns = _.filter(_.keys(rows[0]), (col) => !omitCols.includes(col))
          const t = new Table({
            head: columns
          });
          for (const row of rows) {
            t.push(columns.map((c) => {
              if (row[c] === null) {
                return "NULL"
              }
              return row[c]
            }));
          }
          res = t.toString();
        }
        if (program.dbgLog) {
          console.log(res);
        }
        return res;
      })
    }, {
      name: 'dbg-wotdump',
      desc: 'Dumps the WoT table.',
      logs: false,
      onDatabaseExecute: (server, conf, program, params, stopServices, startServices, stack) => co(function*() {
        server.dal.wotb.showWoT();
        return new Promise((resolve) => setTimeout(resolve, 100));
      })
    }, {
      name: 'dbg-compare [db2] [table]',
      desc: 'Compare a same table between 2 databases',
      logs: false,
      onDatabaseExecute: (server, conf, program, params, stopServices, startServices, stack) => co(function*() {
        const db2 = params[0];
        const table = params[1];
        const diff = program.dbgDiff || 'diff'
        if (!db2 || !table) {
          throw 'Usage: dbg-compare [db2] [table]';
        }

        const command1 = ['dbg-dump', table, '--dbg-order', "'CAST(written_on as int)'",  '--dbg-omit-cols', (program.dbgOmitCols || "")]
        if (program.mdb) {
          command1.push('--mdb')
          command1.push(program.mdb)
        }
        const command2 = ['dbg-dump', table, '--mdb', db2, '--dbg-order', "'CAST(written_on as int)'", '--dbg-omit-cols', (program.dbgOmitCols || "")]

        const a = yield stack.executeStack(process.argv.slice(0, 2).concat(command1))
        const b = yield stack.executeStack(process.argv.slice(0, 2).concat(command2))

        const time = Date.now()
        const FILE_A = path.join(__dirname, 'tmp_a_' + time)
        const FILE_B = path.join(__dirname, 'tmp_b_' + time)
        fs.writeFileSync(FILE_A, a, 'utf8')
        fs.writeFileSync(FILE_B, b, 'utf8')

        let checkConf = spawn(diff, [FILE_A, FILE_B]);

        // Error messages
        checkConf.stdout.on('data', (data) => console.log(data.toString('utf8')));
        checkConf.stderr.on('data', (data) => console.error(data.toString('utf8')));

        return new Promise((resolve) => {

          // Result
          checkConf.on('close', () => {
            fs.unlinkSync(FILE_A)
            fs.unlinkSync(FILE_B)
            resolve()
          });
        })
      })
    }]
  }
}
