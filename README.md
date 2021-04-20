# imageRecLoadTest
Utility app for making multiple async requests to the WMF proof-of-concept image recommendation service. Did this in node because the main project was in node and that's where my head was. This is all pretty simplistic, but our needs were simple.

This will make multiple *identical* requests. In the situation it was written for, this is not problematic. However, in an environment with actual caching, it could give misleading results.

This was only ever intended for quick testing during development. It is not for production use.

Examples:
  run using defaults: "node app.js"
  make 10 requests, 20 pages per request, verbosity of 2: "node app.js 10 20 2"
