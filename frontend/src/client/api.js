import axios, { toFormData } from 'axios';

export const initRequest = async (data) => axios
    .post('***REMOVED***', toFormData(data))
    .then((res) => res.data);