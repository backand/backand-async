# backand-async

>  Backand Async for Node JS.
This SDK enables you to perform server to server high volume CRUD

## parallel(array, limit, action, actionSuccess, actionError, finalCallback)
Runs an action with a promice on an array of objects. The actions run in parallel up to the limit specified.
### Arguments:
| Name           | Type     | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| array          | array    | array of object as the CRUD action input                     |
| limit          | int      | the limit of actions that runs in parallel. max 10, min 1    |
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
