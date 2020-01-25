import fetch from "node-fetch";
import { from, Observable } from "rxjs";
import { flatMap, map, toArray, bufferCount, switchMap, catchError } from "rxjs/operators";
import { Item } from "../Item";

const createFetchObservable = (url: string): Observable<Item> => {
  const promise = fetch(url)
    .then(response => response.json())
    .then(json => {
      const i = {
        id: json.id,
        title: json.title  
      }
      return i;
    })
    return from(promise);
}

const MAX_CONCURRENT_REQUESTS = 10;

const fetchRxjsBufferd = async (fetchUrls: string[]): Promise<Item[]> => {
  const items = await from( fetchUrls).pipe(
    bufferCount(MAX_CONCURRENT_REQUESTS),
    switchMap( urls => {
      console.log(`Batch of ${urls.length} received`);
      return from( urls);
    }),
    map( url => createFetchObservable(url) ),
    flatMap( item => { 
      return item;
    }),
    toArray(),
    catchError(error => {
      console.error(`Something went wrong: ${error}`)
      return from([]);
    })
  ).toPromise();

  console.log(`Items fetched: ${items.length}`);
  return items;
}

export default fetchRxjsBufferd;