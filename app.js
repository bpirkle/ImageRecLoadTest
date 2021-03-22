const imageRecLoadTest = require( './imageRecLoadTest' );
const { PerformanceObserver, performance } = require('perf_hooks');

const verbosity = 1; // larger values = more verbose output
const numRequestsToMake = 100;
const numPagesPerRequest = 100;

const perfObserver = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration} ms`);
    })
})
  
perfObserver.observe({ entryTypes: ["measure"], buffer: true })

performance.mark('app-start');
imageRecLoadTest.makeRequests(numRequestsToMake, numPagesPerRequest, verbosity).then((response) => {
    performance.mark('app-end');
    if (verbosity > 2) {
        console.log(response);
    }
    performance.measure('overall time', 'app-start', 'app-end')
});
