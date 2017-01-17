# backand-async

>  Backand Async for Node JS.
This SDK enables you to perform server to server high volume CRUD

## initiate
```
var BackandAsyncSdk = require("./backand-async");
var backandAsync = new BackandAsyncSdk(options);
```
### options
```
{
  "url":"https://api.backand.com",
  "masterToken":"enter your app master token",
  "userToken":"enter your user token"
}
```

## parallel(array, limit, action, actionSuccess, actionError, finalCallback)
Runs an action with a promice on an array of objects. The actions run in parallel up to the limit specified.
### Arguments:
| Name           | Type     | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| array          | array    | array of object as the CRUD action input                     |
| limit          | int      | The maximum number of async actions at a time. max 10, min 1 |
| action         | function | action(obj), obj is an object from the array                 |
| actionSuccess  | function | actionSuccess(response, obj, successes)                      |
|                |          | response: backand CRUD response                              |
|                |          | obj: an object from the array                                |
|                |          | successes: an array of all succeful actions                  |
| actionError    | function | actionError(e), e is the error in the action                 |
| finalCallback  | function | finalCallback(err, results)                                  |
|                |          | err: an error in an action that stop the entire run like 401 |
|                |          | the err is null if no error occured                          |
|                |          | results: {successes, errors}                                 |

## parallelPost(array, limit, objectName, finalCallback)
Runs a backand post on an array of objects. The actions run in parallel up to the limit specified.
### Arguments:
| Name           | Type     | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| array          | array    | A collection of object to create                             |
| limit          | int      | The maximum number of async actions at a time. max 10, min 1 |
| objectName     | string   | The name of the object to post                               |
| finalCallback  | function | finalCallback(err, results)                                  |
|                |          | err: an error in an action that stop the entire run like 401 |
|                |          | the err is null if no error occured                          |
|                |          | results: {successes, errors}                                 |

## parallelPut(array, limit, objectName, finalCallback)
Runs a backand put on an array of objects. The actions run in parallel up to the limit specified.
### Arguments:
| Name           | Type     | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| array          | array    | A collection of object to update                             |
| limit          | int      | The maximum number of async actions at a time. max 10, min 1 |
| objectName     | string   | The name of the object to put                                |
| finalCallback  | function | finalCallback(err, results)                                  |
|                |          | err: an error in an action that stop the entire run like 401 |
|                |          | the err is null if no error occured                          |
|                |          | results: {successes, errors}                                 |

## parallelDelete(array, limit, objectName, finalCallback)
Runs a backand delete on an array of objects. The actions run in parallel up to the limit specified.
### Arguments:
| Name           | Type     | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| array          | array    | A collection of object to delete                             |
| limit          | int      | The maximum number of async actions at a time. max 10, min 1 |
| objectName     | string   | The name of the object to delete from                        |
| finalCallback  | function | finalCallback(err, results)                                  |
|                |          | err: an error in an action that stop the entire run like 401 |
|                |          | the err is null if no error occured                          |
|                |          | results: {successes, errors}                                 |

## parallelGet(total, limit, objectName, finalCallback)
Get up to a total rows from an object. The actions run in parallel up to the limit specified.
### Arguments:
| Name           | Type     | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| total          | int      | The total number of objects to get                           |
| limit          | int      | The maximum number of async actions at a time. max 10, min 1 |
| objectName     | string   | The name of the object to delete from                        |
| finalCallback  | function | finalCallback(err, results)                                  |
|                |          | err: an error in an action that stop the entire run like 401 |
|                |          | the err is null if no error occured                          |
|                |          | results: {successes, errors}                                 |

## parallelGetAll(limit, objectName, finalCallback)
Get the entire object. The actions run in parallel up to the limit specified.
### Arguments:
| Name           | Type     | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| limit          | int      | The maximum number of async actions at a time. max 10, min 1 |
| objectName     | string   | The name of the object to delete from                        |
| finalCallback  | function | finalCallback(err, results)                                  |
|                |          | err: an error in an action that stop the entire run like 401 |
|                |          | the err is null if no error occured                          |
|                |          | results: {successes, errors}                                 |
