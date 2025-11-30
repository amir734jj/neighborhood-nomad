import {DateTime} from "luxon";

export const toISODateOrDefault = (date, defaultValue) => {
  if (date) {
    return DateTime.fromISO(date).toJSDate().toISOString();
  } else {
    return defaultValue;
  }
};

export const toISODateOrNow = date => toISODateOrDefault(date, new Date().toISOString());