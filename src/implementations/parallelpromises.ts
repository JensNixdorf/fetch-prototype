import { Item } from "../Item";
import fetch from "node-fetch";

const fetchParallelwPromises = async (fetchUrls: string[]): Promise<Item[]> => {
  let promises: Promise<Item>[] = [];
  fetchUrls.forEach(url => {
    const promise = fetch(url)
    .then(response => response.json())
    .then(json => {
      const i = {
        id: json.id,
        title: json.title  
      }
      return i;
    }).catch( error => {
      console.error( error );
      throw error;
    });
    promises = [...promises, promise];
      
  });
  const items = await Promise.all(promises);

  console.log(`Items fetched: ${items.length}`);
  return items;
}

export default fetchParallelwPromises;
