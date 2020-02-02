import fetchSequential from "./implementations/sequel";
import fetchParallelwPromises from "./implementations/parallelpromises";
import fetchRxjs from "./implementations/rxjssimple";
import fetchRxjsLimited from "./implementations/rxjsLimited";
import fetchRxjsFloatingBuffer from "./implementations/rxjsFloatingBuffer";

const printTimePassed = (startTime: number): void => {
    const passed = (Date.now() - startTime) / 1000;
    console.log(`Time passed: ${passed.toFixed(2)}s`);
}

const MAX_ITEMS = 29;

const run = async (): Promise<void> => {
    // Get 10 URLs to fetch data...
    const fetchUrls: string[] = (
        (): string[] => {
            let urls: string[] = [];
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

    console.log("\nRunning unlimted parallel fetch with RxJS...");
    const rxjsStart = Date.now();
    await fetchRxjs(fetchUrls);
    printTimePassed(rxjsStart);

    console.log("\nRunning parallel fetch limited with RxJS...");
    const rxjsBufStart = Date.now();
    await fetchRxjsLimited(fetchUrls);
    printTimePassed(rxjsBufStart);
    
    console.log("\nRunning fetch with controlled flow and RxJS...");
    const rxjsFloatBufStart = Date.now();
    await fetchRxjsFloatingBuffer(fetchUrls);
    printTimePassed(rxjsFloatBufStart);
}
// console.log('Starting fetching...')
// run();

const checkDate = (toBeChecked: any): boolean => {
    try{
        const d = toBeChecked as Date;
        d.getTime();
        d.toDateString();
        d.toUTCString();
        return true;
    }
    catch{
        return false;
    }
}

const propType = <T, K extends keyof T>(obj: T, key: K): string => {
    const simpleTypes: Set<string> = new Set( ['number', 'string', 'boolean', 'bigint']);
    
    const typeName = String(typeof obj[key]);
    if (simpleTypes.has(typeName))
        return typeName;
    const isDate = checkDate(obj[key]);
    if (isDate){
        return 'Date';
    }
    throw new Error("Can't identify type (no standard type)");
}

class Finding {
    constructor(
        readonly id: number,
        readonly description: string,
        readonly startDate: Date,
    ){}
}

// H O W   T O   U S E
const finding = new Finding( 799, 'Description', new Date());
console.log(propType(finding, 'id'));
console.log(propType(finding, 'description'));
console.log(propType(finding, 'startDate'));