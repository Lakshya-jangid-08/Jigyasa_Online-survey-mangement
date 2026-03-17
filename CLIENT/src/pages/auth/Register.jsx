import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: ''
  });
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/organizations/`);
      console.log('Organizations fetched:', response.data);
      
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setOrganizations(response.data);
      } else {
        console.error('Organizations response is not an array:', response.data);
        setOrganizations([]);
        setError('Failed to load organizations: Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
      setError('Failed to fetch organizations. Please try again later.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending registration data:', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        organization_id: formData.organization || null
      });
      
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        organization_id: formData.organization || null
      });

      if (response.data) {
        console.log('Registration successful:', response.data);
        navigate('/login');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const errorDetails = error.response.data;
        console.error('Registration failed:', errorDetails);

        // Display specific error messages to the user
        if (errorDetails.username) {
          setError(`Username error: ${errorDetails.username.join(' ')}`);
        } else if (errorDetails.email) {
          setError(`Email error: ${errorDetails.email.join(' ')}`);
        } else if (errorDetails.password) {
          setError(`Password error: ${errorDetails.password.join(' ')}`);
        } else if (errorDetails.organization_id) {
          setError(`Organization error: ${errorDetails.organization_id.join(' ')}`);
        } else {
          setError('Registration failed. Please check your input and try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start md:items-center justify-start md:justify-center bg-white md:bg-gradient-to-br md:from-emerald-300 md:to-emerald-100 px-0 md:px-4 pt-0 md:pt-0">
      <div className="w-full md:max-w-md ">
        <div className="bg-white rounded-2xl p-8 transition md:shadow-2xl md:shadow-emerald-200 hover:md:shadow-emerald-200">
          <h1 className="text-3xl font-semibold text-gray-700 mb-1">
            Create your account
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Please fill in your details to register
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="off"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-md 
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                transition"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-md 
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                transition"
              />
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-600 mb-1">
                Organization
              </label>
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-md 
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                transition appearance-none"
              >
                <option value="">Select Organization</option>
                {organizations.length > 0 ? (
                  organizations.map((org) => (
                    <option key={org.id || org._id} value={org.id || org._id}>
                      {org.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading organizations...</option>
                )}
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-md 
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-md 
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 py-3 text-white font-semibold
              hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 
              disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-4 text-center pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?
              <Link to={'/login'} className='text-sky-500 px-1 font-medium hover:text-sky-600'>
                login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;