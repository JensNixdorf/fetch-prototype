import fetch from "node-fetch";
import { from, Observable, Observer } from "rxjs";
import { catchError, flatMap, map, toArray } from "rxjs/operators";
import { Item } from "../Item";

const MAX_CONCURRENT_REQUESTS = 10;

class FlowControl {

  private totalCount = 0;
  private totalItems:number;
  private observer: Observer<string> | undefined;

  constructor( 
    private readonly urls: string[] 
  ){
    this.totalItems = urls.length;
  }

  initFlow( observer: Observer<string>){
    this.observer = observer;
    const initRun = (this.totalItems > MAX_CONCURRENT_REQUESTS) ? 
      MAX_CONCURRENT_REQUESTS : this.totalItems;

    for ( let i = 0; i < initRun; i++ ){
      this.oneFetched();
    }
  }

  oneFetched(): void {
    if ( !this.observer ) throw new Error('Illegal state... Observer must be attached');
    this.totalCount++;
    if ( this.totalCount <= this.totalItems )
      this.observer.next( this.urls[this.totalCount-1] );
    if (this.totalCount > this.totalItems )
      this.observer.complete();
  }

}

const createSourceObservable = (urls: string[], control: FlowControl): Observable<string> => {
  const source$ = Observable.create( (observer: Observer<string>) => {
    control.initFlow(observer);
  });
  return source$;
}

const createFetchObservable = (url: string, control: FlowControl): Observable<Item> => {
  const promise = fetch(url)
  .then(response => response.json())
  .then(json => {
    const i = {
      id: json.id,
      title: json.title  
    }
    control.oneFetched();
    return i;
  });
  const fetch$ = from(promise);
  return fetch$;
}

const fetchRxjsFloatingBuffer = async (fetchUrls: string[]): Promise<Item[]> => {
  const control = new FlowControl(fetchUrls);
  const items = await createSourceObservable(fetchUrls, control)
    .pipe(
      map( url => createFetchObservable(url, control) ),
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

export default fetchRxjsFloatingBuffer;