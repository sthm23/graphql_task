import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql, buildSchema } from 'graphql';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const source = request.body.query!

      const schema = buildSchema(`
                          type Query {
                              profiles: [Profiles]
                              posts: [Posts]
                              users: [Users]
                              memberTypes: [MemberTypes]
                          }

                          type Users {
                              id: ID
                              firstName: String!
                              lastName: String!
                              email: String!
                              subscribedToUserIds: [String]
                          }

                          type Posts {
                              title: String
                              content: String
                              userId: ID!
                              id: ID!
                          }

                          type Profiles {
                              id: ID!
                              avatar: String
                              sex: String
                              birthday: Int
                              country: String
                              street: String
                              city: String
                              userId: ID!
                              memberTypeId: ID!
                          }
                          type MemberTypes {
                              id: String
                              discount: Int
                              monthPostsLimit: Int
                          }


      `);

      const rootValue = {

        posts: () => {
          return this.db.posts.findMany();
        },

        users: () => {
          return this.db.users.findMany();
        },

        memberTypes: () => {
          return this.db.memberTypes.findMany();
        },

        profiles: () => {
          return this.db.profiles.findMany();
        },

        createUser: (firstName:string, lastName:string, email:string) => {
          const obj = {firstName, lastName, email}
          return this.db.users.create(obj);
        }
      };

      return graphql({schema, source, rootValue})
    }
  );
};

export default plugin;
