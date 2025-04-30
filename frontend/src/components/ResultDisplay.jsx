// src/components/ResultDisplay.jsx
import { useEffect, useRef } from 'react';

const ResultDisplay = ({ results }) => {
  const canvasRef = useRef(null);
  
  // Check if results is valid and has required properties
  const isValidResults = results && 
    typeof results === 'object' && 
    !Array.isArray(results) &&
    results.testStatistic !== undefined &&
    results.testType !== undefined;
  
  useEffect(() => {
    if (!isValidResults) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw normal distribution curve
    try {
      drawNormalDistribution(ctx, width, height, results);
    } catch (error) {
      console.error("Error drawing distribution:", error);
      
      // Display error message on canvas
      ctx.fillStyle = '#f8d7da';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#721c24';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Error visualizing results: Missing or invalid data', width / 2, height / 2);
    }
    
  }, [results, isValidResults]);
  
  const drawNormalDistribution = (ctx, width, height, results) => {
    const {
      testStatistic,
      criticalValue,
      tailType,
      isInRejectionRegion,
      alternateHypotheses,
      nullHyp
    } = results;
    
    // Validate required values
    if (testStatistic === undefined || testStatistic === null) {
      throw new Error("Test statistic is missing");
    }
    
    const margin = 40;
    const graphWidth = width - 2 * margin;
    const graphHeight = height - 2 * margin;
    
    // Parameters for normal curve
    const mean = 0;
    const stdDev = 1;
    const xMin = -Math.max(Math.abs(testStatistic), 3) - 1;
    const xMax = Math.max(Math.abs(testStatistic), 3) + 1;
    
    // Function to convert x coordinate to canvas position
    const xToCanvas = (x) => margin + ((x - xMin) / (xMax - xMin)) * graphWidth;
    
    // Function to convert y coordinate to canvas position
    const yToCanvas = (y) => height - margin - (y * graphHeight * 0.8);
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();
    
    // Draw normal curve
    ctx.beginPath();
    const normalDensity = (x) => {
      return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
        Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    };
    
    const normalMax = normalDensity(mean);
    const step = (xMax - xMin) / 100;
    
    ctx.moveTo(xToCanvas(xMin), yToCanvas(normalDensity(xMin) / normalMax));
    
    for (let x = xMin + step; x <= xMax; x += step) {
      ctx.lineTo(xToCanvas(x), yToCanvas(normalDensity(x) / normalMax));
    }
    
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw the critical region if criticalValue is available
    if (criticalValue !== undefined && criticalValue !== null) {
      const drawRejectionRegion = () => {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        
        if (tailType === "1") {
          // One-tailed test
          var direction = testStatistic > 0 ? 'right' : 'left';
          if (alternateHypotheses && Array.isArray(alternateHypotheses)) {
            alternateHypotheses.forEach(element => {
              if (element && element.includes('>')) {
                direction = 'right';
              }
              else if (element && element.includes('<')) {
                direction = 'left';
              }
            });
          }
          
          if (direction === 'right') {
            // Right-tailed test
            ctx.beginPath();
            ctx.moveTo(xToCanvas(criticalValue), height - margin);
            
            for (let x = criticalValue; x <= xMax; x += step) {
              ctx.lineTo(xToCanvas(x), yToCanvas(normalDensity(x) / normalMax));
            }
            ctx.lineTo(xToCanvas(xMax), height - margin);
            ctx.closePath();
            ctx.fill();
            
            // Label
            ctx.fillStyle = '#dc3545';
            ctx.font = '12px Arial';
            ctx.fillText('Rejection Region', xToCanvas(criticalValue + 0.5), height - margin - 10);
          } else {
            // Left-tailed test
            ctx.beginPath();
            ctx.moveTo(xToCanvas(xMin), height - margin);
            
            for (let x = xMin; x <= -criticalValue; x += step) {
              ctx.lineTo(xToCanvas(x), yToCanvas(normalDensity(x) / normalMax));
            }
            
            ctx.lineTo(xToCanvas(-criticalValue), height - margin);
            ctx.closePath();
            ctx.fill();
            
            // Label
            ctx.fillStyle = '#dc3545';
            ctx.font = '12px Arial';
            ctx.fillText('Rejection Region', xToCanvas(xMin + 0.5), height - margin - 10);
          }
        } else {
          // Two-tailed test
          ctx.beginPath();
          ctx.moveTo(xToCanvas(xMin), height - margin);
          
          for (let x = xMin; x <= -criticalValue; x += step) {
            ctx.lineTo(xToCanvas(x), yToCanvas(normalDensity(x) / normalMax));
          }
          
          ctx.lineTo(xToCanvas(-criticalValue), height - margin);
          ctx.closePath();
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(xToCanvas(criticalValue), height - margin);
          
          for (let x = criticalValue; x <= xMax; x += step) {
            ctx.lineTo(xToCanvas(x), yToCanvas(normalDensity(x) / normalMax));
          }
          
          ctx.lineTo(xToCanvas(xMax), height - margin);
          ctx.closePath();
          ctx.fill();
          
          // Labels
          ctx.fillStyle = '#dc3545';
          ctx.font = '12px Arial';
          ctx.fillText('Rejection Region', xToCanvas(xMin + 0.5), height - margin - 10);
          ctx.fillText('Rejection Region', xToCanvas(xMax - 1.5), height - margin - 10);
        }
      };
      
      drawRejectionRegion();
      
      // Draw critical value marker(s)
      const drawCriticalValueMarker = (value) => {
        const criticalX = xToCanvas(value);
        
        ctx.beginPath();
        ctx.moveTo(criticalX, height - margin);
        ctx.lineTo(criticalX, margin);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Label for critical value
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Arial';
        ctx.fillText(`Critical Value: ±${value.toFixed(2)}`, criticalX - 80, margin + 40);
      };
      
      if (tailType === "1") {
        // One-tailed test
        var cv = criticalValue;
        if (alternateHypotheses && Array.isArray(alternateHypotheses)) {
          alternateHypotheses.forEach(element => {
            if (element && element.includes('>')) {
              cv = criticalValue;
            }
            else if (element && element.includes('<')) {
              cv = -criticalValue;
            }
          });
        }
        drawCriticalValueMarker(cv);
      } else {
        // Two-tailed test
        drawCriticalValueMarker(criticalValue);
        drawCriticalValueMarker(-criticalValue);
      }
    } else {
      // If no critical value, add a note on the graph
      ctx.fillStyle = '#856404';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Critical value not available', width / 2, height / 2 - 30);
    }
    
    // Draw test statistic marker
    const testStatX = xToCanvas(testStatistic);
    
    // Draw vertical line for test statistic
    ctx.beginPath();
    ctx.moveTo(testStatX, height - margin);
    ctx.lineTo(testStatX, margin);
    ctx.setLineDash([5, 3]);
    ctx.strokeStyle = isInRejectionRegion ? '#28a745' : '#dc3545';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Label for test statistic
    ctx.fillStyle = isInRejectionRegion ? '#28a745' : '#dc3545';
    ctx.font = '12px Arial';
    ctx.fillText(`Test Statistic: ${testStatistic.toFixed(2)}`, testStatX + 5, margin + 20);
    
    // X-axis labels
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    
    for (let x = xMin; x <= xMax; x += 1) {
      const xPos = xToCanvas(x);
      ctx.beginPath();
      ctx.moveTo(xPos, height - margin);
      ctx.lineTo(xPos, height - margin + 5);
      ctx.stroke();
      ctx.fillText(x.toFixed(1), xPos - 5, height - margin + 15);
    }
    
    // Title
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Standard Normal Distribution', width / 2, margin - 15);
  };
  
  // Handle missing results case
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Test Results Available</h2>
        <p className="text-gray-600">Please complete the test form to see results.</p>
      </div>
    );
  }
  
  // Handle invalid results case
  if (!isValidResults) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
        <h2 className="text-2xl font-semibold text-center mb-4">Invalid Test Results</h2>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-700">
            The test results are incomplete or invalid. Please check your input and try again.
          </p>
          <ul className="list-disc ml-6 mt-2 text-red-600">
            {!results.testType && <li>Missing test type</li>}
            {!results.testStatistic && <li>Missing test statistic</li>}
            {!results.sampleSize && <li>Missing sample size</li>}
          </ul>
        </div>
      </div>
    );
  }

  // Safe accessor function to handle undefined or null values
  const safeValue = (value, decimals = 4) => {
    if (value === undefined || value === null || value === "NA") return "Not available";
    return typeof value === "number" ? parseFloat(value).toFixed(decimals) : value;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Hypothesis Test Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Test Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">Test Type:</div>
            <div className="font-medium">{results.testType || "Not specified"}</div>

            <div className="text-gray-600">Null Hypothesis:</div>
            <div className="font-medium">{results.nullhyp || "Not specified"}</div>
            
            <div className="text-gray-600">Sample Size:</div>
            <div className="font-medium">{results.sampleSize || "Not available"}</div>
            
            <div className="text-gray-600">Sample Mean:</div>
            <div className="font-medium">{safeValue(results.sampleMean)}</div>
            
            <div className="text-gray-600">Population Mean:</div>
            <div className="font-medium">{safeValue(results.populationMean)}</div>
            
            {results.sampleVariance !== undefined && results.sampleVariance !== "NA" && (
              <>
                <div className="text-gray-600">Sample Std Deviation:</div>
                <div className="font-medium">{safeValue(results.sampleVariance)}</div>
              </>
            )}
            
            {results.populationVariance !== undefined && results.populationVariance !== "NA" && (
              <>
                <div className="text-gray-600">Population Std Deviation:</div>
                <div className="font-medium">{safeValue(results.populationVariance)}</div>
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Test Results</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">Test Statistic (z):</div>
            <div className="font-medium">{safeValue(results.testStatistic)}</div>
            
            <div className="text-gray-600">Critical Value:</div>
            <div className="font-medium">{results.tailType=== "1" ? "" : "±"}
              {results.criticalValue !== undefined && results.criticalValue !== null 
                ? safeValue(results.criticalValue) 
                : (
                  <span className="text-amber-600">
                    Not available
                    <span className="inline-block ml-1" title="The critical value is missing. This might affect the interpretation of the test results.">
                      ⚠️
                    </span>
                  </span>
                )
              }
            </div>
            
            <div className="text-gray-600">p-Value:</div>
            <div className="font-medium">
              {results.pValue !== undefined && results.pValue !== null 
                ? safeValue(results.pValue) 
                : (
                  <span className="text-amber-600">
                    Not available
                    <span className="inline-block ml-1" title="The p-value is missing. This might affect the interpretation of the test results.">
                      ⚠️
                    </span>
                  </span>
                )
              }
            </div>
            
            <div className="text-gray-600">Tail Type:</div>
            <div className="font-medium">
              {results.tailType 
                ? (results.tailType === "1" ? "One-tailed" : "Two-tailed") 
                : "Not specified"}
            </div>
            
            <div className="text-gray-600">Decision:</div>
            {results.isInRejectionRegion !== undefined ? (
              <div className={`font-medium ${results.isInRejectionRegion ? 'text-green-600' : 'text-red-600'}`}>
                {results.isInRejectionRegion 
                  ? "Fail to reject null hypothesis" 
                  : "Reject null hypothesis"}
              </div>
            ) : (
              <div className="font-medium text-amber-600">
                Unable to determine
                <span className="inline-block ml-1" title="Missing information to determine the decision.">
                  ⚠️
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-center mb-4">Distribution with Rejection Region</h3>
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={300} 
            className="border border-gray-300 rounded"
          />
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          {results.criticalValue !== undefined && results.criticalValue !== null 
            ? "The graph shows the standard normal distribution with the test statistic and critical region."
            : "The graph shows the standard normal distribution with the test statistic. Critical region unavailable."}
        </p>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Conclusion</h3>
        {results.isInRejectionRegion !== undefined ? (
          <p className="text-gray-700">
            {results.isInRejectionRegion 
              ? `Since the test statistic falls in the rejection region, it is significant that the Null Hypothesis fails under ${results.alpha} level of significance. Hence, we reject the null hypothesis.`
              : `We conclude that the data don't provide us with any evidence against the Null Hypothesis, which may therefore be accepted at ${results.alpha} level of significance.` }
          </p>
        ) : (
          <p className="text-gray-700">
            Unable to draw a conclusion due to missing critical information. Please ensure all required fields are provided.
          </p>
        )}
        
        {(!results.criticalValue || !results.pValue) && (
          <div className="mt-3 p-3 bg-yellow-100 rounded border-l-2 border-yellow-400">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> Some key statistical values are missing. The interpretation may not be complete or accurate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;