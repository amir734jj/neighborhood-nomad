import { axios } from '../utilities';

export const getGlobalConfig = () => axios.get('/globalConfig');

export const getPublicGlobalConfig = () => axios.get('/globalConfig/public');

export const setGlobalConfig = (globalConfig) => axios.post('/globalConfig', globalConfig);
