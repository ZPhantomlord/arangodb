/* jshint globalstrict:false, strict:false, unused : false */
/* global assertEqual, assertTrue, assertFalse, assertNull, fail, AQL_EXECUTE */
// //////////////////////////////////////////////////////////////////////////////
// / @brief recovery tests for views
// /
// / @file
// /
// / DISCLAIMER
// /
// / Copyright 2010-2012 triagens GmbH, Cologne, Germany
// /
// / Licensed under the Apache License, Version 2.0 (the "License")
// / you may not use this file except in compliance with the License.
// / You may obtain a copy of the License at
// /
// /     http://www.apache.org/licenses/LICENSE-2.0
// /
// / Unless required by applicable law or agreed to in writing, software
// / distributed under the License is distributed on an "AS IS" BASIS,
// / WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// / See the License for the specific language governing permissions and
// / limitations under the License.
// /
// / Copyright holder is triAGENS GmbH, Cologne, Germany
// /
// / @author Jan Steemann
// / @author Copyright 2013, triAGENS GmbH, Cologne, Germany
// //////////////////////////////////////////////////////////////////////////////

var arangodb = require('@arangodb');
var db = arangodb.db;
var internal = require('internal');
var jsunity = require('jsunity');

function runSetup () {
  'use strict';
  internal.debugClearFailAt();

  if (internal.debugCanUseFailAt()) {
    internal.debugSetFailAt("MMFilesCompatibility33");
  }

  db._drop('UnitTestsRecoveryDummy');
  var c = db._create('UnitTestsRecoveryDummy');

  for (let i = 0; i < 1000; i++) {
    c.save({ a: "foo_" + i, b: "bar_" + i, c: i });
  }

  internal.wal.flush(true, true);

  internal.debugSegfault('crashing server');
}

// //////////////////////////////////////////////////////////////////////////////
// / @brief test suite
// //////////////////////////////////////////////////////////////////////////////

function recoverySuite () {
  'use strict';
  jsunity.jsUnity.attachAssertions();

  return {
    setUp: function () {},
    tearDown: function () {},

    // //////////////////////////////////////////////////////////////////////////////
    // / @brief test whether we can restore the trx data
    // //////////////////////////////////////////////////////////////////////////////

    testIResearchLinkPopulate: function () {
      db._dropView('UnitTestsRecoveryView');
      let view = db._createView('UnitTestsRecoveryView', 'arangosearch', {});

      var meta = { links: { 'UnitTestsRecoveryDummy': { includeAllFields: true } } };

      let expectFailure = internal.debugCanUseFailAt();
      try {
        view.properties(meta);
        assertFalse(expectFailure);
      } catch (e) {
        internal.print(JSON.stringify(e))
        if (e.errorNum !== arangodb.ERROR_ARANGO_INDEX_CREATION_FAILED){
          //throw e;
        }
      }

      var links = view.properties().links;
      if (expectFailure) {
        assertEqual(links['UnitTestsRecoveryDummy'], undefined);
      } else {
        assertNotEqual(links['UnitTestsRecoveryDummy'], undefined);
        assertTrue(links['UnitTestsRecoveryDummy'].includeAllFields);
      }

      view.drop();
      assertNull(db._view('UnitTestsRecoveryView'));
    }

  };
}

// //////////////////////////////////////////////////////////////////////////////
// / @brief executes the test suite
// //////////////////////////////////////////////////////////////////////////////

function main (argv) {
  'use strict';
  if (argv[1] === 'setup') {
    runSetup();
    return 0;
  } else {
    jsunity.run(recoverySuite);
    return jsunity.done().status ? 0 : 1;
  }
}
