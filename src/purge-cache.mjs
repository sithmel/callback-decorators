import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'

const returnEmpty = () => []

export default function getPurgeCacheDecorator (opts = {}) {
  const cache = opts.cache
  const getCacheKeys = opts.getKeys || returnEmpty
  const getTags = opts.getTags || returnEmpty

  return function purgeCache (func) {
    const renamer = funcRenamer(`purgeCache(${func.name || 'anonymous'})`)
    return renamer(function _purgeCache (...args) {
      const context = this
      const logger = getLogger(context)
      const keys = getCacheKeys.apply(context, args)
      const tags = getTags.apply(context, args)

      const callback = function (err) {
        if (err) {
          logger('purge-cache-error', { cacheErr: err })
        } else {
          logger('purge-cache', { tags, keys })
        }
      }

      return func.apply(context, args)
        .then((res) => {
          if (tags && Array.isArray(tags) && tags.length) {
            cache.purgeByTags(tags, callback)
          } else if (keys && Array.isArray(keys) && keys.length) {
            cache.purgeByKeys(keys, callback)
          }
          return res
        })
        .catch((err) => {
          logger('purge-cache-miss', { err: err })
          throw err
        })
    })
  }
}
