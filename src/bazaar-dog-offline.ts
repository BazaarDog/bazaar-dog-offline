// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import localForage from 'localforage'
import md5 from 'blueimp-md5'

import {
  DocumentIndex,
  DocumentIndexOptions,
  SearchResult as IndexSearchResult
} from 'ndx'

export interface Map<T> {
  [key: string]: T
}

export interface PubKeys {
  identity: string
  bitcoin: string
}

export interface PeerId {
  peerID: string
  pubkeys: PubKeys
  bitcoinSig: string
}

export interface ListingDetailCoupon {
  title: string
  hash: string
  percentDiscount: string
}

export interface ListingDetailShippingOptionService {
  name: string
  price: number
  estimatedDelivery: string
  additionalItemPrice: number
}

export interface ListingDetailShippingOption {
  name: string
  type: string
  regions: Array<string>
  services: Array<ListingDetailShippingOptionService>
}

export interface ListingDetailOptionVariant {
  name: string
}

export interface ListingDetailOption {
  name: string
  variants: Array<ListingDetailOptionVariant>
}

export interface ListingDetailSku {
  variantCombo: Array<number>
}

export interface ListingDetailItem {
  title: string
  description: string
  price: number
  tags: Array<string>
  images: Array<Thumbnails>
  categories: Array<string>
  condition: string
  options: Array<ListingDetailOption>
  skus: Array<ListingDetailSku>
}

export interface ListingDetailMetadata {
  version: number
  contractType: string
  format: string
  expiry: Date
  acceptedCurrencies: Array<string>
  pricingCurrency: string
  escrowTimeoutHours: number
}

export interface ListingFull {
  slug: string
  vendorID: PeerId
  metadata: ListingDetailMetadata
  item: ListingDetailItem
  shippingOptions: Array<ListingDetailShippingOption>
  coupons: Array<ListingDetailCoupon>
  moderators: Array<string>
  termsAndConditions: string
  refundPolicy: string
}

export interface ListingFlatIT {
  id: string
  peerID: string
  slug: string
  title: string
  description: string
  nsfw: boolean
  contractType: number
  profileName: string
  profileAvatar?: string
  pricingCurrency: string
  acceptedCurrencies: Array<string>
  price: number
  ratingCount: number
  averageRating: number
  thumbnail?: string
}

export class ListingFlat implements ListingFlatIT {
  id: string
  peerID: string
  slug: string
  title: string
  description: string
  nsfw: boolean
  contractType: number
  profileName: string
  profileAvatar?: string
  pricingCurrency: string
  acceptedCurrencies: Array<string>
  price: number
  ratingCount: number
  averageRating: number
  thumbnail?: string

  constructor(l: ListingFlatIT) {
    this.id = l.id
    this.peerID = l.peerID
    this.slug = l.slug
    this.title = l.title
    this.description = l.description
    this.nsfw = l.nsfw
    this.contractType = l.contractType
    this.profileName = l.profileName
    this.profileAvatar = l.profileAvatar
    this.pricingCurrency = l.pricingCurrency
    this.acceptedCurrencies = l.acceptedCurrencies
    this.price = l.price
    this.ratingCount = l.ratingCount
    this.averageRating = l.averageRating
    this.thumbnail = l.thumbnail
  }

  asSearchResult(): ListingSearchResult {
    let x: ListingSearchResult = {
      data: {
        title: this.title,
        slug: this.slug,
        description: this.description,
        averageRating: this.averageRating,
        acceptedCurrencies: this.acceptedCurrencies,
        ratingCount: this.ratingCount,
        contractType: this.ratingCount,
        nsfw: this.nsfw,
        price: {
          amount: this.price,
          currencyCode: this.pricingCurrency
        },
        thumbnail: {
          small: this.thumbnail
        }
      },
      relationships: {
        moderators: [],
        vendor: {
          data: {
            peerID: this.peerID,
            name: this.profileName,
            avatarHashes: {
              tiny: this.profileAvatar
            }
          }
        }
      },
      type: 'listing'
    }
    return x
  }
}

export interface ListingSearchResult {
  data: Listing
  relationships: Relationships
  type: string
}

export interface Relationships {
  moderators: Array<string>
  vendor: VendorWrap
}

export interface Price {
  currencyCode: string
  amount: number
}

export interface Thumbnails {
  tiny?: string
  small?: string
  medium?: string
  large?: string
  original?: string
  filename?: string
}

export interface ProfileSocial {
  type: string
  username: string
  proof: string
}

export interface ProfileContactInfo {
  website: string
  email: string
  social: ProfileSocial
}

