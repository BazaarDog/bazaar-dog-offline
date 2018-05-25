import CachingSearchAPI from '../src/bazaar-dog-offline'
let json = require('./data/flat_listings_good.json')

const api = new CachingSearchAPI()

beforeAll(() => {
  api.setup()

  return api.store
    .ready()
    .then(() => {
      Object.keys(json).forEach((key: string) => {
        api.store.setItem(key, json[key])
      })
    })
    .then(() => {
      api.buildIndex()
    })
})

/**
 * Dummy test
 */
describe('CachingSearchAPI test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('CachingSearchAPI is instantiable', () => {
    expect(new CachingSearchAPI()).toBeInstanceOf(CachingSearchAPI)
  })

  test('test records loaded', async () => {
    let l = await api.store.length()
    expect(l).toEqual(41)
  })

  test('return something reasonable no params', async () => {
    let param = {}
    let results = await api.buildResponse(param)
    let all = await api.store.length()
    console.log(
      'Of all ',
      all,
      ' listings there were ',
      results.results.total,
      'matching'
    )
    expect(results.results.total).toBeGreaterThan(1)
  })

  test('do search', async () => {
    let param = {
      q: 'a',
      nsfw: false,
      acceptedCurrencies: ['BCH'],
      p: 1,
      ps: 5
    }
    let results = await api.buildResponse(param)
    let all = await api.store.length()
    console.log(
      'Of all ',
      all,
      ' listings there were ',
      results.results.total,
      'matching'
    )
    expect(results.results.total).toBeGreaterThan(1)
  })

  test('do inverse search', async () => {
    let param = { q: '', nsfw: true, acceptedCurrencies: [''], p: 3, ps: 1 }
    let results = await api.buildResponse(param)
    let all = await api.store.length()
    console.log(
      'Of all ',
      all,
      ' listings there were ',
      results.results.total,
      'matching'
    )
    expect(results.results.total).toEqual(1)
  })

  it('build checkbox ', () => {
    let textbox = api.buildCheckbox(true, 'test')
    expect(textbox).toEqual([
      {
        value: true,
        label: 'test',
        checked: true,
        default: false
      }
    ])
  })

  it('build buildOptions ', () => {
    let textbox = api.buildOptions(false, {
      false: 'Hide',
      true: 'Show'
    })
    expect(textbox).toEqual([
      {
        value: 'false',
        label: 'Hide',
        checked: false,
        default: false
      },
      {
        value: 'true',
        label: 'Show',
        checked: false,
        default: false
      }
    ])
  })

  // load bad json

  // cache listing
  // cache store
  // cahce search
})
