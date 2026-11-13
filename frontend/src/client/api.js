import axios, { toFormData } from 'axios';

export const initRequest = async (data) => axios
    .post(import.meta.env.VITE_INIT_REQUEST_URL, toFormData(data))
    .then((res) => res.data);