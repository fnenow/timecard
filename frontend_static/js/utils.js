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

    // Add JWT token to headers if available (implement auth later)
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //     options.headers['Authorization'] = `Bearer ${token}`;
    // }

    try {
        const response = await fetch(url, options);
        const responseData = await response.json(); // Try to parse JSON regardless of status for error messages

        if (!response.ok) {
            // Use error message from API if available, otherwise use status text
            const errorMessage = responseData.message || responseData.error || response.statusText || `HTTP error ${response.status}`;
            throw new Error(errorMessage);
        }
        return responseData; // This usually contains a 'data' property or is the data itself
    } catch (error) {
        console.error(`API call failed for ${method} ${url}:`, error);
        // Re-throw the error so the calling function can handle it
        throw error;
    }
}