export interface Profile {
  avatarHashes: Thumbnails
  about?: string
  headerHashes?: Thumbnails
  averageRating?: number
  contactInfo?: ProfileContactInfo
  location?: string
  moderator?: boolean
  moderatorInfo?: ProfileModeratorInfo
  shortDescription?: string
  name: string
  peerID: string
  nsfw?: boolean
  vendor?: boolean
}

export interface Listing {
  title: string
  slug: string
  description: string
  acceptedCurrencies: Array<string>
  averageRating: number
  ratingCount: number
  contractType: number
  nsfw: boolean
  thumbnail: Thumbnails
  price: Price
}

export interface ProfileModeratorInfoFee {
  fixedFee: Price
  percentage: number
  feeType: string
}

export interface ProfileModeratorInfo {
  description: string
  languages: Array<string>
  acceptedCurrencies: Array<string>
  fee: ProfileModeratorInfoFee
}

export interface SearchResults {
  results: Array<ListingSearchResult>
  hasMore: boolean
  total: number
}

export interface VendorWrap {
  data: Profile
}

export default class CachingSearchAPI {
  endpointName: string
  acceptedCurrenciesMap: Map<string>
  nsfwMap: Map<string>
  cache: Map<ListingFlat>
  store: LocalForage
  searchApi: DocumentIndex<string, DocumentIndexOptions>

  constructor() {
    localForage.config({
      driver: [
        localForage.INDEXEDDB,
        localForage.WEBSQL,
        localForage.LOCALSTORAGE
      ],
      name: 'OfflineSearch',
      version: 1.0,
      storeName: 'BazaarDogOffline', // Should be alphanumeric, with underscores.
      description: 'Cached Search results for Bazaar Dog Client'
    })

    this.store = localForage.createInstance({
      name: 'OfflineSearch'
    })

    this.store.ready()

    this.endpointName = 'Offline'
    this.acceptedCurrenciesMap = {
      BCH: 'Bitcoin Cash (BCH)',
      BTC: 'Bitcoin Legacy (BTC)',
      ZEC: 'ZCash (ZEC)',
      '': 'Any'
    }
    this.nsfwMap = {
      false: 'Hide',
      true: 'Show'
    }
    this.cache = {}

    this.searchApi = new DocumentIndex()
  }

  async setup(seedUrl?: string): Promise<void> {
    let url: string =
      seedUrl === undefined
        ? 'https://alpha.bazaar.dog/offline_bootstrap.json'
        : seedUrl
    console.log(url)
    let numberOfKeys = await this.store.length()
    if (numberOfKeys < 2000) {
      this.cache = await this.fetchBootstrap(url)
    } else {
      console.log(
        'Skipping bootstrap because there were over 2000 entries available'
      )
    }
    await this.buildIndex()

    return this.store.ready()
  }

  fetchBootstrap(endpoint: string): Map<ListingFlat> {
    console.log('bootstrapping offline search.... ')
    fetch(endpoint, {
      method: 'get'
    })
      .then(response => {
        if (response.ok) {
          response.json().then(json => {
            Object.keys(json).forEach((key: string) => {
              this.store.setItem(key, json[key])
            })
            return json
          })
        }
      })
      .catch(err => {
        console.error('Error fetching bootstrap')
        console.error(err)
        return {}
      })
    return {}
  }

  buildIndex() {
    console.log('Building Index')
    this.searchApi.addField('title')
    this.searchApi.addField('description')
    this.searchApi.addField('profileName')
    this.searchApi.addField('peerID')
    this.store.ready().then(() => {
      return this.store
        .iterate((value, key, iterationNumber) => {
          try {
            this.searchApi.add(key, value)
          } catch (error) {
            console.error('Error adding: ' + key + ' ' + error)
          }
        })
        .catch(function(err) {
          // This code runs if there were any errors
          console.log(err)
        })
    })
  }

  buildCheckbox(checked: boolean, label: string) {
    return [
      {
        value: true,
        label: label,
        checked: checked,
        default: false
      }
    ]
  }

  buildOptions(selected: string, options: any) {
    let x: Array<any> = []
    Object.keys(options).forEach(function(key) {
      x.push({
        value: key,
        label: options[key],
        checked: key === selected,
        default: false
      })
    })
    return x
  }

  getOptions(params: any) {
    let currencyOptions: any = this.buildOptions(
      params['acceptedCurrencies'],
      this.acceptedCurrenciesMap
    )
    let nsfwOptions: any = this.buildOptions(params['nsfw'], this.nsfwMap)
    return {
      acceptedCurrencies: {
        label: 'Accepted Currencies',
        type: 'radio',
        options: currencyOptions
      },
      nsfw: {
        label: 'Adult Content',
        type: 'radio',
        options: nsfwOptions
      }
    }
  }

