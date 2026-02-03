import axios from 'axios';

// Function to get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to fetch CSRF token from server
async function fetchCSRFToken() {
    try {
        await axios.get('/api/csrf/');
        console.log('CSRF token fetched successfully');
        return true;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return false;
    }
}

// Fetch CSRF token on app initialization
let csrfTokenFetched = false;
const ensureCSRFToken = async () => {
    if (!csrfTokenFetched && !getCookie('csrftoken')) {
        await fetchCSRFToken();
        csrfTokenFetched = true;
    }
};

// Initialize CSRF token fetch immediately
ensureCSRFToken();

// Configure axios defaults
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

// Add request interceptor to include CSRF token
axios.interceptors.request.use(
    async (config) => {
        // Skip CSRF check for CSRF token endpoint to avoid infinite loop
        if (config.url && config.url.includes('/api/csrf/')) {
            return config;
        }

        // Ensure CSRF token is available before making request
        await ensureCSRFToken();

        // Get CSRF token from cookie
        const csrfToken = getCookie('csrftoken');

        // Add CSRF token to headers for non-GET requests
        if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
            config.headers['X-CSRFToken'] = csrfToken;
        }

        // Add Portal Context Header
        const portalSlug = localStorage.getItem('portal_slug');
        if (portalSlug) {
            config.headers['X-Portal-Slug'] = portalSlug;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            console.error('CSRF token missing or invalid. Attempting to refresh...');

            // Try to refresh CSRF token
            csrfTokenFetched = false;
            const refreshed = await ensureCSRFToken();

            // Retry the original request once
            if (!error.config._retry && refreshed) {
                error.config._retry = true;
                const csrfToken = getCookie('csrftoken');
                if (csrfToken) {
                    error.config.headers['X-CSRFToken'] = csrfToken;
                    return axios(error.config);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
