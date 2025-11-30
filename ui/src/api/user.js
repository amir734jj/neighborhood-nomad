import { axios } from '../utilities';

export const getUsers = () => axios.get('/user');

export const enableOrDisableUser = (userId, enabled) => axios.post('/user/enableOrDisableUser', { enabled, userId });

export const deleteUser = (userId) => axios.post('/user/deleteUser', { userId });