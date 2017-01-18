/**
 * Created by Relly on 1/17/2017.
 */

// requirements to test
var mocha = require("mocha");
var describe = mocha.describe;
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

// backand SDK
var options =  require("./options.json");
var BackandAsyncSdk = require("./backand-async");
var backandAsync = new BackandAsyncSdk(options);

// test parameters
var objectName = 'parent'; // the object to CRUD
var length = 1000;    // how many objects
var limit = 10;      // how many parallel requests
var data;            // the data after get all that will be later updated and deleted.


var getSampleData = function (length) {
    var array = [];

    // simple for is the fastest way to iterate
    for (var i = 0; i < length; i++){
        array.push({number:i, string:"string"});
    }

    return array;
}

var getChangedSampleData = function (data) {
    for (var i = 0; i < data.length; i++){
        data[i].number = data[i].__metadata.id;
    }

    return data;
}

var getDuration = function (started) {
    return parseInt(Math.abs(new Date() - started) / 1000);
}

describe("backand async", function () {
    this.timeout(5000000);

    before(function() {

    });

    it('should parallel post ' + length + ' objects, limited to ' + limit + ' requests at a time.', function (done) {
        var sample = getSampleData(length);
        console.log('parallel post started');
        var started = new Date();
        backandAsync.parallelPost(sample, limit, objectName, function (err, result) {
            var duration = getDuration(started);
            expect(err).to.be.null;
            if (err) {
                console.error('parallel post ended with error after ' + duration + ' seconds: ', err);
                done();
            }
            else {
                console.log('parallel post ended with ' + result.errors.length + ' errors and ' + result.successes.length + ' successes after ' + duration + ' seconds: ');
                expect(result.errors.length).to.equal(0);
                expect(result.successes.length).to.equal(length);
                done();
            }
        });
    });

    it('should parallel get all objects, limited to ' + limit + ' requests at a time.', function (done) {
        console.log('parallel get started');
        var started = new Date();
        backandAsync.parallelGetAll(limit, objectName, function (err, result) {
            var duration = getDuration(started);
            expect(err).to.be.null;
            if (err) {
                console.error('parallel get ended with error after ' + duration + ' seconds: ', err);
                done();
            }
            else {
                console.log('parallel get ended with ' + result.errors.length + ' errors and ' + result.successes.length + ' successes after ' + duration + ' seconds: ');
                expect(result.errors.length).to.equal(0);
                data = result.successes;
                done();
            }
        });
    });

    it('should parallel put all objects, limited to ' + limit + ' requests at a time.', function (done) {
        console.log('parallel put started');
        var sample = getChangedSampleData(data);

        var started = new Date();
        backandAsync.parallelPut(sample, limit, objectName, function (err, result) {
            var duration = getDuration(started);
            expect(err).to.be.null;
            if (err) {
                console.error('parallel put ended with error after ' + duration + ' seconds: ', err);
                done();
            }
            else {
                console.log('parallel put ended with ' + result.errors.length + ' errors and ' + result.successes.length + ' successes after ' + duration + ' seconds: ');
                expect(result.errors.length).to.equal(0);
                expect(result.successes.length).to.equal(data.length);
                done();
            }
        });
    });

    it('should parallel delete all objects, limited to ' + limit + ' requests at a time.', function (done) {
        console.log('parallel delete started');

        var started = new Date();
        backandAsync.parallelDelete(data, limit, objectName, function (err, result) {
            var duration = getDuration(started);
            expect(err).to.be.null;
            if (err) {
                console.error('parallel delete ended with error after ' + duration + ' seconds: ', err);
                done();
            }
            else {
                console.log('parallel delete ended with ' + result.errors.length + ' errors and ' + result.successes.length + ' successes after ' + duration + ' seconds: ');
                expect(result.errors.length).to.equal(0);
                expect(result.successes.length).to.equal(data.length);
                done();
            }
        });
    });

    it('should parallel post ' + length + ' objects with bulk, limited to ' + limit + ' requests at a time.', function (done) {
        var sample = getSampleData(length);
        console.log('parallel post started');
        var started = new Date();
        backandAsync.parallelPostBulk(sample, limit, objectName, function (err, result) {
            var duration = getDuration(started);
            expect(err).to.be.null;
            if (err) {
                console.error('parallel post ended with error after ' + duration + ' seconds: ', err);
                done();
            }
            else {
                console.log('parallel post ended with ' + result.errors.length + ' errors and ' + result.successes.length + ' successes after ' + duration + ' seconds: ');
                expect(result.errors.length).to.equal(0);
                expect(result.successes.length).to.equal(length);
                done();
            }
        });
    });

    it.only('should parallel get all objects, limited to ' + limit + ' requests at a time.', function (done) {
        console.log('parallel get started');
        var started = new Date();
        backandAsync.parallelGetAll(limit, objectName, function (err, result) {
            var duration = getDuration(started);
            expect(err).to.be.null;
            if (err) {
                console.error('parallel get ended with error after ' + duration + ' seconds: ', err);
                done();
            }
            else {
                console.log('parallel get ended with ' + result.errors.length + ' errors and ' + result.successes.length + ' successes after ' + duration + ' seconds: ');
                expect(result.errors.length).to.equal(0);
                data = result.successes;
                done();
            }
        });
    });

    it('should parallel put all objects with bulk, limited to ' + limit + ' requests at a time.', function (done) {
        console.log('parallel put started');
        var sample = getChangedSampleData(data);

        var started = new Date();
        backandAsync.parallelPutBulk(sample, limit, objectName, function (err, result) {
            var duration = getDuration(started);
            expect(err).to.be.null;
            if (err) {
                console.error('parallel put ended with error after ' + duration + ' seconds: ', err);
                done();
            }
            else {
                console.log('parallel put ended with ' + result.errors.length + ' errors and ' + result.successes.length + ' successes after ' + duration + ' seconds: ');
                expect(result.errors.length).to.equal(0);
                expect(result.successes.length).to.equal(data.length);
                done();
            }
        });
    });

    it.only('should parallel delete all objects with bulk, limited to ' + limit + ' requests at a time.', function (done) {
        console.log('parallel delete started');

        var started = new Date();
        backandAsync.parallelDeleteBulk(data, limit, objectName, function (err, result) {
            var duration = getDuration(started);
            expect(err).to.be.null;
            if (err) {
                console.error('parallel delete ended with error after ' + duration + ' seconds: ', err);
                done();
            }
            else {
                console.log('parallel delete ended with ' + result.errors.length + ' errors and ' + result.successes.length + ' successes after ' + duration + ' seconds: ');
                expect(result.errors.length).to.equal(0);
                expect(result.successes.length).to.equal(data.length);
                done();
            }
        });
    });
});