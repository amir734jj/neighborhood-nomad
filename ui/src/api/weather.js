import {axios} from "../utilities";
import qs from "qs";

export const queryWeather = (latitude, longitude, date) => axios.get('/weather', {
  params: {
    latitude, longitude, date
  },
  paramsSerializer: params => {
    return qs.stringify(params);
  },
  timeout: 20000
});
