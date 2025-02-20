import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://34.131.64.147',
  // baseURL: process.env.REACT_APP_BACKEND_URL || 'http://10.0.2.2:3001',
});
export const axiosInstanceForm = axios.create({
  // baseURL: process.env.REACT_APP_BACKEND_URL || 'http://10.0.2.2:3001',
  baseURL: 'https://34.131.64.147',
  headers: {'Content-Type': 'multipart/form-data'},
});
