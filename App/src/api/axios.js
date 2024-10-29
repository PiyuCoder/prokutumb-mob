import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://prokutumb-mob.onrender.com',
});
export const axiosInstanceForm = axios.create({
  baseURL: 'https://prokutumb-mob.onrender.com',
  headers: {'Content-Type': 'multipart/form-data'},
});
