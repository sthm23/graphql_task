import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (fastify): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return this.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {id} = request.params;
      return this.db.posts.findOne({key: 'id', equals: id}) as Promise<PostEntity>;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const newPost = request.body;
      return this.db.posts.create(newPost);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {id} = request.params;
      return this.db.posts.delete(id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {id} = request.params;
      const updPost = request.body;
      return this.db.posts.change(id, updPost);
      // const post = await this.db.posts.findOne({key: 'id', equals: id});
      // if(!post){
      //   reply.callNotFound()
      //   return new Promise(res=>res)
      // } else {
      //   const obj = {...post, ...updPost} as PostEntity;
      //   return this.db.posts.change(id, obj);
      // }
    }
  );
};

export default plugin;
