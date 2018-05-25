// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import localForage from "localforage";
import { DocumentIndex } from "ndx";
var ListingFlat = /** @class */ (function () {
    function ListingFlat(l) {
        this.id = l.id;
        this.peerID = l.peerID;
        this.slug = l.slug;
        this.title = l.title;
        this.description = l.description;
        this.nsfw = l.nsfw;
        this.contractType = l.contractType;
        this.profileName = l.profileName;
        this.profileAvatar = l.profileAvatar;
        this.pricingCurrency = l.pricingCurrency;
        this.acceptedCurrencies = l.acceptedCurrencies;
        this.price = l.price;
        this.ratingCount = l.ratingCount;
        this.averageRating = l.averageRating;
        this.thumbnail = l.thumbnail;
    }
    ListingFlat.prototype.asSearchResult = function () {
        var x = {
            data: {
                title: this.title,
                slug: this.slug,
                description: this.description,
                averageRating: this.averageRating,
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
        };
        return x;
    };
    return ListingFlat;
}());
export { ListingFlat };
var CachingSearchAPI = /** @class */ (function () {
    function CachingSearchAPI() {
        this.endpointName = "Offline";
        this.acceptedCurrenciesMap = {
            "BCH": "Bitcoin Cash (BCH)",
            "BTC": "Bitcoin Legacy (BTC)",
            "ZEC": "ZCash (ZEC)",
            "": "Any"
        };
        this.nsfwMap = {
            'false': "Hide",
            'true': "Show"
        };
        this.cache = {};
        localForage.config({
            driver: [localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE],
            name: 'OfflineSearch',
            version: 1.0,
            storeName: 'BazaarDogOffline',
            description: 'Cached Search results for Bazaar Dog Client'
        });
        this.store = localForage.createInstance({
            name: 'OfflineSearch'
        });
        this.store.ready().then(function () {
            console.log("localForage is Ready");
        })["catch"](function (err) {
            console.log("Error setting up localForage: " + err);
        });
        this.searchApi = new DocumentIndex();
    }
    CachingSearchAPI.prototype.setup = function (seed_url) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var url;
            return __generator(this, function (_a) {
                url = seed_url === undefined ? 'https://alpha.bazaar.dog/offline_bootstrap.json' : seed_url;
                console.log(url);
                this.store.length().then(function (numberOfKeys) {
                    if (numberOfKeys < 2000) {
                        _this.cache = _this.fetchBootstrap(url);
                    }
                    else {
                        console.log("Skipping bootstrap because there were over 2000 entries available");
                    }
                })["catch"](function (err) {
                    console.log(err);
                });
                this.buildIndex();
                return [2 /*return*/, true];
            });
        });
    };
    CachingSearchAPI.prototype.fetchBootstrap = function (endpoint) {
        var _this = this;
        console.log("bootstrapping offline search.... ");
        fetch(endpoint, {
            method: 'get'
        }).then(function (response) {
            if (response.ok) {
                response.json().then(function (json) {
                    Object.keys(json).forEach(function (key) {
                        _this.store.setItem(key, json[key]);
                    });
                    return json;
                });
            }
        })["catch"](function (err) {
            console.error("Error fetching bootstrap");
            console.error(err);
            return {};
        });
        return {};
    };
    CachingSearchAPI.prototype.buildIndex = function () {
        var _this = this;
        this.searchApi.addField("title");
        this.searchApi.addField("description");
        this.store.iterate(function (value, key, iterationNumber) {
            try {
                _this.searchApi.add(key, value);
            }
            catch (error) {
                console.error("Error adding: " + key + ' ' + error);
            }
        }).then(function () {
            console.log('Iteration has completed');
        })["catch"](function (err) {
            // This code runs if there were any errors
            console.log(err);
        });
        this.store.length().then(function (numberOfKeys) {
            return numberOfKeys;
        });
    };
    CachingSearchAPI.prototype.buildCheckbox = function (checked, label) {
        return [
            {
                "value": true,
                "label": label,
                "checked": checked,
                "default": false
            }
        ];
    };
    CachingSearchAPI.prototype.buildOptions = function (selected, options) {
        var x = [];
        Object.keys(options).forEach(function (key) {
            x.push({
                "value": key,
                "label": options[key],
                "checked": key === selected,
                "default": false
            });
        });
        return x;
    };
    CachingSearchAPI.prototype.getOptions = function (params) {
        var currencyOptions = this.buildOptions(params['acceptedCurrencies'], this.acceptedCurrenciesMap);
        var nsfwOptions = this.buildOptions(params['nsfw'], this.nsfwMap);
        return {
            "acceptedCurrencies": {
                'label': "Accepted Currencies",
                'type': "radio",
                'options': currencyOptions
            },
            "nsfw": {
                'label': "Adult Content",
                'type': "radio",
                'options': nsfwOptions
            }
        };
    };
    CachingSearchAPI.prototype.getSortBy = function (params) {
        return {
            "": {
                "default": true,
                "label": "Relevance",
                "selected": false
            }
        };
    };
    CachingSearchAPI.prototype.getResults = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var resultIds, searchTerm, p, ps, start, end, resultIdSlice, cachePromises, nsfw, acceptedCurrencies;
            return __generator(this, function (_a) {
                console.log(JSON.stringify(params));
                resultIds = [];
                searchTerm = '';
                try {
                    if (params['q'] !== '*') {
                        searchTerm = params['q'];
                    }
                    resultIds = this.searchApi.search(searchTerm);
                    console.log("Searching for " + searchTerm);
                }
                catch (error) {
                    resultIds = this.searchApi.search('');
                    console.log("Error in search, searching for nothing " + error);
                }
                p = params['p'];
                ps = params['ps'];
                start = p * ps;
                end = ((p + 1) * ps);
                resultIdSlice = resultIds.slice(start, end);
                cachePromises = [];
                nsfw = false;
                if (params['nsfw'] === true) {
                    nsfw = (true || false);
                }
                console.log("nsfw was :" + nsfw);
                acceptedCurrencies = '';
                if (params['acceptedCurrencies'] !== undefined) {
                    acceptedCurrencies = params['acceptedCurrencies'];
                }
                console.log("acceptedCurrencies was :" + acceptedCurrencies);
                resultIdSlice.map(function (key) {
                    cachePromises.push(_this.store.getItem(key.docId));
                });
                //
                return [2 /*return*/, Promise.all(cachePromises).then(function (items) {
                        var results = [];
                        items.filter(function (i) { return i.acceptedCurrencies[0].startsWith(acceptedCurrencies); })
                            .filter(function (i) { return nsfw === false ? i.nsfw === false : true; })
                            .forEach(function (i) {
                            try {
                                var j = new ListingFlat(i);
                                results.push(j.asSearchResult());
                            }
                            catch (error) {
                                console.error("Failed getting result from storage: " + error);
                            }
                        });
                        console.log("length of slice..." + results.length);
                        var r = {
                            results: results,
                            hasMore: (results.length > end),
                            total: results.length
                        };
                        return r;
                    })];
            });
        });
    };
    CachingSearchAPI.prototype.buildResponse = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var options, sortBy;
            return __generator(this, function (_a) {
                options = this.getOptions(params);
                sortBy = this.getSortBy(params);
                return [2 /*return*/, this.getResults(params).then(function (results) {
                        return {
                            'name': "Offline Cache",
                            "logo": "/assets/img/searchProviders/cache.gif",
                            "q": params['q'],
                            "links": {
                                "self": "/search/",
                                "search": "/search/",
                                "reports": "/report/",
                                "listings": "/search/"
                            },
                            "results": results,
                            'options': options,
                            'sortBy': sortBy
                        };
                    })];
            });
        });
    };
    return CachingSearchAPI;
}());
export default CachingSearchAPI;
