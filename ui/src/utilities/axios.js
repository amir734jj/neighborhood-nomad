import axiosClient from 'axios';
import NProgress from 'nprogress';
import store from 'store2';
import {STORE_TOKEN} from "../constants";
import _ from "lodash";
import {uniqId} from ".";

const calculatePercentage = (loaded, total) => (Math.floor(loaded * 1.0) / total);

// source: https://www.npmjs.com/package/axios-progress-bar
const loadProgressBar = (instance, config = {}) =>{
  let requestsCounter = 0;

  const progressBarDone = () => {
    NProgress.set(1.0); // NProgress.done is different, use set 100% instead
  };

  const setupStartProgress = () => {
    instance.interceptors.request.use(config => {
      requestsCounter++;
      NProgress.start();
      return config;
    });
  };

  const setupUpdateProgress = () => {
    const update = e => NProgress.inc(calculatePercentage(e.loaded, e.total));
    instance.defaults.onDownloadProgress = update;
    instance.defaults.onUploadProgress = update;
  };

  const setupStopProgress = () => {
    const responseFunc = response => {
      requestsCounter--;
      if (requestsCounter === 0) {
        progressBarDone();
      }
      return response;
    };

    const errorFunc = error => {
      requestsCounter--;
      if (requestsCounter === 0) {
        progressBarDone();
      }
      return Promise.reject(error);
    };

    instance.interceptors.response.use(responseFunc, errorFunc);
  };

  NProgress.configure(config);
  setupStartProgress();
  setupUpdateProgress();
  setupStopProgress();
};

export const axios = axiosClient.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, Authorization, Content-Type, Accept',
  },
});

// Adds Bearer token if any
axios.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${store.get(STORE_TOKEN, '<missing>')}`;

  return config;
});

// Extracts filename and contentType from response
axios.interceptors.response.use(
  (response) => {
    response.contentType = response.headers['content-type'];
    response.filename = response.headers['content-disposition']?.split(';')
      .map(value => value.trim())
      .find(value => value.startsWith('filename='))?.split('=')[1];
    response.size = _.toNumber(response.headers['content-length']);
    response.uniqueId = uniqId();

    return response;
  }
);

export const getAxiosError = (exception) => {
  let data = exception.response?.data;
  const message = exception.message;
  if (_.isString(data) && exception.response?.headers['content-type']?.includes('application/json')) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // If it fails here, then backend isn't really sending valid JSON
    }
  }
  return {
    message, data
  };
};

loadProgressBar(axios, { showSpinner: false });
