import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-start md:items-center justify-start md:justify-center bg-white md:bg-gradient-to-br md:from-emerald-300 md:to-emerald-100 md:px-4 md:pt-0">
      <div className="w-full md:max-w-md">
        <div className="bg-white rounded-2xl p-8 transition md:shadow-2xl md:shadow-emerald-200 hover:md:shadow-emerald-200">
          <h1 className="text-3xl font-semibold text-gray-700 mb-1">
            Sign-in
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Please login to continue
          </p>

          <LoginForm />

          <h1 className='text-gray-700 pt-4 text-sm'>
            Don't have an account?
            <Link to={'/register'} className='text-sky-500 px-1 font-medium hover:text-sky-600'>
              create one
            </Link>
          </h1> 
        </div>
      </div>
    </div>
  );
};

export default Login; 