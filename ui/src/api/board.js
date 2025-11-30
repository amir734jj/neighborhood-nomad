import { axios } from '../utilities';
import qs from "qs";

export const submitJourney = (journey) => axios.post('/board', journey);

export const queryJourney = (filters) => axios.get('/board/query', {
  params: {
    filters,
  },
  paramsSerializer: params => {
    return qs.stringify(params);
  },
});
