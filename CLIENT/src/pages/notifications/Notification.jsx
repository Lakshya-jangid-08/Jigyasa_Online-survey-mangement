import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Notification = () => {
  const [surveys, setSurveys] = useState([]);
  const [newSurveys, setNewSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/surveys/organization-surveys`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the Bearer token
            'Content-Type': 'application/json',
          },
        });

        // Get all surveys
        setSurveys(response.data);
        
        // Get recent surveys (created in the last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const recentSurveys = response.data.filter(survey => {
          const surveyDate = new Date(survey.createdAt || survey.created_at);
          return surveyDate > oneDayAgo;
        });
        
        setNewSurveys(recentSurveys);
        
        // Show toast for new surveys
        if (recentSurveys.length > 0) {
          toast.info(`You have ${recentSurveys.length} new survey${recentSurveys.length > 1 ? 's' : ''} from your organization!`);
        }
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError(err.response?.data?.detail || 'Failed to load surveys');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading surveys...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>
      
      {/* New Surveys Section */}
      {newSurveys.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">New Surveys</h2>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {newSurveys.map((survey) => (
              <li key={survey.id || survey._id} className="p-4 bg-yellow-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <h3 className="text-lg font-medium">{survey.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Added: {formatDate(survey.createdAt || survey.created_at)}</p>
                  </div>
                  <Link
                    to={`/survey-response/${survey.creator || survey.user}/${survey.id || survey._id}/`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Respond
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* All Organization Surveys */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Organization Surveys</h2>
        {surveys.length === 0 ? (
          <p className="text-gray-500">No surveys available from your organization.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {surveys.map((survey) => (
              <li key={survey.id || survey._id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{survey.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Created: {formatDate(survey.createdAt || survey.created_at)}</p>
                  </div>
                  <Link
                    to={`/survey-response/${survey.creator || survey.user}/${survey.id || survey._id}/`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;
