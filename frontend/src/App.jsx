// src/App.jsx
import { useState } from 'react';
import ResultDisplay from './components/ResultDisplay';
import InputForm from './components/InputForm';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://hypothesis-tester-wehs.onrender.com/hypothesis-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          Statistical Hypothesis Testing(Around the Mean)
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <InputForm onSubmit={handleSubmit} />
        </div>
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing your request...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}
        
        {results && <ResultDisplay results={results} />}
        <footer className="text-center text-gray-500 text-sm mt-8">
          <p>© 2023 Hypothesis Testing App. All rights reserved.</p>
          <p>Developed by Luson Basumatary</p>
          <p>Contact: lusonbasumatary2@gmail.com
            <a href="mailto:lusonbasumatary2@gmail.com"/>
          </p>
        </footer>
      </div>
    </div>
    
  );
}

export default App;