  getSortBy(params: any) {
    return {
      '': {
        default: true,
        label: 'Relevance',
        selected: false
      }
    }
  }

  async getResults(params: any): Promise<SearchResults> {
    // console.log(JSON.stringify(params));

    let resultIds: Array<any> = []
    let searchTerm: string = ''

    try {
      if (params['q'] !== '*') {
        searchTerm = params['q']
      }
      if (searchTerm === undefined || searchTerm === '') {
        searchTerm = 'Qm'
      }
      resultIds = this.searchApi.search(searchTerm)
      // console.log("Searching for " + searchTerm);
    } catch (error) {
      resultIds = await this.searchApi.search('Qm')
      console.log('Error in search, searching for nothing ' + error)
    }

    let p: number = params['p'] === undefined ? 0 : params['p']
    let ps: number = params['ps'] === undefined ? 24 : params['ps']

    const start = p * ps
    const end = (p + 1) * ps

    let resultIdSlice = resultIds.slice(start, end)
    let cachePromises: Array<Promise<any>> = []

    let nsfw: any = false
    if (params['nsfw'] === true) {
      nsfw = true || false
    }
    // console.log("nsfw was :" + nsfw);

    let acceptedCurrencies: string = ''
    if (params['acceptedCurrencies'] !== undefined) {
      acceptedCurrencies = params['acceptedCurrencies']
    }

    // console.log("acceptedCurrencies was :" + acceptedCurrencies);

    resultIdSlice.map(key => {
      cachePromises.push(this.store.getItem(key.docId))
    })

    return Promise.all(cachePromises).then(items => {
      let results: Array<ListingSearchResult> = []
      items
        .filter((i: ListingFlat) =>
          i.acceptedCurrencies[0].startsWith(acceptedCurrencies)
        )
        .filter((i: ListingFlat) => (nsfw === false ? i.nsfw === false : true))
        .forEach((i: ListingFlat) => {
          try {
            let j = new ListingFlat(i)
            results.push(j.asSearchResult())
          } catch (error) {
            console.error('Failed getting result from storage: ' + error)
          }
        })
      // console.log("length of slice..." + results.length);

      let r: SearchResults = {
        results: results,
        hasMore: results.length > end,
        total: results.length
      }
      return r
    })
  }

  async buildResponse(params: any): Promise<any> {
    let options = this.getOptions(params)
    let sortBy = this.getSortBy(params)
    return this.getResults(params).then(results => {
      return {
        name: 'Offline Cache',
        logo: '/assets/img/searchProviders/cache.gif',
        q: params['q'],
        links: {
          self: '/search/',
          search: '/search/',
          reports: '/report/',
          listings: '/search/'
        },
        results: results,
        options: options,
        sortBy: sortBy
      }
    })
  }

  cacheSearchResults(r:SearchResults){
    for( let s of r.results){
      // try {
        const f = this.getFlatListingFromSearchResult(s);
        this.store.setItem(f.id, f);
        this.searchApi.add(f.id, f);
      // } catch (error) {
      //  console.error('Error adding: ' + key + ' ' + error)
      // }
    }
  }

  cacheStoreListings(store:Array<Listing>, v:Profile){
    for( let l of store){
      // try {
        const f = this.getFlatListingFromStoreListing(l, v);
        this.store.setItem(f.id, f);
        this.searchApi.add(f.id, f);
      // } catch (error) {
      //  console.error('Error adding: ' + key + ' ' + error)
      // }
    }
  }

  getFlatListingFromSearchResult(s: ListingSearchResult): ListingFlat {
    let l = s.data;
    let v = s.relationships.vendor.data;
    return this.mapListingToFlat(l, v)
  }

  getFlatListingFromStoreListing(l: Listing, v: Profile): ListingFlat {
    return this.mapListingToFlat(l, v)
  }

  getFlatListingFromListing(l: Listing, v: Profile) {
    console.error('Caching a listing from the full json is not supported')
    // return this.mapListingToFlat(l,v);
  }

  mapListingToFlat(l: Listing, v: Profile) {
    let flat = {
      id: md5(v.peerID + l.slug),
      peerID: v.peerID,
      slug: l.slug,
      title: l.title,
      description: l.description,
      nsfw: l.nsfw,
      contractType: l.contractType,
      profileName: v.name,
      profileAvatar: v.avatarHashes.tiny,
      pricingCurrency: l.price.currencyCode,
      acceptedCurrencies: l.acceptedCurrencies,
      price: l.price.amount,
      ratingCount: l.ratingCount,
      averageRating: l.averageRating,
      thumbnail: l.thumbnail.medium
    }
    return new ListingFlat(flat)
  }
}
