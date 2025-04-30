const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();


const app = express();

const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const PORT = 5000;
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(bodyParser.json());


//utility functions
async function geminiUtil(query){
  try{
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(query);
  const response = await result.response;
  const text = response.text();
  return text;
  }catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}
const text = "xbar:90, n:81, s:NA, sigma:20, u:82, alpha:0.05, alternateHyp:μ > 82, nullHyp:μ = 82";

function calculate_z_value(xbar,u,sigma,n){
  return (xbar - u) / (sigma / Math.sqrt(n));
}
function calculate_t_value(xbar,u,s,n){
  return (xbar - u) / (s / Math.sqrt(n));
}

function search_z_table(find){
  const zTable=[
    [0.5,0.5040,0.5080,0.5120,0.5160,0.5199,0.5239,0.5279,0.5319,0.5359],
    [0.5398,0.5438,0.5478,0.5517,0.5557,0.5596,0.5636,0.5675,0.5714,0.5753],
    [0.5793,0.5832,0.5871,0.5910,0.5948,0.5987,0.6026,0.6064,0.6103,0.6141],
    [0.6179,0.6217,0.6255,0.6293,0.6331,0.6368,0.6406,0.6443,0.6480,0.6517],
    [0.6554,0.6591,0.6628,0.6664,0.6700,0.6736,0.6772,0.6808,0.6844,0.6879],
    [0.6915,0.6950,0.6985,0.7019,0.7054,0.7088,0.7123,0.7157,0.7190,0.7224],
    [0.7257,0.7291,0.7324,0.7357,0.7389,0.7422,0.7454,0.7486,0.7517,0.7549],
    [0.7580,0.7611,0.7642,0.7673,0.7704,0.7734,0.7764,0.7794,0.7823,0.7852],
    [0.7881,0.7910,0.7939,0.7967,0.7995,0.8023,0.8051,0.8078,0.8106,0.8133],
    [0.8159,0.8186,0.8212,0.8239,0.8264,0.8289,0.8315,0.8340,0.8365,0.8389],
    [0.8413,0.8438,0.8461,0.8485,0.8508,0.8531,0.8554,0.8577,0.8599,0.8621],
    [0.8643,0.8665,0.8686,0.8708,0.8729,0.8750,0.8770,0.8790,0.8810,0.8830],
    [0.8849,0.8869,0.8888,0.8907,0.8925,0.8944,0.8962,0.8980,0.8997,0.9015],
    [0.9031,0.9049,0.9066,0.9082,0.9099,0.9115,0.9131,0.9147,0.9162,0.9177],
    [0.9192,0.9207,0.9222,0.9236,0.9251,0.9265,0.9279,0.9292,0.9306,0.9319],
    [0.9332,0.9345,0.9357,0.9369,0.9381,0.9393,0.9405,0.9417,0.9429,0.9441],
    [0.9452,0.9463,0.9474,0.9484,0.9495,0.9505,0.9515,0.9525,0.9535,0.9544],
    [0.9554,0.9563,0.9572,0.9581,0.9591,0.9600,0.9608,0.9616,0.9624,0.9632],
    [0.9641,0.9648,0.9656,0.9664,0.9671,0.9678,0.9686,0.9693,0.9700,0.9707],
    [0.9713,0.9720,0.9726,0.9732,0.9738,0.9744,0.9750,0.9756,0.9761,0.9767],
    [0.9772,0.9777,0.9783,0.9788,0.9793,0.9798,0.9803,0.9808,0.9812,0.9817],
    [0.9821,0.9826,0.9830,0.9834,0.9838,0.9842,0.9846,0.9851,0.9854,0.9857],
    [0.9861,0.9864,0.9868,0.9871,0.9875,0.9878,0.9881,0.9884,0.9887,0.9890],
    [0.9893,0.9895,0.9898,0.9900,0.9903,0.9905,0.9908,0.9910,0.9912,0.9916],
    [0.9918,0.9920,0.9922,0.9924,0.9926,0.9928,0.9930,0.9932,0.9934,0.9936],
    [0.9938,0.9940,0.9942,0.9944,0.9946,0.9948,0.9950,0.9951,0.9953,0.99552],
    [0.9953,0.9955,0.9956,0.9958,0.9959,0.9961,0.9962,0.9963,0.9965,0.9964],
    [0.9965,0.9966,0.9967,0.9968,0.9969,0.9970,0.9971,0.9972,0.9973,0.9974],
    [0.9974,0.9975,0.9976,0.9977,0.9977,0.9978,0.9979,0.9979,0.9980,0.9981],
    [0.9981,0.9982,0.9983,0.9983,0.9984,0.9985,0.9985,0.9986,0.9986,0.9987],
    [0.9987,0.9988,0.9988,0.9989,0.9989,0.9990,0.9991,0.9991,0.9992,0.9992],
  ]
  const target = 1 - parseFloat(find);
  for (let i = 0; i < zTable.length; i++) {
    for (let j = 0; j < zTable[i].length; j++) {
      const diff = Math.abs(zTable[i][j] - target);
      if (diff < 0.0005) {
        let row = (i / 10).toFixed(1); // like 0.5, 1.2 etc.
        let col = j;
        let zValue = parseFloat((parseFloat(row) + (col * 0.01)).toFixed(2));
        console.log("Found: ", zValue);
        return zValue;
      }
    }
  }
  console.log("No match found");
  return null;
}

