## Reproduction of issue with INTERFACE_OBJECT_USAGE_ERROR when using @interfaceObject and contributing fields to an implementing type

### Issue Description

Composition fails when trying to compose a supergraph where one of the subgraph is referencing an interface from the other subgraph with the @interfaceObject directive and is also extending one of the implementing types with a field.
The interface is not extended with any fields, it just needs to be defines so that it can be used in queries of the subgraph. This setup gives the INTERFACE_OBJECT_USAGE_ERROR with the error message
`Interface type "Media" is defined as an @interfaceObject in subgraph "b" so that subgraph should not define any of the implementation types of "Media", but it defines type "Movie"`

The [documentation](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/entities/interfaces) says that
'_If a subgraph contributes entity fields via @interfaceObject, it "gives up" the ability to contribute fields to any individual entity that implements that interface._'

But in this case, no fields are contributed to the interface via @interfaceObject. Perhaps the [compose validation](https://github.com/apollographql/federation/blob/b4cee32604a5a8996ddeb8db58e2b43477b8dcc8/composition-js/src/merging/merge.ts#L2414) is a bit too restrictive in this case.

### Steps to Reproduction
Run the following to see the composition error
```bash
yarn install
yarn compose
```

The following schemas can be used for reproduction
<table>
<tr>
<td>
Subgraph A
</td>
<td>
Subgraph B
</td>
</tr>
<tr>
<td>

```graphql
interface Media @key(fields: "id") {
  id: ID!
  title: String!
}

type Book implements Media @key(fields: "id") {
  id: ID!
  title: String!
}

type Movie implements Media @key(fields: "id") {
  id: ID!
  title: String!
}
```
</td>
<td>

```graphql
type Media @key(fields: "id", resolvable: false) @interfaceObject {
  id: ID!
}

type Movie @key(fields: "id") {
  id: ID!
  imdbScore: Int!
}

type Query {
  numberOneMedia: Media!
}
```
</td>
</tr>
</table>

### The Guild Composition
For reference, the same schemas _can_ be composed into a supergraph with the compose tool from https://github.com/graphql-hive/federation-composition 

Running 
```bash
yarn install
yarn compose-the-guild
```
will produce a valid supergraph with the following conceptual schema
```graphql
type Book implements Media @join__type(graph: A, key: "id")  @join__implements(graph: A, interface: "Media")  {
  id: ID!
  title: String!
}

type Movie implements Media @join__type(graph: A, key: "id")  @join__type(graph: B, key: "id")  @join__implements(graph: A, interface: "Media")  {
  id: ID!
  title: String! @join__field(graph: A) 
  imdbScore: Int! @join__field(graph: B) 
}

type Query @join__type(graph: A)  @join__type(graph: B)  {
  numberOneMedia: Media! @join__field(graph: B) 
}

interface Media @join__type(graph: A, key: "id")  @join__type(graph: B, key: "id", resolvable: false, isInterfaceObject: true)  {
  id: ID!
  title: String! @join__field(graph: A) 
}

```
