import { Item } from "../Item";
import fetch from "node-fetch";

const fetchSequential = async (fetchUrls: string[]): Promise<Item[]> => {
  let items: Item[] = [];

  for (const fetchUrl of fetchUrls) {
    const item = await fetch(fetchUrl)
    .then(response => response.json())
    .then(json => {
      const i = {
        id: json.id,
        title: json.title  
      }
      return i;
    }).catch( error => console.error( error ) );
    if ( item ){
      items = [...items, item];
    }

  }
  return items;
}

export default fetchSequential;
