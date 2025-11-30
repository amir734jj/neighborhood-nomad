import _ from "lodash";

const defaultWidth = 4;

export const calculateServicePriceWidth = (...services) => {
  return _.chain(services).map(service => {
    const inputLength = service.servicePrice?.toString().length || 0;
    return Math.max(defaultWidth, inputLength === 4 ? 5 : inputLength);
  }).max().value() || defaultWidth;
};