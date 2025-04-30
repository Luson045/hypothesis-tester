import { useState } from 'react';

const InputForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    query: '',
    nullHypothesis: 'μ = 0',
    significance: '0.05',
    alternateHypotheses: JSON.stringify(['μ > 0'])
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAlternateHypChange = (e) => {
    try {
      // Ensure it's a valid array when parsed
      const value = e.target.value;
      JSON.parse(value); // Just to test if it's valid JSON
      setFormData(prev => ({ ...prev, alternateHypotheses: value }));
    } catch (err) {
      // If not valid JSON, don't update the state
      console.error('Invalid JSON format for alternate hypotheses', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
            Query (Problem Statement)
          </label>
          <textarea
            id="query"
            name="query"
            rows="8"
            required
            value={formData.query}
            onChange={handleChange}
            placeholder="Describe your hypothesis testing problem"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="nullHypothesis" className="block text-sm font-medium text-gray-700 mb-1">
              Null Hypothesis
            </label>
            <input
              type="text"
              id="nullHypothesis"
              name="nullHypothesis"
              required
              value={formData.nullHypothesis}
              onChange={handleChange}
              placeholder="e.g., μ = 0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="alternateHypotheses" className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Hypothesis (as JSON array)
            </label>
            <input
              type="text"
              id="alternateHypotheses"
              name="alternateHypotheses"
              required
              value={formData.alternateHypotheses}
              onChange={handleAlternateHypChange}
              placeholder='["μ > 0"]'
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter as JSON array</p>
          </div>

          <div>
            <label htmlFor="significance" className="block text-sm font-medium text-gray-700 mb-1">
              Significance Level (α)
            </label>
            <select
              id="significance"
              name="significance"
              value={formData.significance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0.01">0.01 (99% confidence)</option>
              <option value="0.05">0.05 (95% confidence)</option>
              <option value="0.1">0.10 (90% confidence)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Run Hypothesis Test
        </button>
      </div>
    </form>
  );
};

export default InputForm;