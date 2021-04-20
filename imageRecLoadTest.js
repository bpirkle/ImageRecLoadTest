'use strict';

const http = require('http');
const http2 = require('http2');
const { PerformanceObserver, performance } = require('perf_hooks');

/**
 * Makes a single request to the image suggestions api
 *
 * @param {integer} index unique request index for this invocation of the app
 * @param {integer} numPagesPerRequest
 * @param {integer} verbosity larger values = more verbose output
 * @param {string} params additional parameters to include with request
 * @return {Promise} promise resolving to the request response
 */
 function doMakeRequest(index, numPagesPerRequest, verbosity, params) {
	let path = '/image-suggestions/v0/wikipedia/ar/pages?limit=' + numPagesPerRequest;
	if (params) {
		path += '&' + params;
	}
	const options = {
		host: 'https://image-suggestion-api.toolforge.org',
		path: path,
		userAgent: 'imageRecLoadTest'
	};

	return new Promise((resolve, reject) => {
		const client = http2.connect(options.host);
		const req = client.request({
			':path': options.path,
			'User-Agent': options.userAgent
		});

		if (verbosity > 0) {
			performance.mark(`begin request ${index}`);
		}	
		let data = '';
		let statusCode = 0;

		req.on('response', (headers, flags) => {
			if (':status' in headers) {
				statusCode = headers[':status'];
			}
			if (verbosity > 1) {
				console.log(`begin request ${index} headers`);
				for (const name in headers) {
					console.log(`  ${name}: ${headers[name]}`);
				}
				console.log(`end request ${index} headers`);
			}	
		});

		req.on('data', (chunk) => {
			data += chunk;
		});

		req.on('end', () => {
			// If verbosity is greater than 1, we already output all the headers, including this one
			if (verbosity === 1) {
				console.log(`request ${index} complete, status: ${statusCode}`);
			}
			
			// Output the whole body if we're being very verbose, or if we're only being
			// a little verbose but an error occurred.
			if (verbosity > 3 ||
				(verbosity > 0 && (statusCode < 200 || statusCode > 299))) {
				console.log(data);
			}

			if (verbosity > 0) {
				performance.mark(`end request ${index}`);
				performance.measure(`request ${index} time`, `begin request ${index}`, `end request ${index}`);
			}
			resolve(data);
			client.close();
		});

		req.end();
	});
 }

/**
 * Converts a string in tsv format to an equivalent json object
 *
 * @param {integer} numRequestsToMake 
 * @param {integer} numPagesPerRequest
 * @param {integer} verbosity larger values = more verbose output
 * @param {string} params additional parameters to include with request
 * @return {Promise} promise resolving as an array of response strings
 */
function makeRequests(numRequestsToMake, numPagesPerRequest, verbosity, params) {
	const promises = [];
	var i;
	for (i = 0; i < numRequestsToMake; i++) {
		promises.push(doMakeRequest(i, numPagesPerRequest, verbosity, params));
	};

	const results = Promise.all(promises).then((allResults) => {
		var responses = [];
		allResults.forEach((response, index) => {
			responses.push(response);
		});
		return responses;
	});
	return results;
}

module.exports = {
	makeRequests
};
