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
        
        // Check if the response is JSON before trying to parse it
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            
            if (!response.ok) {
                const errorMessage = responseData.message || responseData.error || response.statusText || `HTTP error ${response.status}`;
                throw new Error(errorMessage);
            }
            
            return responseData;
        } else {
            // Handle non-JSON responses
            const textResponse = await response.text();
            console.error(`API returned non-JSON response:`, textResponse);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            } else {
                throw new Error(`Expected JSON but received: ${contentType || 'unknown content type'}`);
            }
        }
    } catch (error) {
        console.error(`API call failed for ${method} ${url}:`, error);
        throw error;
    }
}
