// Add this at the top of your utils.js or in a new config.js file
// Ensure this file is loaded before admin_workers.js and admin_projects.js in your HTML files.

let API_BASE_URL; // This will store the backend URL

async function initializeApiConfig() {
  try {
    const response = await fetch('/config'); // Fetches from your frontend server
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const config = await response.json();
    API_BASE_URL = config.apiBaseUrl;

    if (!API_BASE_URL) {
      console.error('Failed to retrieve API_BASE_URL from /config endpoint or it was empty.');
      // Display an error to the user in the UI if possible
      displayGlobalErrorMessage('Critical error: API configuration is missing. Please contact support.');
      return false;
    }
    console.log('API Base URL configured:', API_BASE_URL);
    return true;
  } catch (error) {
    console.error('Error fetching or processing API config:', error);
    displayGlobalErrorMessage(`Error initializing API connection: ${error.message}. Some features may not work.`);
    return false;
  }
}

// Helper to display a global error message (optional, adapt to your UI)
function displayGlobalErrorMessage(message) {
    const messageArea = document.getElementById('messageArea') || document.body.insertBefore(document.createElement('div'), document.body.firstChild);
    messageArea.className = 'message error-message'; // Add some styling for errors
    messageArea.textContent = message;
    messageArea.style.display = 'block';
    messageArea.style.backgroundColor = 'red';
    messageArea.style.color = 'white';
    messageArea.style.padding = '10px';
    messageArea.style.textAlign = 'center';
}


// Make sure to call initializeApiConfig before any code that needs API_BASE_URL.
// For example, in your HTML files, you might have:
// <script src="js/utils.js"></script>
// <script>
//  initializeApiConfig().then(success => {
//      if (success) {
//          // Now load other scripts or initialize parts of the page
//          // For example, if this is workers.html:
//          if (typeof loadWorkers === 'function') loadWorkers();
//      }
//  });
// </script>
// <script src="js/admin_workers.js"></script> 
// Or, more simply, call it and then check API_BASE_URL in your other scripts.

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
