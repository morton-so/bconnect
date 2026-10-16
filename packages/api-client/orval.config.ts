import { defineConfig } from 'orval'

export default defineConfig({
  morton: {
    input: {
      target: `${process.env.API_URL}/v3/api-docs.yaml`,
      override: {
        transformer: './orval.transformer.ts',
      },
    },
    output: {
      mode: 'single',
      target: './src/generated/api.ts',
      schemas: './src/generated/schemas',
      client: 'react-query',
      mock: { generators: [{ type: 'msw', useExamples: true, baseUrl: '*', locale: 'ko' }] },
      override: {
        mutator: {
          path: './src/client.ts',
          name: 'customFetch',
        },
        query: {
          useSuspenseQuery: true,
          mutationInvalidates: [
            { onMutations: ['createPost', 'updatePost', 'deletePost'], invalidates: ['getFeeds'] },
            {
              onMutations: [
                'createTaskWorker',
                'createTaskCompany',
                'updateTaskWorker',
                'updateTaskCompany',
                'updateTaskAssignee',
                'deleteTask',
              ],
              invalidates: ['getTasks'],
            },
            {
              onMutations: ['acceptOffer', 'denyOffer'],
              invalidates: ['getTasks', 'getTaskOffers'],
            },
            {
              onMutations: ['hideRecommendation', 'showRecommendation'],
              invalidates: ['getMyReceivedRecommendations'],
            },
            {
              onMutations: ['createRecommendation', 'updateRecommendation', 'deleteRecommendation'],
              invalidates: ['getMySentRecommendations', 'getReceivedRecommendations'],
            },
            {
              onMutations: [
                'createCredential',
                'acceptCredential',
                'denyCredential',
                'deleteCredential',
                'createOneClickValidation',
              ],
              invalidates: ['getCredentials', 'getMyCredentials'],
            },
            {
              onMutations: ['acceptCoworkerRequest', 'denyCoworkerRequest'],
              invalidates: ['getReceivedCoworkerRequests', 'getCoworkers'],
            },
            {
              onMutations: ['createCoworkerRequest', 'deleteCoworkerRequest'],
              invalidates: ['getSentCoworkerRequests', 'getCoworkers'],
            },
            {
              onMutations: ['deleteCoworker'],
              invalidates: ['getCoworkers', 'getProfile', 'getMyProfile'],
            },
            { onMutations: ['updateMyMember'], invalidates: ['getMyMember'] },
            { onMutations: ['createProfile', 'createCompany'], invalidates: ['getMyMember'] },
            {
              onMutations: ['updateNotificationRead', 'updateNotificationsRead'],
              invalidates: ['getNotifications', 'getNotificationsUnreadCount'],
            },
            {
              onMutations: ['updateMyProfile', 'updateMyProfileAbout'],
              invalidates: ['getMyProfile'],
            },
            { onMutations: ['createDirectChat'], invalidates: ['getDirectChats'] },
          ],
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mock: {
          format: {
            'image-url': () => 'https://placehold.co/600x400',
          },
        },
      },
    },
  },
  zod: {
    input: {
      target: `${process.env.API_URL}/v3/api-docs.yaml`,
      override: {
        transformer: './orval.transformer.ts',
      },
    },
    output: {
      mode: 'single',
      client: 'zod',
      target: './src/generated/zod.ts',
      override: {
        zod: {
          version: 4,
          generateReusableSchemas: true,
          generate: { param: false, query: false, header: false, body: true, response: false },
          params: { path: './src/zod-messages.ts', name: 'zodParams' },
        },
      },
    },
  },
})
