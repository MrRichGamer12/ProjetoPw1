const apiBaseUrl = "http://localhost:5000";  // URL base for your mock API (JSON Server)
const apiKey = "YOUR_API_KEY";  // If you need to add an API key, otherwise you can remove it.

export async function get(endpoint) {
    try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        return handleResponse(response);
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

export async function post(endpoint, data) {
    try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
        throw error;
    }
}

export async function put(endpoint, data) {
    try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Error updating ${endpoint}:`, error);
        throw error;
    }
}

export async function del(endpoint) {
    try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorMessage}`);
        }
        return true; // DELETE generally doesn't return a body
    } catch (error) {
        console.error(`Error deleting ${endpoint}:`, error);
        throw error;
    }
}

async function handleResponse(response) {
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        `API request failed with status ${response.status}: ${errorMessage}`
      );
    }
    const data = await response.json();
    return data;
  }
