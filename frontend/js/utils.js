/**
 * Makes an API call.
 * @param {string} url - The full URL for the API endpoint.
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @param {object} [body=null] - The request body for POST/PUT.
 * @param {object} [headers={'Content-Type': 'application/json'}] - Request headers.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws {Error} - If the API call fails or returns a non-ok status.
 */
async function makeApiCall(url, method = 'GET', body = null, headers = {'Content-Type': 'application/json'}) {
    const options = {
        method: method.toUpperCase(),
        headers: headers,
    };

    if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const text = await response.text();

        // Debug: log raw response
        console.log(`[makeApiCall] ${method} ${url} → Raw response:`, text);

        // Try parsing as JSON, catch errors
        let responseData;
        try {
            responseData = JSON.parse(text);
        } catch (jsonErr) {
            // Not JSON (e.g., HTML error), throw clear error
            throw new Error(`Invalid JSON from API. Raw response: ${text.substring(0, 200)}`);
        }

        if (!response.ok) {
            // Use error message from API if available, otherwise use status text
            const errorMessage = responseData.message || responseData.error || response.statusText || `HTTP error ${response.status}`;
            throw new Error(errorMessage);
        }
        return responseData;
    } catch (error) {
        console.error(`API call failed for ${method} ${url}:`, error);
        throw error;
    }
}
