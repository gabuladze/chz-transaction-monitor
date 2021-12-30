module.exports = {
  get: {
    tags: [
      'Transactions'
    ],
    summary: 'Fetch totals',
    description: 'This endpoint returns total tokens transfered since the start of the app.',
    operationId: 'getTotals',
    responses: {
      200: {
        description: 'successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                totalTokensTransfered: {
                  type: 'number'
                },
                totalTokensTransferedNative: {
                  type: 'number'
                }
              }
            },
            example: {
              totalTokensTransfered: 0,
              totalTokensTransferedNative: 0
            }
          }
        }
      }
    }
  }
}
