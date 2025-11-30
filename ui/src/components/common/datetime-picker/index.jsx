import React, {useEffect, useState} from "react";
import ReactDateTimePicker from 'react-datetime';
import _ from 'lodash';
import {useColorMode} from "../../../state";
import classNames from "classnames";
import "./index.scss";
import {DateTime} from "luxon";

// Convert moment.js date to regular date
const normalizeMomentJsDate = (value, useEndOfDay) => {
  if (!value || _.isString(value)) {
    return '';
  }
  if (value.isValid()) {
    if (useEndOfDay) {
      return value.clone().endOf('day').toDate();
    }

    return value.toDate();
  } else {
    return '';
  }
};

const DATE_FORMAT = "MM/dd/yyyy";

export const DatetimePicker = ({ onChange = _.noop, useEndOfDay = false, defaultValue = null, timePicker = false, datePicker = true, isInvalid = false, value = null, isValidDate = (_) => true, disabled = false, highlightedDays = [] }) => {
  const { colorMode } = useColorMode();

  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    if (!value && currentValue) {
      setCurrentValue('');
    } else if (value) {
      if (_.isDate(value)) {
        value = DateTime.fromJSDate(value).toISODate();
      }

      if (currentValue) {
        let currentDatetime = DateTime.fromFormat(currentValue, DATE_FORMAT);
        if (useEndOfDay) {
          currentDatetime = currentDatetime.endOf('day');
        }

        if (!DateTime.fromISO(value).equals(currentDatetime)) {
          setCurrentValue(DateTime.fromISO(value).toFormat(DATE_FORMAT));
        }
      } else {
        setCurrentValue(DateTime.fromISO(value).toFormat(DATE_FORMAT));
      }
    }
  }, [value, useEndOfDay]);

  return (
    <ReactDateTimePicker
      isValidDate={updatedValue => {
        return isValidDate(normalizeMomentJsDate(updatedValue, useEndOfDay));
      }}
      onChange={updatedValue => {
        if (!_.isString(updatedValue)) {
          setCurrentValue(DateTime.fromJSDate(updatedValue.toDate()).toFormat(DATE_FORMAT));
        }
        onChange(normalizeMomentJsDate(updatedValue, useEndOfDay));
      }}
      renderDay={({key, ...props}, currentDate) => {
        const isHighlighted = _.compact(highlightedDays).filter(highlightedDay => currentDate.isSame(highlightedDay, "day")).length;
        const isSelected = currentDate.isSame(value, "day");

        const style = {
          backgroundColor: isSelected
            ? "#3399ff"
            : isHighlighted
              ? "#ffd700"
              : undefined,
          borderRadius: "50%",
          padding: "5px",
          color: isSelected || isHighlighted ? "white" : undefined,
        };

        return (
          <td {...props} style={style} key={key}>
            {currentDate.date()}
          </td>
        );
      }}
      // bug with react-date-picker library
      // https://stackoverflow.com/a/64972324/1834787
      renderInput={(props) => {
        return <input {...props} value={currentValue} onChange={event => {
          setCurrentValue(event.target.value);
          props.onChange(event);
        }} />;
      }}
      closeOnSelect={true}
      initialValue={defaultValue}
      timeFormat={timePicker}
      dateFormat={datePicker}
      value={value ? new Date(value) : null}
      className={classNames("datetime-picker", { "datetime-picker_dark-mode": colorMode === "dark", "datetime-picker_light-mode": colorMode === "light", "disabled": disabled })}
      inputProps={{
        className: classNames("form-control", { 'is-invalid': isInvalid }),
        placeholder: DATE_FORMAT
      }}
    />
  );
};