function get_z_value(alpha, type) {
  const new_alpha = type==1?parseFloat(alpha):parseFloat(alpha/2);
  const string_aplha = search_z_table(new_alpha);
  console.log("critical val:", string_aplha);
  return string_aplha;
}

function search_t_table(type, dof, alpha){
  const tTable2=[[1.0, 1.376, 1.963, 3.078, 6.314, 12.71, 31.82, 63.66, 318.31, 636.62],
  [0.0, 0.816, 1.061, 1.386, 1.886, 2.92, 4.303, 6.965, 9.925, 22.327, 31.599],
  [0.0, 0.765, 0.978, 1.25, 1.638, 2.353, 3.182, 4.541, 5.841, 10.215, 12.924],
  [0.0, 0.741, 0.941, 1.19, 1.533, 2.132, 2.776, 3.747, 4.604, 7.173, 8.61],
  [0.0, 0.727, 0.92, 1.156, 1.476, 2.015, 2.571, 3.365, 4.032, 5.893, 6.869],
  [0.0, 0.718, 0.906, 1.134, 1.44, 1.943, 2.447, 3.143, 3.707, 5.208, 5.959],
  [0.0, 0.711, 0.896, 1.119, 1.415, 1.895, 2.365, 2.998, 3.499, 4.785, 5.408],
  [0.0, 0.706, 0.889, 1.108, 1.397, 1.86, 2.306, 2.896, 3.355, 4.501, 5.041],
  [0.0, 0.703, 0.883, 1.1, 1.383, 1.833, 2.262, 2.821, 3.25, 4.297, 4.781],
  [0.0, 0.7, 0.879, 1.093, 1.372, 1.812, 2.228, 2.764, 3.169, 4.144, 4.587],
  [0.0, 0.697, 0.876, 1.088, 1.363, 1.796, 2.201, 2.718, 3.106, 4.025, 4.437],
  [0.0, 0.695, 0.873, 1.083, 1.356, 1.782, 2.179, 2.681, 3.055, 3.93, 4.318],
  [0.0, 0.694, 0.87, 1.079, 1.35, 1.771, 2.16, 2.65, 3.012, 3.852, 4.221],
  [0.0, 0.692, 0.868, 1.076, 1.345, 1.761, 2.145, 2.624, 2.977, 3.787, 4.14],
  [0.0, 0.691, 0.866, 1.074, 1.341, 1.753, 2.131, 2.602, 2.947, 3.733, 4.073],
  [0.0, 0.69, 0.865, 1.071, 1.337, 1.746, 2.12, 2.583, 2.921, 3.686, 4.015],
  [0.0, 0.689, 0.863, 1.069, 1.333, 1.74, 2.11, 2.567, 2.898, 3.646, 3.965],
  [0.0, 0.688, 0.862, 1.067, 1.33, 1.734, 2.101, 2.552, 2.878, 3.61, 3.922],
  [0.0, 0.688, 0.861, 1.066, 1.328, 1.729, 2.093, 2.539, 2.861, 3.579, 3.883],
  [0.0, 0.687, 0.86, 1.064, 1.325, 1.725, 2.086, 2.528, 2.845, 3.552, 3.85],
  [0.0, 0.686, 0.859, 1.063, 1.323, 1.721, 2.08, 2.518, 2.831, 3.527, 3.819],
  [0.0, 0.686, 0.858, 1.061, 1.321, 1.717, 2.074, 2.508, 2.819, 3.505, 3.792],
  [0.0, 0.685, 0.858, 1.06, 1.319, 1.714, 2.069, 2.5, 2.807, 3.485, 3.768],
  [0.0, 0.685, 0.857, 1.059, 1.318, 1.711, 2.064, 2.492, 2.797, 3.467, 3.745],
  [0.0, 0.684, 0.856, 1.058, 1.316, 1.708, 2.06, 2.485, 2.787, 3.45, 3.725],
  [0.0, 0.684, 0.856, 1.058, 1.315, 1.706, 2.056, 2.479, 2.779, 3.435, 3.707],
  [0.0, 0.684, 0.855, 1.057, 1.314, 1.703, 2.052, 2.473, 2.771, 3.421, 3.69],
  [0.0, 0.683, 0.855, 1.056, 1.313, 1.701, 2.048, 2.467, 2.763, 3.408, 3.674],
  [0.0, 0.683, 0.854, 1.055, 1.311, 1.699, 2.045, 2.462, 2.756, 3.396, 3.659],
  [0.0, 0.683, 0.854, 1.055, 1.31, 1.697, 2.042, 2.457, 2.75, 3.385, 3.646],
  [0.0, 0.681, 0.851, 1.05, 1.303, 1.684, 2.021, 2.423, 2.704, 3.307, 3.551],
  [0.0, 0.679, 0.848, 1.045, 1.296, 1.671, 2.0, 2.39, 2.66, 3.232, 3.46],
  [0.0, 0.678, 0.846, 1.043, 1.292, 1.664, 1.99, 2.374, 2.639, 3.195, 3.416],
  [0.0, 0.677, 0.845, 1.042, 1.29, 1.66, 1.984, 2.364, 2.626, 3.174, 3.39],
  [0.0, 0.675, 0.842, 1.037, 1.282, 1.646, 1.962, 2.33, 2.581, 3.098, 3.3]
  ]
  const tTable1=[[0.0, 1.0, 1.376, 1.963, 3.078, 6.314, 12.71, 31.82, 63.66, 318.31, 636.62],
  [0.0, 0.816, 1.061, 1.386, 1.886, 2.92, 4.303, 6.965, 9.925, 22.327, 31.599],
  [0.0, 0.765, 0.978, 1.25, 1.638, 2.353, 3.182, 4.541, 5.841, 10.215, 12.924],
  [0.0, 0.741, 0.941, 1.19, 1.533, 2.132, 2.776, 3.747, 4.604, 7.173, 8.61],
  [0.0, 0.727, 0.92, 1.156, 1.476, 2.015, 2.571, 3.365, 4.032, 5.893, 6.869],
  [0.0, 0.718, 0.906, 1.134, 1.44, 1.943, 2.447, 3.143, 3.707, 5.208, 5.959],
  [0.0, 0.711, 0.896, 1.119, 1.415, 1.895, 2.365, 2.998, 3.499, 4.785, 5.408],
  [0.0, 0.706, 0.889, 1.108, 1.397, 1.86, 2.306, 2.896, 3.355, 4.501, 5.041],
  [0.0, 0.703, 0.883, 1.1, 1.383, 1.833, 2.262, 2.821, 3.25, 4.297, 4.781],
  [0.0, 0.7, 0.879, 1.093, 1.372, 1.812, 2.228, 2.764, 3.169, 4.144, 4.587],
  [0.0, 0.697, 0.876, 1.088, 1.363, 1.796, 2.201, 2.718, 3.106, 4.025, 4.437],
  [0.0, 0.695, 0.873, 1.083, 1.356, 1.782, 2.179, 2.681, 3.055, 3.93, 4.318],
  [0.0, 0.694, 0.87, 1.079, 1.35, 1.771, 2.16, 2.65, 3.012, 3.852, 4.221],
  [0.0, 0.692, 0.868, 1.076, 1.345, 1.761, 2.145, 2.624, 2.977, 3.787, 4.14],
  [0.0, 0.691, 0.866, 1.074, 1.341, 1.753, 2.131, 2.602, 2.947, 3.733, 4.073],
  [0.0, 0.69, 0.865, 1.071, 1.337, 1.746, 2.12, 2.583, 2.921, 3.686, 4.015],
  [0.0, 0.689, 0.863, 1.069, 1.333, 1.74, 2.11, 2.567, 2.898, 3.646, 3.965],
  [0.0, 0.688, 0.862, 1.067, 1.33, 1.734, 2.101, 2.552, 2.878, 3.61, 3.922],
  [0.0, 0.688, 0.861, 1.066, 1.328, 1.729, 2.093, 2.539, 2.861, 3.579, 3.883],
  [0.0, 0.687, 0.86, 1.064, 1.325, 1.725, 2.086, 2.528, 2.845, 3.552, 3.85],
  [0.0, 0.686, 0.859, 1.063, 1.323, 1.721, 2.08, 2.518, 2.831, 3.527, 3.819],
  [0.0, 0.686, 0.858, 1.061, 1.321, 1.717, 2.074, 2.508, 2.819, 3.505, 3.792],
  [0.0, 0.685, 0.858, 1.06, 1.319, 1.714, 2.069, 2.5, 2.807, 3.485, 3.768],
  [0.0, 0.685, 0.857, 1.059, 1.318, 1.711, 2.064, 2.492, 2.797, 3.467, 3.745],
  [0.0, 0.684, 0.856, 1.058, 1.316, 1.708, 2.06, 2.485, 2.787, 3.45, 3.725],
  [0.0, 0.684, 0.856, 1.058, 1.315, 1.706, 2.056, 2.479, 2.779, 3.435, 3.707],
  [0.0, 0.684, 0.855, 1.057, 1.314, 1.703, 2.052, 2.473, 2.771, 3.421, 3.69],
  [0.0, 0.683, 0.855, 1.056, 1.313, 1.701, 2.048, 2.467, 2.763, 3.408, 3.674],
  [0.0, 0.683, 0.854, 1.055, 1.311, 1.699, 2.045, 2.462, 2.756, 3.396, 3.659],
  [0.0, 0.683, 0.854, 1.055, 1.31, 1.697, 2.042, 2.457, 2.75, 3.385, 3.646],
  [0.0, 0.681, 0.851, 1.05, 1.303, 1.684, 2.021, 2.423, 2.704, 3.307, 3.551],
  [0.0, 0.679, 0.848, 1.045, 1.296, 1.671, 2.0, 2.39, 2.66, 3.232, 3.46],
  [0.0, 0.678, 0.846, 1.043, 1.292, 1.664, 1.99, 2.374, 2.639, 3.195, 3.416],
  [0.0, 0.677, 0.845, 1.042, 1.29, 1.66, 1.984, 2.364, 2.626, 3.174, 3.39],
  [0.0, 0.675, 0.842, 1.037, 1.282, 1.646, 1.962, 2.33, 2.581, 3.098, 3.3]]
  

  const target = 1 - parseFloat(alpha);
  const df = parseInt(dof);
  console.log("inside search t function");
  console.log("df:", df);
  console.log("target:", target);
  const alpha_index_map1={
    '0.5':0,
    '0.75':1,
    '0.8':2,
    '0.85':3,
    '0.9':4,
    '0.95':5,
    '0.975':6,
    '0.99':7,
    '0.995':8,
    '0.999':9,
    '0.9995':10
  }
  const alpha_index_map2={
    '0':0,
    '0.5':1,
    '0.6':2,
    '0.7':3,
    '0.8':4,
    '0.9':5,
    '0.95':6,
    '0.98':7,
    '0.99':8,
    '0.998':9,
    '0.999':10,
  }
  var ans= type==1?tTable1[df][alpha_index_map1[target.toString()]]:tTable2[df][alpha_index_map2[target.toString()]];
  if (!ans) {
    let min_diff = 1000;
    let closest_key = null;
  
    if (type == 1) {
      for (const key in alpha_index_map1) {
        const diff = Math.abs(parseFloat(key) - target);
        if (diff < min_diff) {
          min_diff = diff;
          closest_key = key;
        }
      }
      ans = tTable1[df][alpha_index_map1[closest_key]];
    } else {
      for (const key in alpha_index_map2) {
        const diff = Math.abs(parseFloat(key) - target);
        if (diff < min_diff) {
          min_diff = diff;
          closest_key = key;
        }
      }
      ans = tTable2[df][alpha_index_map2[closest_key]];
    }
  }  
  console.log("ans:", ans);
  return ans;


}
function get_t_value(dof, alpha, type) {
  console.log("calling search function")
  const new_alpha = type==1?parseFloat(alpha):parseFloat(alpha/2);
  const string_aplha = search_t_table(type, dof, new_alpha);
  console.log("critical val:", string_aplha);
  return string_aplha;
}


// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Express server!');
});
app.post('/hypothesis-test', (req, res) => {
  console.log('Received request for hypothesis test');
  console.log('Request body:', req);
  const { query, samplingMethod, nullHypothesis, significance, alternateHypotheses } = req.body;
  const alternateHyp = JSON.parse(alternateHypotheses);
  console.log('Received query:', query);
  console.log('Received sampling method:', samplingMethod);
  console.log('Received null hypothesis:', nullHypothesis);
  console.log('Received significance level:', significance);
  console.log('Received alternate hypothesis:', alternateHyp);
  const prompt = `
  Instructions: Don not do any text formatting, eg(bold). Do not add any extra text. Just return the answer in the given format --- xbar:val_x_bar, n:val_n...... do not return anything for the values that are not available(only in case of s and sigma). And use 'u instead of μ'
  You are a statistician. I am conducting a hypothesis test with the following parameters:
  - Query: ${query}
  - Sampling Method: ${samplingMethod}
  - Null Hypothesis: ${nullHypothesis}
  - Significance Level(alpha): ${significance}
  - Alternate Hypotheses: ${alternateHyp}
  Based on this information, please return the following:
  u: the population mean(μ)[if not given directly, try to use the data given in the query]
  xbar: the sample mean[if not given directly, try to use the data given in the query]
  n: the sample size[if not given directly, try to use the data given in the query]
  s: the sample standard deviation[if not given directly, try to use the data given in the query]
  sigma: the population standard deviation[if not given directly, try to use the data given in the query]
  alpha: the significance level if not provided
  alternateHyp: the alternate hypothesis in mathematical expression
  type: the type of hypothesis test (1 for one-tailed, 2 for two-tailed)
  sample_data: the sample data if provided in the query
  population_data: the population data if provided in the query
  nullHyp: the null hypothesis in mathematical expression
  `
  const response = geminiUtil(prompt).then((response) => {
    console.log('Response from Gemini:', response);
    var xbar = response.match(/xbar\s*:\s*([\d.]+)/)?.[1];
    var n = response.match(/n\s*:\s*(\d+)/)?.[1];
    var s = response.match(/s\s*:\s*([A-Za-z0-9.]+)/)?.[1];
    var sigma = response.match(/sigma\s*:\s*([\d.]+)/)?.[1];
    var u = response.match(/u\s*:\s*([\d.]+)/)?.[1];
    const type = response.match(/type\s*:\s*([\d.]+)/)?.[1];
    const alpha = response.match(/alpha\s*:\s*([\d.]+)/)?.[1];
    const alternateHypRaw = response.match(/alternateHyp\s*:\s*(.+?)(?:,\s*nullHyp|$)/)?.[1].trim();
    const alternateHypList = alternateHypRaw ? alternateHypRaw.split(/\s*,\s*/) : [];
    const nullHyp = response.match(/nullHyp\s*:\s*(.+)/)?.[1].trim();
    const sample_data_match = response.match(/sample_data\s*:\s*\[([\s\d,.-]+)\]/);
    const sample_data = sample_data_match
      ? sample_data_match[1].split(',').map(x => parseFloat(x.trim()))
      : [];
    const population_data_match = response.match(/population_data\s*:\s*\[([\s\d,.-]+)\]/);
    const population_data = population_data_match
      ? population_data_match[1].split(',').map(x => parseFloat(x.trim()))
      : [];
    console.log("sample_data:", sample_data);
    if (!u) {
      u = nullHyp.match(/u\s*=\s*([\d.]+)/)?.[1];
    }
    if (!xbar && sample_data.length > 0) {
      const sum = sample_data.reduce((a, b) => a + b, 0);
      xbar = (sum / sample_data.length).toFixed(4);
    }
    if (!n && sample_data.length > 0) {
      n = sample_data.length;
    }
    if (!s && sample_data.length > 1) {
      const mean = parseFloat(xbar);
      const variance = sample_data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (sample_data.length - 1);
      s = Math.sqrt(variance).toFixed(4);
    }
    
    if (!sigma && population_data.length > 1) {
      const mean = parseFloat(u);
      const variance = population_data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (population_data.length);
      sigma = Math.sqrt(variance).toFixed(4);
    }

    
    console.log('xbar:', xbar);
    console.log('n:', n);
    console.log('s:', s);
    console.log('sigma:', sigma);
    console.log('u:', u);
    console.log('alpha:', alpha);
    console.log('alternateHyp:', alternateHypList);
    console.log('nullHyp:', nullHyp);
    console.log('type:', type);
    var val_calculated, val_table;var hyp_cond;
    if(!s){
      const zCalculated = calculate_z_value(xbar, u, sigma, n);
      console.log('zCalculated:', zCalculated); val_calculated = zCalculated;
      const zTable = get_z_value(alpha, type);
      console.log('zTable:', zTable);val_table = zTable;
    }else if(!sigma){
      const tCalculated = calculate_t_value(xbar, u, s, n);
      console.log('tCalculated:', tCalculated); val_calculated = tCalculated;
      const tTable = get_t_value(n-1, alpha, type);
      console.log('tTable:', tTable);val_table = tTable;
    }
    alternateHypList.forEach(element => {
      if(element.includes('>')){
        hyp_cond = 'greater';
      }else if(element.includes('<')){
        hyp_cond = 'less';
      }else if(element.includes('!=')){
        hyp_cond = 'not equal';
      }
    });
    var resultant = true;
    if (type == 1){
      if (val_calculated > val_table && hyp_cond == 'greater'){
        resultant = false;
        console.log('Reject the null hypothesis');
      }
      else if (val_calculated < val_table && hyp_cond == 'less'){
        resultant = false;
        console.log('Reject the null hypothesis');
      }
      else{
        resultant = true;
        console.log('Fail to reject the null hypothesis, Null hypothesis: ', resultant);
      }
    }else if(type==2){
      if (val_calculated > val_table && (hyp_cond == 'greater'||hyp_cond == 'not equal')){
        resultant = false;
        console.log('Reject the null hypothesis');
      }
      else if (val_calculated < -val_table && (hyp_cond == 'less'||hyp_cond == 'not equal')){
        resultant = false;
        console.log('Reject the null hypothesis');
      }
      else{
        resultant = true;
        console.log('Fail to reject the null hypothesis, Null hypothesis: ', resultant);
      }
    }
    res.status(200).json({
      "sampleMean": xbar,
      "populationMean": u,
      "populationVariance": sigma,        // optional
      "sampleVariance": s,            // optional
      "sampleSize": n,
      "testType": !s?'z-test':'t-test',
      "tailType": type,
      "testStatistic": val_calculated,
      "criticalValue": val_table,
      "pValue": val_table,
      "isInRejectionRegion": resultant,
      "alternateHypotheses": alternateHypList,
      "nullhyp": nullHyp,
    });
  }); 
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});