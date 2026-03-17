import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaLightbulb, FaArrowRight } from 'react-icons/fa';
import { MdBarChart } from "react-icons/md";
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-600">Jigyasa</h1>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-emerald-600">Jigyasa</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Jigyasa means "inquiry" or "curiosity" - Your comprehensive platform for creating, managing, and analyzing surveys with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/register"
            className="inline-flex items-center justify-center px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-semibold transition"
          >
            Get Started <FaArrowRight className="ml-2" />
          </Link>
          <Link 
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 font-semibold transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Jigyasa?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <MdBarChart className="text-emerald-600 text-xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Advanced Analytics
              </h4>
              <p className="text-gray-600">
                Analyze survey responses with powerful visualization tools and gain actionable insights from your data.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <FaUsers className="text-emerald-600 text-xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Organization Management
              </h4>
              <p className="text-gray-600">
                Manage multiple organizations, collaborate with teams, and control survey access with ease.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <FaLightbulb className="text-emerald-600 text-xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Easy Survey Creation
              </h4>
              <p className="text-gray-600">
                Create beautiful surveys with customizable questions, logic flows, and distribution options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Create Account</h4>
              <p className="text-gray-600 text-sm">Sign up and set up your organization</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Build Survey</h4>
              <p className="text-gray-600 text-sm">Create customized surveys with ease</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Distribute</h4>
              <p className="text-gray-600 text-sm">Share with respondents and collect responses</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Analyze</h4>
              <p className="text-gray-600 text-sm">Get insights with powerful analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Survey Journey?
          </h3>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of organizations using Jigyasa to collect valuable feedback and insights.
          </p>
          <Link 
            to="/register"
            className="inline-block px-8 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 font-semibold transition"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 Jigyasa - Online Survey Management Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
