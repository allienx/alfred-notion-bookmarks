const axios = require('axios')

class NotionApi {
  integrationToken = null

  constructor(integrationToken) {
    this.integrationToken = integrationToken
  }

  async queryDatabase(databaseId, { startCursor } = {}) {
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

  async fetchAllResults(queryFn) {
    const data = []

    let cursor = null
    let firstRequest = true

    while (firstRequest || !!cursor) {
      try {
        const res = await queryFn({ cursor })

        data.push(...res.results)

        cursor = res.next_cursor
      } catch (err) {
        console.error(err)

        cursor = null
      }

      firstRequest = false
    }

    return data
  }
}

module.exports = NotionApi
