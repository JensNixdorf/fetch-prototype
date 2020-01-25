import fetchSequential from "./implementations/sequel";
import fetchParallelwPromises from "./implementations/parallelpromises";
import fetchRxjs from "./implementations/rxjssimple";
import fetchRxjsBufferd from "./implementations/rxjsBuffered";
import fetchRxjsFloatingBuffer from "./implementations/rxjsFloatingBuffer";

const printTimePassed = (startTime: number) => {
    const passed = (Date.now() - startTime) / 1000;
    console.log(`Time passed: ${passed.toFixed(2)}s`);
}

const MAX_ITEMS = 29;

const run = async () => {
    // Get 10 URLs to fetch data...
    const fetchUrls:string[] = (
        () => {
            let urls:string[] = [];
            for(let i=1; i<= MAX_ITEMS; i++){
                urls = [...urls, `https://jsonplaceholder.typicode.com/todos/${i}`]
            }
            return urls;
        }
    )();

    console.log("\nRunning sequential fetch...");
    const sequelStart = Date.now();
    await fetchSequential(fetchUrls);
    printTimePassed(sequelStart);

    console.log("\nRunning unbuffered parallel fetch with promises...");
    const pwPStart = Date.now();
    await fetchParallelwPromises(fetchUrls);
    printTimePassed(pwPStart);

    console.log("\nRunning unbuffered parallel fetch with RxJS...");
    const rxjsStart = Date.now();
    await fetchRxjs(fetchUrls);
    printTimePassed(rxjsStart);

    console.log("\nRunning parallel fetch buffered with RxJS...");
    const rxjsBufStart = Date.now();
    await fetchRxjsBufferd(fetchUrls);
    printTimePassed(rxjsBufStart);
    
    console.log("\nRunning fetch with controlled flow and RxJS...");
    const rxjsFloatBufStart = Date.now();
    await fetchRxjsFloatingBuffer(fetchUrls);
    printTimePassed(rxjsFloatBufStart);
}
console.log('Starting fetching...')
run();
