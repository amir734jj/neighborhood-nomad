import {axios} from "../utilities";
import qs from "qs";

export const isSenderRegistered = (email = null) => axios.get('email/sender/status', {
  params: {email},
  paramsSerializer: params => {
    return qs.stringify(params, { skipNulls: true });
  }
});

export const registerSender = (email = null) => axios.post('email/sender', {}, {
  params: {email},
  paramsSerializer: params => {
    return qs.stringify(params);
  }
});