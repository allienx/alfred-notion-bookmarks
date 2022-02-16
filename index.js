const CacheConf = require('cache-conf')
const dotenv = require('dotenv')

const NotionApi = require('./notion-api')

const CLEAR_CACHE = 'clear-cache'

main().catch(() => {
  process.exitCode = 1
})

async function main() {
  const inputQuery = process.argv[2]
  const env = getEnv()
  const cache = new CacheConf({ projectName: env.alfredWorkflowName })
  const cacheKey = `cache-${env.alfredWorkflowVersion}-${env.databaseId}`

  if (inputQuery && inputQuery === CLEAR_CACHE) {
    cache.clear()

    console.error('Cache cleared.')

    return
  }

  let pages = cache.get(cacheKey)

  if (!pages) {
    const notion = new NotionApi(env.integrationToken)

    pages = await notion.fetchAllResults(({ cursor }) => {
      return notion.queryDatabase(env.databaseId, { startCursor: cursor })
    })

    cache.set(cacheKey, pages, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    })
  }

  const items = [
    {
      uid: CLEAR_CACHE,
      title: 'clear cache',
      subtitle: 'Clear cached data so bookmarks are refreshed on next trigger',
      arg: CLEAR_CACHE,
    },
    ...pages.map((page) => {
      const { id, properties } = page
      const name = properties.Name.title[0].plain_text
      const url = properties.URL.url

      return {
        uid: id,
        title: name,
        subtitle: url,
        arg: url,
      }
    }),
  ]

  console.log(JSON.stringify({ items }))
}

function getEnv() {
  const alfredVersion = process.env.alfred_version
  const alfredWorkflowName =
    process.env.alfred_workflow_name || 'alfred-notion-bookmarks'
  const alfredWorkflowUid = process.env.alfred_workflow_uid
  const alfredWorkflowVersion = process.env.alfred_workflow_version

  // Load variables from .env when the script is not run by Alfred.
  if (!alfredVersion) {
    dotenv.config()
  }

  const integrationToken = process.env.integrationToken
  const databaseId = process.env.databaseId

  return {
    alfredVersion,
    alfredWorkflowName,
    alfredWorkflowUid,
    alfredWorkflowVersion,
    integrationToken,
    databaseId,
  }
}
