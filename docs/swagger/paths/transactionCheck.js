module.exports = {
  get: {
    tags: [
      'Transactions'
    ],
    summary: 'Check if transaction interacts with token contract',
    description: 'This endpoint returns whether the transaction with hash `transactionhash` interacts with token contract.',
    operationId: 'checkTransactions',
    parameters: [
      {
        name: 'hash',
        in: 'path',
        description: 'Transaction hash',
        required: true,
        schema: {
          type: 'string'
        }
      }
    ],
    responses: {
      200: {
        description: 'successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                isTokenTransaction: {
                  type: 'boolean'
                }
              }
            },
            example: {
              isTokenTransaction: true
            }
          }
        }
      }
    }
  }
}
