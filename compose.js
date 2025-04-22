import { readFileSync } from "fs"
import { parse } from "graphql";
import {
  composeServices,
  compositionHasErrors,
} from "@theguild/federation-composition";

const result = composeServices([
  {
    url: "http://subgraphs:4002/graphql",
    name: "a",
    typeDefs: parse(readFileSync("./a-schema.graphql", { encoding: "utf-8" })),
  },
  {
    url: "http://subgraphs:4001/graphql",
    name: "b",
    typeDefs: parse(readFileSync("./b-schema.graphql", { encoding: "utf-8" })),
  },
]);

if (compositionHasErrors(result)) {
  console.error(result.errors);
} else {
  console.log(result.supergraphSdl);
}
