import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://prokutumb.com',
  // baseURL: process.env.REACT_APP_BACKEND_URL || 'http://10.0.2.2:3001',
});
export const axiosInstanceForm = axios.create({
  // baseURL: process.env.REACT_APP_BACKEND_URL || 'http://10.0.2.2:3001',
  baseURL: 'https://prokutumb.com',
  headers: {'Content-Type': 'multipart/form-data'},
});
