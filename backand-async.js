/**
 * Created by Relly on 1/17/2017.
 */
var async = require('async');
var BackandSDK = require('backandsdk/backand');
var self;

function backandAsync(options){
    self = this;
    this.options = options;
    var basicToken = options.masterToken + ":" + options.userToken;
    var url = options.url;
    if (!url)
        url = 'https://api.backand.com';
    this.backand = new BackandSDK(url);
    this.backand.basicAuth(basicToken);
}

// array: A collection of object to be either create, update or delete
// limit: The maximum number of async operations at a time
// action: Run either post, put or delete backand action
// actionSuccess: Triggered at the end of a successful action, parse the response that returned in the successes array
// actionError: Triggered at the end of a failed action, returns a boolean flag that determine if the entire parallel process should stop.
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
var parallel = function (array, limit, action, actionSuccess, actionError, finalCallback) {
    if (limit > 10)
        throw new Error('Maximum limit allowed is 10.');
    if (limit < 1)
        throw new Error('Minimum limit allowed is 1.');


    var successes = [];
    var errors = [];

    //console.log('Start processing ' + array.length + ' objects');

    async.eachOfLimit(array, limit, function (obj, index, callback) {

        // Perform action on object here.
        //console.log('Start processing object ' + index);

        action(obj).then(function (response) {
            // parse the response and push it to the successes array
            successes = actionSuccess(response, obj, successes);
            //console.log('Finish processing object ' + index);
            callback();
        }).catch(function(e) {
            console.error(e, index, obj);
            // determine if the entire parallel process should stop
            var stop = actionError(e);
            errors.push(e);
            if (stop) callback(e);
            else  callback();
        });
    }, function (err) {
        // if any of the action processing produced an error, err would equal that error
        if (err) {
            // One of the actions produced an error.
            // All processing will now stop.
            console.error('An object failed to process', err);
            finalCallback(err, { successes: successes, errors: errors });
        } else {
            console.log('All objects have been processed successfully');
            finalCallback(null, { successes: successes, errors: errors });
        }
    });
};

// array: A collection of object to be either create, update or delete
// limit: The maximum number of async operations at a time
// action: Run either post, put or delete backand action
// actionSuccess: Triggered at the end of a successful action, parse the response that returned in the successes array
// actionError: Triggered at the end of a failed action, returns a boolean flag that determine if the entire parallel process should stop.
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallel = function (array, limit, action, actionSuccess, actionError, finalCallback) {
    parallel(array, limit, action, actionSuccess, actionError, finalCallback);
};

// array: A collection of object to be post
// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallelPost = function (array, limit, objectName, finalCallback) {
    var url = '/1/objects/' + objectName;

    parallel(array, limit, function (obj) {
        return self.backand.post(url, obj, false);
    }, function (response, obj, successes) {
        successes.push(response.__metadata.id);
        return successes;
    }, function (err) {
        return
        err.indexOf('401') == -1 // problem with the credentials, check the options
        ||
        err.indexOf('403') == -1; // number of parallel requests to Backand is limited. Decrease the limit argument
    }, finalCallback);
};

// array: A collection of object to be put, expects each object to have __metadata.id this is the default after GET action.
// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallelPut = function (array, limit, objectName, finalCallback) {
    var url = '/1/objects/' + objectName + '/';

    parallel(array, limit, function (obj) {
        return self.backand.put(url + obj.__metadata.id, obj);
    }, function (response, obj, successes) {
        successes.push(obj.__metadata.id);
        return successes;
    }, function (err) {
        return
        err.indexOf('401') == -1 // problem with the credentials, check the options
        ||
        err.indexOf('403') == -1; // number of parallel requests to Backand is limited. Decrease the limit argument
    }, finalCallback);
};

// array: A collection of object to be deleted, expects each object to have __metadata.id this is the default after GET action.
// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallelDelete = function (array, limit, objectName, finalCallback) {
    var url = '/1/objects/' + objectName + '/';

    parallel(array, limit, function (obj) {
        return self.backand.delete(url + obj.__metadata.id, obj);
    }, function (response, obj, successes) {
        successes.push(obj.__metadata.id);
        return successes;
    }, function (err) {
        return
        err.indexOf('401') == -1 // problem with the credentials, check the options
        ||
        err.indexOf('403') == -1; // number of parallel requests to Backand is limited. Decrease the limit argument
    }, finalCallback);
};

// objectName: The name of the object to get its total
// callback: Triggered at the end, with the arguments: err, totalRows. If successful then err is null.
var getTotal = function(objectName, callback){
    var url = '/1/objects/' + objectName;
    self.backand.get(url).then(function (response) {
       callback(null, response.totalRows);
    }).catch(function (err) {
        callback(err, null);
    });
}

