import _ from "lodash";

_.mixin({
  isValidDate: function (value) {
    return _.isDate(value) && !(_.isNaN(value.valueOf()));
  },
  includesIgnoreCase: function (arr, value) {
    return arr.some(item => _.toLower(item) === _.toLower(value));
  },
  awaitDebouncedSearch: function (fn, wait) {
    const debouncedFn = _.debounce(async (value, resolve) => {
      try {
        await fn(value);
      } finally {
        resolve();
      }
    }, wait);

    return function (value) {
      return new Promise((resolve) => {
        debouncedFn(value, resolve);
      });
    };
  },
  isEqualIgnoreCase: function (a, b) {
    if (_.isString(a) && _.isString(b)) {
      return _.toLower(a) === _.toLower(b);
    }
    return _.isEqual(a, b);
  },
  isStringNumber: function (str) {
    return _.isString(str) && !_.isNaN(Number(str));
  },
  compactBy: function (array, selector) {
    return array.filter(selector);
  },
  numericStringAsNumber: function (value) {
    if (!_.isString(value)) return value;
    const cleaned = value.replace(/,/g, '');
    return !isNaN(cleaned) && _.isFinite(Number(cleaned)) ? cleaned : value;
  },
});