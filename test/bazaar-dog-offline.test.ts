import CachingSearchAPI from '../src/bazaar-dog-offline'
let json = require('./data/flat_listings_good.json');
let bad = require('./data/flat_listings_bad.json');
let storeListngs = require('./data/listings.json');
let searchResults = require('./data/search_results.json');
let lightBulb = require('./data/light-bulb.json');
let bootstrap = require('./data/offline_bootstrap.json');

const api = new CachingSearchAPI();

beforeAll(() => {
  api.setup();

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
    let param = {q: '', nsfw: true, acceptedCurrencies: [''], p: 3, ps: 1}
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

  test('cache search results', async () => {

    const emptyApi = new CachingSearchAPI();
    await emptyApi.setup();
    let param = {q: '', nsfw: true, acceptedCurrencies: [''], p: 3, ps: 1}
    await emptyApi.store
      .ready()
      .then(() => {
        emptyApi.cacheSearchResults(searchResults.results);
      })
      .then(() => {
        emptyApi.buildIndex()
      });

    let results = await emptyApi.buildResponse(param)
    let all = await emptyApi.store.length()
    console.log(
      'Of all ',
      all,
      ' listings there were ',
      results.results.total,
      'matching'
    )
    expect(results.results.total).toEqual(1)
  })

  test('cache listings results', async () => {
    let profile = {
      avatarHashes: {
        tiny: 'zb2rhjRXRRP43K38D8oXr7237uf98Hvzi5RQLCkebVxDucC35'
      },
      peerID: 'QmTBVgfJ4jZdyUhdHYi73oBjupSHv7bRNjMcVYupC13sJh',
      name: 'BazaarDog'
    };
    const emptyApi = new CachingSearchAPI();
    await emptyApi.setup();
    let param = {q: '', nsfw: true, acceptedCurrencies: [''], p: 3, ps: 1}
    await emptyApi.store
      .ready()
      .then(() => {
        emptyApi.cacheStoreListings(storeListngs, profile);
      })
      .then(() => {
        emptyApi.buildIndex()
      });

    let results = await emptyApi.buildResponse(param)
    let all = await emptyApi.store.length()
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

  it('build sortBy ', () => {
    let textbox = api.getSortBy('', {
      '': 'Relevance',
      price: 'Price'
    })
    expect(textbox).toEqual({
        '': {
          label: 'Relevance',
          selected: false,
          'default': true
        }
      }
    )
  })

  it('throw an error loading a full listing ', () => {
    let profile = {
      avatarHashes: {
        tiny: 'zb2rhjRXRRP43K38D8oXr7237uf98Hvzi5RQLCkebVxDucC35'
      },
      peerID: 'QmTBVgfJ4jZdyUhdHYi73oBjupSHv7bRNjMcVYupC13sJh',
      name: 'BazaarDog'
    };

    expect(api.getFlatListingFromListing(lightBulb, profile)).toThrowErrorMatchingSnapshot({})
  })


  it('load bad data ', async () => {
    await api.store
      .ready()
      .then(() => {
        Object.keys(bad).forEach((key: string) => {
          api.store.setItem(key, bad[key])
        })
      })
      .then(() => {
        api.buildIndex()
      })

    expect(true).toBeTruthy()
  })

  // load bad json


})
