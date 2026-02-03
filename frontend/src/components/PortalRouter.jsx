import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

/**
 * Portal Router Component
 * Routes users to their specific portal based on the portal slug and role
 * URL Format: /portal/{school-slug}/{role}
 */
const PortalRouter = () => {
    const { slug, role } = useParams();

    // Store the portal slug in localStorage for API calls
    if (slug) {
        localStorage.setItem('portal_slug', slug);
    }

    // Route to the appropriate login page based on role
    const roleRoutes = {
        'teacher': '/teacher-login',
        'student': '/student-login',
        'accountant': '/finance-login',
        'food': '/food-login',
        'transport': '/transport-login',
        'driver': '/driver-login'
    };

    const loginRoute = roleRoutes[role];

    if (!loginRoute) {
        // Invalid role - redirect to main login
        return <Navigate to="/login" replace />;
    }

    // Redirect to the role-specific login page
    // Include the slug as a query parameter so the login page can pick it up
    // and so the URL can be shared directly
    return <Navigate to={`${loginRoute}?slug=${slug}`} replace />;
};

export default PortalRouter;
