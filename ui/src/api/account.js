import { axios } from '../utilities';

export const login = (user) => axios.post('/account/login', user);

export const register = (user) => axios.post('/account/register', user);

export const logout = () => axios.post('/account/logout', {});

export const refreshToken = () => axios.post('/account/refresh', {});

export const passwordResetRequest = ({ email, username }) => axios.post('/account/resetPassword/request', { email, username });

export const passwordResetSubmit = ({ token, email, username, password }) => axios.post('/account/resetPassword/submit', { token, email, username, password });

export const passwordResetAdhoc = ({ email, username, password }) => axios.post('/account/resetPassword/adhoc', { email, username, password });