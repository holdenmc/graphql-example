import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import { ApolloServer, gql } from 'apollo-server-express';
import * as fs from 'fs';

const schemaString = fs.readFileSync('./schema.graphql', 'utf8');

const schema = buildSchema(schemaString);

const users = {
    'foo': {
        id: 'foo',
        name: 'Holden'
    },
    'bar': {
        id: 'bar',
        name: 'Wojo'
    }
};

const root = {
    hello: () => 'Hello world!',
    integer: () => 2.124, // intentional error
    float: () => 2.124,
    user: (parent, args: { id: string }) => {
        return users[args.id];
    },
    updateUser: (parent, args: { id: string, data: { name: string } }, ctx, ast) => {
        users[args.id].name = args.data.name;
        return users[args.id];
    }
};

const app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

// Begin apollo section
const typeDefs = gql(schemaString);

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        integer: () => 2.124,
        float: () => 2.124,
        user: (parent, args: { id: string }) => {
            return users[args.id];
        },
    },
    Mutation: {
        updateUser: (parent, args: { id: string, data: { name: string } }, ctx, ast) => {
            users[args.id].name = args.data.name;
            return users[args.id];
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });

const apolloExpressApp = express();
server.applyMiddleware({ app: apolloExpressApp });

apolloExpressApp.listen({ port: 4001 }, () =>
    console.log('Now browse to http://localhost:4001' + server.graphqlPath)
);

