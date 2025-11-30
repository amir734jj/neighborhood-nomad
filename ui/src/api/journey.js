import { axios } from '../utilities';

export const getJourneys =  () => axios.get(`/journey`);

export const getJourneyById =  (journeyId) => axios.get(`/journey/${journeyId}`);

export const updateJourneyById =  (journeyId, journey) => axios.put(`/journey/${journeyId}`, journey);

export const saveJourney =  (journey) => axios.post('/journey', journey);

export const deleteJourney =  (journeyId) => axios.delete(`/journey/${journeyId}`);
