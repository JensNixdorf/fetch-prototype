import fetch from "node-fetch";
import { from, Observable, defer, forkJoin } from "rxjs";
import { toArray, bufferCount, catchError, flatMap, map, tap } from "rxjs/operators";
import { Item } from "../Item";

const fetchItem = (url: string): Observable<Item> => {
  return defer( async (): Promise<Item> => {
    const item = await fetch(url)
    .then(response => {
      // console.log( 'Fetched: ' + url);
      return response.json()
    })
    .then(json => {
      const i = {
        id: json.id,
        title: json.title  
      }
      return i;
    });
    // console.log(`Item: ${item.id}`);
    return item;
  });
}

const MAX_CONCURRENT_REQUESTS = 10;

const fetchRxjsBufferd = async (fetchUrls: string[]): Promise<Item[]> => {
  const items = await from( fetchUrls).pipe(
    flatMap(url => fetchItem(url), undefined, MAX_CONCURRENT_REQUESTS),
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