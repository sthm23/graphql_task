import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, graphql, GraphQLNonNull, GraphQLInputObjectType } from 'graphql';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const {mutation, query, variables} = request.body;
      const source = (mutation || query) as string;

      const UsersType = new GraphQLObjectType({
        name: 'Users',
        fields: () => ({
          id: { type: GraphQLID },
          firstName: { type: GraphQLString },
          lastName: { type: GraphQLString },
          email: { type: GraphQLString },
          subscribedToUserIds: {
            type: new GraphQLList(GraphQLString)
          },
          userPost: {
            type: new GraphQLList(PostsType),
            async resolve(parent, args, contextValue, info) {
              return contextValue.db.posts.findMany({key: 'userId', equals: parent.id})
            }
          },

          userProfile: {
            type: new GraphQLList(ProfilesType),
            async resolve(parent, args, contextValue, info) {
              return contextValue.db.profiles.findMany({key: 'userId', equals: parent.id});
            }
          },
          userMemberType: {
            type: MemberTypes,
            async resolve(parent, args, contextValue, info) {
              const profiles = (await fastify.db.profiles.findMany()).filter((profile: ProfileEntity)=> profile.userId === parent.id)[0]?.memberTypeId;
              return contextValue.db.memberTypes.findOne({key: 'id', equals: profiles || '' })
            }
          },
          userSubscribedTo: {
            type: new GraphQLList(UserSubscribedToType),
            async resolve(parent, args, contextValue, info) {
              const userSub = (await contextValue.db.users.findMany()).filter((user:UserEntity)=> user.subscribedToUserIds.includes(parent.id));
              return userSub
            }
          },
          subscribedToUser: {
            type: new GraphQLList(UserSubscribedToType),
            async resolve(parent, args, contextValue, info) {
              const userSub = (await contextValue.db.users.findMany()).filter((user:UserEntity)=> parent.subscribedToUserIds.includes(user.id));
              return userSub
            }
          }
        }),
      });

      const UserSubscribedToType = new GraphQLObjectType({
        name: 'UserSubscribedToType',
        fields: () => ({
          id: { type: GraphQLID },
          firstName: { type: GraphQLString },
          lastName: { type: GraphQLString },
          email: { type: GraphQLString },
        }),
      });

      const PostsType = new GraphQLObjectType({
        name: 'Posts',
        fields: () => ({
          id: { type: GraphQLID },
          title: { type: GraphQLString },
          content: { type: GraphQLString },
          userId: { type: GraphQLString },
        }),
      });

      const MemberTypes = new GraphQLObjectType({
        name: 'MemberTypes',
        fields: () => ({
          id: { type: GraphQLString },
          discount: { type: GraphQLInt },
          monthPostsLimit: { type: GraphQLInt }
        }),
      });

      const ProfilesType = new GraphQLObjectType({
        name: 'Profiles',
        fields: () => ({
          id: { type: GraphQLID },
          userId: { type: GraphQLString },
          avatar: { type: GraphQLString },
          sex: { type: GraphQLString },
          birthday: { type: GraphQLInt },
          country: { type: GraphQLString },
          street: { type: GraphQLString },
          city: { type: GraphQLString },
          memberTypeId: { type: GraphQLString }
        }),
      });

      const Query = new GraphQLObjectType({
        name: 'query',
        fields: {
          user: {
            type: UsersType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args, contextValue, info) {
              return fastify.db.users.findOne({key: 'id', equals: args.id!});
            },
          },
          users: {
            type: new GraphQLList(UsersType),
            async resolve(parent, args, contextValue, info) {
              return fastify.db.users.findMany();
            }
          },
          posts: {
            type: new GraphQLList(PostsType),
            resolve(parent, args) {
              return fastify.db.posts.findMany();
            }
          },
          post: {
            type: PostsType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
              return fastify.db.posts.findOne({key: 'id', equals: args.id!});
            },
          },
          profile: {
            type: ProfilesType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve(parent, args) {
              return fastify.db.profiles.findOne({key: 'id', equals: args.id!});
            }
          },
          profiles: {
            type: new GraphQLList(ProfilesType),
            resolve(parent, args) {
              return fastify.db.profiles.findMany();
            }
          },
          memberType: {
            type: MemberTypes,
            args: { id: { type: new GraphQLNonNull(GraphQLString) } },
            resolve(parent, args) {
              return fastify.db.memberTypes.findOne({key: 'id', equals: args.id});
            },
          },
          memberTypes: {
            type: new GraphQLList(MemberTypes),
            resolve(parent, args) {
              return fastify.db.memberTypes.findMany();
            }
          },
        }
      });

      const CreateUserType = new GraphQLInputObjectType({
        name: 'CreateUserType',
        fields: {
          firstName: { type: new GraphQLNonNull(GraphQLString) },
          lastName: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
        }
      })
      const CreatePostType = new GraphQLInputObjectType({
        name: 'CreatePostType',
        fields: {
          title: { type: new GraphQLNonNull(GraphQLString) },
          content: { type: new GraphQLNonNull(GraphQLString) },
          userId: { type: new GraphQLNonNull(GraphQLID) },
        }
      })
      const CreateProfileType = new GraphQLInputObjectType({
        name: 'CreateProfileType',
        fields: {
          userId: { type: new GraphQLNonNull(GraphQLID) },
          avatar: { type: new GraphQLNonNull(GraphQLString) },
          sex: { type: new GraphQLNonNull(GraphQLString) },
          birthday: { type: new GraphQLNonNull(GraphQLInt) },
          country: { type: new GraphQLNonNull(GraphQLString) },
          street: { type: new GraphQLNonNull(GraphQLString) },
          city: { type: new GraphQLNonNull(GraphQLString) },
          memberTypeId: { type: new GraphQLNonNull(GraphQLString) }
        }
      })

      const UpdateUserType = new GraphQLInputObjectType({
        name: 'UpdateUserType',
        fields: {
          id: { type: GraphQLID },
          firstName: { type: GraphQLString },
          lastName: { type: GraphQLString },
          email: { type: GraphQLString },
        }
      })
      const UpdatePostType = new GraphQLInputObjectType({
        name: 'UpdatePostType',
        fields: {
          id: { type: GraphQLID },
          title: { type: GraphQLString },
          content: { type: GraphQLString },
          userId: { type: GraphQLID },
        }
      })
      const UpdateProfileType = new GraphQLInputObjectType({
        name: 'UpdateProfileType',
        fields: {
          id: { type: GraphQLID },
          userId: { type: GraphQLID },
          avatar: { type: GraphQLString },
          sex: { type: GraphQLString },
          birthday: { type: GraphQLInt },
          country: { type: GraphQLString },
          street: { type: GraphQLString },
          city: { type: GraphQLString },
          memberTypeId: { type: GraphQLString }
        }
      })
      const UpdateMemberType = new GraphQLInputObjectType({
        name: 'UpdateMemberType',
        fields: {
          id: { type: GraphQLString },
          monthPostsLimit: { type: GraphQLInt },
          discount: { type: GraphQLInt }
        }
      })

      const UnSubscribeType = new GraphQLInputObjectType({
        name: 'UnSubscribeType',
        fields: {
          id: { type: GraphQLString },
          userId: { type: GraphQLID }
        }
      })

      const SubscribeType = new GraphQLInputObjectType({
        name: 'SubscribeType',
        fields: {
          id: { type: GraphQLString },
          userId: { type: GraphQLID }
        }
      })

      const Mutation = new GraphQLObjectType({
        name: 'mutation',
        fields: {
          createUser: {
            type: UsersType,
            args: { input: {type: CreateUserType}},
            async resolve(parent, args, contextValue) {
              return contextValue.db.users.create(args.input);
            }
          },
          createPost: {
            type: ProfilesType,
            args: { input: {type: CreatePostType}},
            resolve(parent, args, contextValue) {
              return contextValue.db.posts.create(args.input);
            }
          },
          createProfile: {
            type: ProfilesType,
            args: {input: {type: CreateProfileType}},
            resolve(parent, args, contextValue) {
              return contextValue.db.profiles.create(args.input);
            }
          },
          updateUser: {
            type: UsersType,
            args: {input: {type: UpdateUserType}},
            async resolve(parent, args, contextValue) {
              const user = await contextValue.db.users.findOne({key:'id', equals: args.input.id});
              return contextValue.db.users.change(args.input.id, {...user, ...args.input});
            }
          },
          updateProfile: {
            type: ProfilesType,
            args: { input: {type: UpdateProfileType}},
            async resolve(parent, args, contextValue) {
              const profile = await contextValue.db.profiles.findOne({key:'id', equals: args.input.id});
              return contextValue.db.profiles.change(args.input.id, {...profile, ...args.input});
            }
          },
          updatePost: {
            type: PostsType,
            args: { input: {type: UpdatePostType}},
            async resolve(parent, args, contextValue) {
              const post = await contextValue.db.posts.findOne({key:'id', equals: args.input.id});
              return contextValue.db.posts.change(args.input.id, {...post, ...args.input});
            }
          },
          updateMemberType: {
            type: MemberTypes,
            args: { input: {type: UpdateMemberType}},
            async resolve(parent, args, contextValue) {
              const memberType = await contextValue.db.memberTypes.findOne({key:'id', equals: args.input.id});
              return contextValue.db.memberTypes.change(args.input.id, {...memberType, ...args.input});
            }
          },

          subscribeTo: {
            type: UsersType,
            args: {input: {type: SubscribeType}},
            async resolve(parent, args, contextValue) {
              const subUser = await contextValue.db.users.findOne({key: 'id', equals: args.input.userId});
              subUser.subscribedToUserIds.push(args.input.id)
              return contextValue.db.users.change(args.input.userId, subUser);
            }
          },

          unsubscribeFrom: {
            type: UsersType,
            args: {input: {type: UnSubscribeType}},
            async resolve(parent, args, contextValue) {
              const user = await contextValue.db.users.findOne({key: 'id', equals: args.input.userId});
              const arr = user.subscribedToUserIds.filter((el:UserEntity)=>el !== args.input.id);
              user.subscribedToUserIds = arr;
              return contextValue.db.users.change(args.input.userId, user);
            }
          }

        },
      })

      const schema = new GraphQLSchema({query:Query, mutation: Mutation});
      return graphql({schema, source, variableValues: variables, contextValue: fastify});
    }
  );
};

export default plugin;
