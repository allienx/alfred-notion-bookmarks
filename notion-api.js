const axios = require('axios')

class NotionApi {
  integrationToken = null

  constructor(integrationToken) {
    this.integrationToken = integrationToken
  }

  async queryDatabase(databaseId, { allPages = false, startCursor } = {}) {
    const url = `https://api.notion.com/v1/databases/${databaseId}/query`
    const headers = {
      'Notion-Version': '2021-08-16',
      Authorization: `Bearer ${this.integrationToken}`,
    }
    const body = {
      page_size: 100,
      sorts: [
        {
          property: 'Name',
          direction: 'ascending',
        },
      ],
    }

    if (startCursor) {
      body.start_cursor = startCursor
    }

    const result = await axios.post(url, body, { headers })

    return result.data
  }
}

module.exports = NotionApi
