////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2017 ArangoDB GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Andrey Abramov
/// @author Vasiliy Nabatchikov
////////////////////////////////////////////////////////////////////////////////

#ifndef TESTS_IRESEARCH__COMMON_H
#define TESTS_IRESEARCH__COMMON_H 1

#include "Aql/Query.h"
#include "Aql/AstNode.h"

#include <string>
#include <vector>

struct TRI_vocbase_t;

namespace v8 {
class Isolate; // forward declaration
}

namespace arangodb {

namespace aql {
class ExpressionContext;
}

namespace iresearch {
class ByExpression;
}

namespace tests {

void init(bool withICU = false);
v8::Isolate* v8Isolate();

bool assertRules(
  TRI_vocbase_t& vocbase,
  std::string const& queryString,
  std::vector<int> expectedRulesIds
);

std::unique_ptr<arangodb::aql::AstNode> parseQuery(
  TRI_vocbase_t& vocbase,
  std::string const& queryString
);

arangodb::aql::QueryResult executeQuery(
  TRI_vocbase_t& vocbase,
  std::string const& queryString
);

std::unique_ptr<arangodb::aql::ExecutionPlan> planFromQuery(
  TRI_vocbase_t& vocbase,
  std::string const& queryString
);

}
}

#endif