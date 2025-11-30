import * as yup from "yup";
import "yup-phone-lite";
import _ from "lodash";

yup.addMethod(yup.string, "emptyOrMinLength", function (minLength = 3) {
  return this.test(
    "empty-or-min-length",
    `Must be either empty or have at least ${minLength} characters`,
    function (value) {
      return !value || _.isEmpty(value) || !_.isString(value) || (value && value.trim().length >= minLength);
    }
  );
});

yup.addMethod(yup.string, "emptyOrNumber", function ({ min, max } = { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }) {
  return this.test(
    "empty-or-number",
    function ({ value }) {
      if (!value || _.isEmpty(value)) {
        return true; // Valid if empty
      }
      if (!_.isFinite(Number(value))) {
        return "Must be a numeric value";
      }
      if (Number(value) < min) {
        return `Must be greater than or equal to ${min}`;
      }
      if (Number(value) > max) {
        return `Must be less than or equal to ${max}`;
      }
      return true; // Valid if it passes all checks
    },
    function (value) {
      return !value || _.isEmpty(value) || (_.isFinite(Number(value)) && Number(value) <= max && Number(value) >= min);
    }
  );
});


yup.addMethod(yup.string, "emptyOrPhoneNumber", function () {
  return this.test(
    "empty-or-phone-number",
    `Must be either empty or phone number`,
    function (value) {
      const phoneSchema = yup
        .string()
        .phone("US")
        .required();

      return !value || _.isEmpty(value) || phoneSchema.isValidSync(value);
    }
  );
});

yup.addMethod(yup.string, "emptyOrDate", function () {
  return this.test(
    "empty-or-date",
    `Must be either empty or date type`,
    function (value) {
      return _.isEmpty(value) || _.isValidDate(new Date(value));
    }
  );
});

yup.addMethod(yup.string, "dateLessThanOrEquals", function (refField) {
  return this.test("empty-or-less-than-or-equals", function (value) {
    const { resolve, createError } = this;
    const refValue = resolve(refField);

    if (!value || !refValue) {
      return createError({
        message: `Empty date value is not valid`,
      });
    }

    const current = new Date(value);
    const reference = new Date(refValue);

    if (current <= reference) return true;

    const refText = reference.toLocaleDateString();
    return createError({
      message: `Must be either empty or a date less than or equal to ${refText}`,
    });
  });
});

yup.addMethod(yup.string, "hexString", function () {
  return this.test(
    "must-be-hex-string",
    "Value must be a HEX string",
    function (value) {
      return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
    }
  );
});

yup.addMethod(yup.array, "containsEmptyOrAllNonEmpty", function () {
  return this.test(
    "empty-or-all-non-empty",
    `Must select either All OR specific options`,
    function (arr) {
      return _.isEqual(arr, ['']) || _.every(arr, str => _.isNumber(str) || !_.isEmpty(str));
    }
  );
});

yup.addMethod(yup.object, "atLeastOneNonEmptyField", function (except = []) {
  return this.test(
    "at-least-one-field",
    "At least one field is required",
    (value) => {
      return _.some(_.values(_.omit(value, except.map(x => x.key))), (fieldValue) => !_.isEmpty(fieldValue));
    }
  );
});

export const yupExt = yup;
