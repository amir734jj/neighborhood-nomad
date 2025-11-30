import { axios } from '../utilities';

export const submitJourney = (journey) => axios.post('/board', journey);
