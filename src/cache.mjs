import { getLogger } from './add-logger'
import funcRenamer from './utils/func-renamer'
import { CacheRAM } from 'memoize-cache'

export default function getCacheDecorator (opts = {}) {
  const cacheObj = opts.cache || new CacheRAM(opts)
  return function cache (func) {
    const renamer = funcRenamer(`cache(${func.name || 'anonymous'})`)
    return renamer(function _cache (...args) {
      const context = this
      const logger = getLogger(context)

      return new Promise((resolve, reject) => {
        cacheObj.query(args, function (err, cacheQuery) {
          if (err) {
            logger('cache-error', { cacheErr: err })
            func.apply(context, args).then(resolve).catch(reject)
          } else if (cacheQuery.cached === true && !cacheQuery.stale) {
            logger('cache-hit', { key: cacheQuery.key, result: cacheQuery, timing: cacheQuery.timing })
            resolve(cacheQuery.hit)
          } else if (cacheQuery.key === null) { // no cache
            func.apply(context, args).then(resolve).catch(reject)
          } else {
            logger('cache-miss', { key: cacheQuery.key, timing: cacheQuery.timing })
            func.apply(context, args)
              .then(res => {
                const key = cacheObj.push(args, res)
                if (key) {
                  logger('cache-set', { key: key.key, tags: key.tags, args: args, res: res })
                }
                resolve(res)
              })
              .catch(reject)
          }
        })
      })
    })
  }
}
