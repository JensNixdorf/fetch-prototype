import fetch from "node-fetch";
import { from, Observable, defer } from "rxjs";
import { toArray, bufferCount, catchError, flatMap, map } from "rxjs/operators";
import { Item } from "../Item";

const createFetchObservable = (urls: string[]): Observable<Item[]> => {
  return defer( async (): Promise<Item[]> => {
    let promises: Promise<Item>[] = [];

    urls.forEach(url => {
      const promise = fetch(url)
      .then(response => response.json())
      .then(json => {
        const i = {
          id: json.id,
          title: json.title  
        }
        return i;
      });
      promises = [...promises, promise];
    });
    return await Promise.all( promises );
  });
}

const MAX_CONCURRENT_REQUESTS = 10;

const fetchRxjsBufferd = async (fetchUrls: string[]): Promise<Item[]> => {
  const items = await from( fetchUrls).pipe(
    bufferCount(MAX_CONCURRENT_REQUESTS),
    map( urls => {
      console.log(`Batch of ${urls.length} received`);
      return createFetchObservable(urls);
    }),
    flatMap(itemsObservable => from(itemsObservable)),
    flatMap(items => from(items)),
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