const imageRecLoadTest = require( './imageRecLoadTest' );
const { PerformanceObserver, performance } = require('perf_hooks');

let verbosity = 1; // larger values = more verbose output
let numRequestsToMake = 5;
let numPagesPerRequest = 10;
let params = '';

const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        console.log(`************ ${entry.name}: ${entry.duration} ms ***********`);
    })
})

// Error handling here is minimal, but this is a single-purpose utility for use by devs.
if (process.argv.length >= 3) {
    numRequestsToMake = parseInt(process.argv[2]) || numRequestsToMake;
}
if (process.argv.length >= 4) {
    numPagesPerRequest = parseInt(process.argv[3]) || numPagesPerRequest;
}
if (process.argv.length >= 5) {
    verbosity = parseInt(process.argv[4]) || verbosity;
}
if (process.argv.length >= 6) {
    params = process.argv[5];
}

console.log(
    `numRequestsToMake: ${numRequestsToMake}, numPagesPerRequest: ${numPagesPerRequest}, verbosity: ${verbosity}, params: ${params}`
);

perfObserver.observe({ entryTypes: ["measure"], buffer: true })

performance.mark('app-start');
imageRecLoadTest.makeRequests(numRequestsToMake, numPagesPerRequest, verbosity, params)
.then((response) => {
    performance.mark('app-end');
    if (verbosity > 2) {
        console.log(response);
    }
    performance.measure('overall time', 'app-start', 'app-end')
});
