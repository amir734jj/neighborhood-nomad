import {axios} from "../utilities";

export const accountInfo = () => axios.get('/profile');

export const updateProfile = (profile) => axios.post('/profile', profile);
