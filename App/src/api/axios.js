import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:3001',
});
export const axiosInstanceForm = axios.create({
  baseURL: 'http://10.0.2.2:3001',
  headers: {'Content-Type': 'multipart/form-data'},
});
