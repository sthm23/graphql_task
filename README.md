## Assignment: Graphql
### Tasks:
1. Add logic to the restful endpoints (users, posts, profiles, member-types folders in ./src/routes).  
   1.1. npm run test - 100%  
2. Add logic to the graphql endpoint (graphql folder in ./src/routes).  
Constraints and logic for gql queries should be done based on restful implementation.  
For each subtask provide an example of POST body in the PR.  
All dynamic values should be sent via "variables" field.  
If the properties of the entity are not specified, then return the id of it.  
`userSubscribedTo` - these are users that the current user is following.  
`subscribedToUser` - these are users who are following the current user.  
   
   * Get gql requests:  
   2.1. Get users, profiles, posts, memberTypes - 4 operations in one query.  
   2.2. Get user, profile, post, memberType by id - 4 operations in one query.  
   2.3. Get users with their posts, profiles, memberTypes.  
   2.4. Get user by id with his posts, profile, memberType.  
   2.5. Get users with their `userSubscribedTo`, profile.  
   2.6. Get user by id with his `subscribedToUser`, posts.  
   2.7. Get users with their `userSubscribedTo`, `subscribedToUser` (additionally for each user in `userSubscribedTo`, `subscribedToUser` add their `userSubscribedTo`, `subscribedToUser`).  
   * Create gql requests:   
   2.8. Create user.  
   2.9. Create profile.  
   2.10. Create post.  
   2.11. [InputObjectType](https://graphql.org/graphql-js/type/#graphqlinputobjecttype) for DTOs.  
   * Update gql requests:  
   2.12. Update user.  
   2.13. Update profile.  
   2.14. Update post.  
   2.15. Update memberType.  
   2.16. Subscribe to; unsubscribe from.  
   2.17. [InputObjectType](https://graphql.org/graphql-js/type/#graphqlinputobjecttype) for DTOs.  

3. Solve `n+1` graphql problem with [dataloader](https://www.npmjs.com/package/dataloader) package in all places where it should be used.  
   You can use only one "findMany" call per loader to consider this task completed.  
   It's ok to leave the use of the dataloader even if only one entity was requested. But additionally (no extra score) you can optimize the behavior for such cases => +1 db call is allowed per loader.  
   3.1. List where the dataloader was used with links to the lines of code (creation in gql context and call in resolver).  
4. Limit the complexity of the graphql queries by their depth with [graphql-depth-limit](https://www.npmjs.com/package/graphql-depth-limit) package.   
   4.1. Provide a link to the line of code where it was used.  
   4.2. Specify a POST body of gql query that ends with an error due to the operation of the rule. Request result should be with `errors` field (and with or without `data:null`) describing the error.  

### Description:  
All dependencies to complete this task are already installed.  
You are free to install new dependencies as long as you use them.  
App template was made with fastify, but you don't need to know much about fastify to get the tasks done.  
All templates for restful endpoints are placed, just fill in the logic for each of them.  
Use the "db" property of the "fastify" object as a database access methods ("db" is an instance of the DB class => ./src/utils/DB/DB.ts).  
Body, params have fixed structure for each restful endpoint due to jsonSchema (schema.ts files near index.ts).  

### Description for the 1 task:
If the requested entity is missing - send 404 http code.  
If operation cannot be performed because of the client input - send 400 http code.  
You can use methods of "reply" to set http code or throw an [http error](https://github.com/fastify/fastify-sensible#fastifyhttperrors).  
If operation is successfully completed, then return an entity or array of entities from http handler (fastify will stringify object/array and will send it).  

Relation fields are only stored in dependent/child entities. E.g. profile stores "userId" field.  
You are also responsible for verifying that the relations are real. E.g. "userId" belongs to the real user.  
So when you delete dependent entity, you automatically delete relations with its parents.  
But when you delete parent entity, you need to delete relations from child entities yourself to keep the data relevant.   
(In the next rss-school task, you will use a full-fledged database that also can automatically remove child entities when the parent is deleted, verify keys ownership and instead of arrays for storing keys, you will use additional "join" tables)  

To determine that all your restful logic works correctly => run the script "npm run test".  
But be careful because these tests are integration (E.g. to test "delete" logic => it creates the entity via a "create" endpoint).  

### Description for the 2 task:  
You are free to create your own gql environment as long as you use predefined graphql endpoint (./src/routes/graphql/index.ts).  
(or stick to the [default code-first](https://github.dev/graphql/graphql-js/blob/ffa18e9de0ae630d7e5f264f72c94d497c70016b/src/__tests__/starWarsSchema.ts))  

### Description for the 3 task:
If you have chosen a non-default gql environment, then the connection of some functionality may differ, be sure to report this in the PR.  

### Description for the 4 task:  
If you have chosen a non-default gql environment, then the connection of some functionality may differ, be sure to report this in the PR.  
Limit the complexity of the graphql queries by their depth with "graphql-depth-limit" package.  
E.g. User can refer to other users via properties `userSubscribedTo`, `subscribedToUser` and users within them can also have `userSubscribedTo`, `subscribedToUser` and so on.  
Your task is to add a new rule (created by "graphql-depth-limit") in [validation](https://graphql.org/graphql-js/validation/) to limit such nesting to (for example) 6 levels max.


```
2.1
query{
    users{id firstName}
    profiles{id}
    posts{id}
    memberTypes{id}
}
2.2
query($userId: ID!, $postId: ID!, $profileId: ID!, $memberTypeId: String!){
    user(id: $userId){
        id
        firstName
    }
    post(id: $postId) {
        title
    }
    profile(id: $profileId) {
        id
        country
    }
    memberType(id: $memberTypeId) {
        id
    }
}
variables
{
    "userId": "a26c4a6c-575c-4b21-ade2-19c858f07ad9",
    "postId": "cf738ec8-7950-4085-929b-254045f0c0b2",
    "profileId": "25f11613-62a1-4111-ab67-a1ee4fba63c9",
    "memberTypeId": "basic"
}

2.3
query{
    users{
        id
        firstName
        userPost{id}
        userProfile{id memberTypeId}
        userMemberType{id}

    }
}
2.4
query($id: ID!){
    user(id: $id){
        id
        firstName
        userProfile{id}
        userPost{id}
        userMemberType{id}  
    }
}
variables 
{
    "id": "d18a5914-a694-4320-bb0b-3601447eaa8b"
}

2.5
query{
    users{
        id 
        subscribedToUserIds 
        userProfile{
            id 
        }
        userSubscribedTo{
            id firstName
        }
    }
}

variables
{
    "id": "d15b30a0-189b-452a-9124-95198d01de3e"
}
2.6
query($id:ID!){
    user(id:$id){
        id 
        subscribedToUserIds 
        userPost{
            id 
        }
        userSubscribedTo{
            id firstName
        }
    }
}
variables
{
    "id": "05594071-15e5-4650-a9e6-6f3cc858d2b1"
}
2.7
query{
    users{
        id 
        subscribedToUserIds 
        userProfile{
            id 
        }
        userSubscribedTo{
            id firstName
        }
        subscribedToUser{
            id firstName
        }
    }
}
{
    "id": "4dee9d25-b6c9-4c51-9bc8-a6a0f332613e"
}
2.8 mutations
mutation($input: CreateUserType!){
    createUser(input: $input) {
        id
        firstName
    }
}
{
    "input": {
        "firstName": "user3",
        "lastName": "user1",
        "email": "user1"
    }
}
2.9
mutation($input: CreateProfileType!){
    createProfile(input: $input) {
        id
        avatar
    }
}
variables
{
    "input": {
        "userId": "20f29832-e74b-4029-880a-8509748de09f",
        "avatar": "user1",
        "sex": "user1",
        "birthday": 23,
        "country": "user12",
        "city": "user12",
        "street": "user12",
        "memberTypeId": "basic"
    }
}
2.10
mutation($input: CreatePostType!){
    createPost(input: $input) {
        id
        userId
    }
}
variables
{
    "input": {
        "title": "post1",
        "content": "post1",
        "userId": "20f29832-e74b-4029-880a-8509748de09f"
    }
}
2.12
mutation($input: CreateUserType!){
    createUser(input: $input) {
        id
        firstName
    }
}
variables 
{
    "input": {
        "firstName": "user1",
        "lastName": "user1",
        "email": "user1"
    }
}
2.13
mutation($input: UpdateProfileType!){
    updateProfile(input: $input) {
        id
        avatar
    }
}
variables
{
    "input": {
        "id": "a6723e6b-2fe8-41e6-b912-18b40f26f439",
        "userId": "beb9ba89-7efb-4818-b03b-5f75aeedfd03",
        "avatar": "user12",
        "sex": "user21",
        "birthday": 23,
        "country": "user12",
        "city": "user12",
        "street": "user12",
        "memberTypeId": "basic"
    }
}
2.14
mutation($input: UpdatePostType!){
    updatePost(input: $input) {
        id
        userId
        title
    }
}
variables
{
    "input": {
        "id": "93a23cc1-ae5d-4737-851b-15dcbb63da5f",
        "title": "22",
        "content": "post12",
        "userId": "beb9ba89-7efb-4818-b03b-5f75aeedfd03"
    }
}
2.15
mutation($input: UpdateMemberType!){
    updateMemberType(input: $input) {
        id
        monthPostsLimit
    }
}
variables
{
    "input": {
        "id": "basic",
        "discount": 10,
        "monthPostsLimit": 20
    }
}
2.16
mutation($input: SubscribeType!){
    subscribeTo(input: $input) {
        id
        fistName
    }
}
variables
{
    "input": {
        "id": "93a23cc1-ae5d-4737-851b-15dcbb63da5f",
        "userId": "beb9ba89-7efb-4818-b03b-5f75aeedfd03"
    }
}
2.16
mutation($input: UnSubscribeType!){
    unsubscribeFrom(input: $input) {
        id
        fistName
    }
}
variables
{
    "input": {
        "id": "93a23cc1-ae5d-4737-851b-15dcbb63da5f",
        "userId": "beb9ba89-7efb-4818-b03b-5f75aeedfd03"
    }
}

```
все ID userId вам нужно будет поменять на свои при создания нового user post profiles зависимости от нужды.
есть еще postman шаблон которым я проводил и сохранил для проверки. Можете импортировать свой postman. 