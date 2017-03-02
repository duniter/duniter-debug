"use strict";

const co = require('co');
const Table = require('cli-table');

module.exports = {

  duniter: {

    /*********** CLI gen-next + gen-root **************/

    cliOptions: [
      { value: '--dbg-order <columns>', desc: 'Order the records of a table with `dbg-dump` command. Ex: --dbg-order \'CAST(written_on as int)\''}
    ],

    cli: [{
      name: 'dbg-dump [table]',
      desc: 'Dumps a database table.',
      logs: false,
      onDatabaseExecute: (server, conf, program, params) => co(function*() {
        const table = params[0];
        if (!table) {
          throw 'Usage: dbg-dump [table]';
        }

        const orderBy = program.dbgOrder ? ' ORDER BY ' + program.dbgOrder : ' ';

        const rows = yield server.dal.metaDAL.query('SELECT * FROM ' + table + orderBy);

        // Table columns
        const columns = Object.keys(rows[0]);
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
        console.log(t.toString());
        return new Promise((resolve) => setTimeout(resolve, 10));
      })
    }]
  }
}