// total: The total number of objects to get.
// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
var parallelGet = function (total, limit, objectName, finalCallback) {
    var url = '/1/objects/' + objectName;

    // get the total rows
    getTotal(objectName, function (err, dbTotal) {

        // if the total requested is less than the actual total then take the actual
        // to avoid unnecessary requests
        if (!total || dbTotal < total)
            total = dbTotal;

        // calculate the number of pages to request
        var pageSize = 1000;
        var pages = total / pageSize;
        if (total % pageSize)
            pages++;

        // build an array of page numbers
        var array = [];
        for (var pageNumber = 1; pageNumber <= pages; pageNumber++){
            array.push(pageNumber);
        }

        parallel(array, limit, function (pageNumber) {
            return self.backand.get(url + '?pageSize=' + pageSize + '&pageNumber=' + pageNumber);
        }, function (response, obj, successes) {
            successes = successes.concat(response.data);
            return successes;
        }, function (err) {
            return
            err.indexOf('401') == -1 // problem with the credentials, check the options
            ||
            err.indexOf('403') == -1; // number of parallel requests to Backand is limited. Decrease the limit argument
        }, finalCallback);
    })
}

// total: The total number of objects to get.
// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallelGet = function (total, limit, objectName, finalCallback) {
    parallelGet(total, limit, objectName, finalCallback);
};


// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallelGetAll = function (limit, objectName, finalCallback) {
    parallelGet(null, limit, objectName, finalCallback);
};

var methods = {
    "POST":"POST",
    "PUT":"PUT",
    "DELETE":"DELETE"
}

var getBulkArray = function(array, method, bulkSize, url, buildUrl){
    var bulkArray = [];
    var bulk = [];

    for (var i = 0; i < array.length; i++){
        if (i > 0 && i % bulkSize == 0){
            bulkArray.push(bulk);
            bulk = [];
        }
        var obj = array[i];
        bulk.push({ "method":method,"url":buildUrl(url, obj),"data":obj });

    }

    if (bulk.length > 0){
        bulkArray.push(bulk);
    }

    return bulkArray;
}

// array: A collection of object to be post
// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallelPostBulk = function (array, limit, objectName, finalCallback) {
    var bulkUrl = '/1/bulk';
    var postUrl = self.options.url + '/1/objects/' + objectName;

    var bulkSize = 10;

    var bulkArray = getBulkArray(array, methods.POST, bulkSize, postUrl, function (url, obj) {
        return url;
    })

    parallel(bulkArray, limit, function (obj) {
        return self.backand.post(bulkUrl, obj, false);
    }, function (response, obj, successes) {
        for (var i = 0; i < response.length; i++) {
            if (response[i] != null && response[i].__metadata) {
                successes.push(response[i].__metadata.id);
            }
        }
        return successes;
    }, function (err) {
        return
        err.indexOf('401') == -1 // problem with the credentials, check the options
        ||
        err.indexOf('403') == -1; // number of parallel requests to Backand is limited. Decrease the limit argument
    }, finalCallback);
};

// array: A collection of object to be post
// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallelPutBulk = function (array, limit, objectName, finalCallback) {
    var bulkUrl = '/1/bulk';
    var postUrl = self.options.url + '/1/objects/' + objectName;

    var bulkSize = 10;

    var bulkArray = getBulkArray(array, methods.PUT, bulkSize, postUrl, function (url, obj) {
        return url + "/" + obj.__metadata.id;
    })

    parallel(bulkArray, limit, function (obj) {
        return self.backand.post(bulkUrl, obj, false);
    }, function (response, obj, successes) {
        for (var i = 0; i < obj.length; i++) {
            if (response[i] == null) {
                successes.push(obj[i].data.__metadata.id);
            }
        }
        return successes;
    }, function (err) {
        return
        err.indexOf('401') == -1 // problem with the credentials, check the options
        ||
        err.indexOf('403') == -1; // number of parallel requests to Backand is limited. Decrease the limit argument
    }, finalCallback);
};

// array: A collection of object to be post
// limit: The maximum number of async operations at a time
// objectName: The name of the object to post
// finalCallback: Triggered at the end, with the arguments: err, data. If successful then err is null. The data contains all the successful actions responses
backandAsync.prototype.parallelDeleteBulk = function (array, limit, objectName, finalCallback) {
    var bulkUrl = '/1/bulk';
    var postUrl = self.options.url + '/1/objects/' + objectName;

    var bulkSize = 1000;

    var bulkArray = getBulkArray(array, methods.DELETE, bulkSize, postUrl, function (url, obj) {
        return url + "/" + obj.__metadata.id;
    })

    parallel(bulkArray, limit, function (obj) {
        return self.backand.post(bulkUrl, obj, false);
    }, function (response, obj, successes) {
        for (var i = 0; i < obj.length; i++) {
            if (response[i] != null && response[i].__metadata) {
                successes.push(response[i].__metadata.id);
            }
        }
        return successes;
    }, function (err) {
        return
        err.indexOf('401') == -1 // problem with the credentials, check the options
        ||
        err.indexOf('403') == -1; // number of parallel requests to Backand is limited. Decrease the limit argument
    }, finalCallback);
};

module.exports = backandAsync;