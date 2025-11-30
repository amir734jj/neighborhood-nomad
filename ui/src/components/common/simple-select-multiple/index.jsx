import React, {useState} from "react";
import Select from "react-select";
import chroma from 'chroma-js';
import _ from "lodash";
import {useIsDarkMode} from "../../../state";

const square = (color = 'transparent') => ({
  alignItems: 'center',
  display: 'flex',
  ':before': {
    backgroundColor: color,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: '1.2rem',
    width: '0.6rem',
  },
});

export const SimpleSelectMultiple = ({ options, selectAllMessage = "Select All", onChange = _.noop, colorSelector = null, valueItemToOption = null, value, ...props }) => {
  const isDarkMode = useIsDarkMode();
  const [placeholder, setPlaceholder] = useState('Select an option...');

  const textColor = isDarkMode ? 'white' : 'black';
  const bgColor = isDarkMode ? '#212529' : '#ffffff';
  const mixedColor = (color) => chroma.mix(color, textColor, 0.8, 'lrgb').hex();

  const defaultStyle = {
    placeholder: (styles) => ({...styles, backgroundColor: bgColor, color: textColor}),
    control: (styles) => ({ ...styles, backgroundColor: 'transparent' }),
    groupHeading: (styles) => ({...styles, color: 'gray', fontWeight: 'bold' }),
    valueContainer: (styles) => ({...styles, backgroundColor: bgColor}),
    menuList: (styles) => ({...styles, backgroundColor: bgColor}),
    multiValueLabel: (styles) => ({...styles, backgroundColor: isDarkMode ? chroma(bgColor).brighten().hex() : chroma(bgColor).darken().hex(), color: textColor}),
    multiValueRemove: (styles) => ({...styles, backgroundColor: isDarkMode ? chroma(bgColor).brighten().hex() : chroma(bgColor).darken().hex(),
      ':hover': {
        color: isDarkMode ? chroma(textColor).darken(5).hex() : chroma(textColor).brighten(5).hex(),
        backgroundColor: isDarkMode ? chroma(bgColor).brighten(2).hex() : chroma(bgColor).darken(2).hex()
      }}),
    multiValue: (styles) => ({...styles, backgroundColor: isDarkMode ? chroma(bgColor).brighten().hex() : chroma(bgColor).darken().hex()}),
    option: (styles, { isDisabled, isFocused, isSelected }) => {
      const chromaColor = chroma('#34ebe5');
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
            ? chromaColor.alpha(0.1).hex()
            : isFocused
              ? chromaColor.alpha(0.3).hex()
              : undefined,
        color: isSelected
          ? mixedColor(chromaColor)
          : isFocused
            ? mixedColor(chromaColor)
            : textColor,
        cursor: isDisabled ? 'not-allowed' : 'default',
        ':active': {
          ...styles[':active'],
          backgroundColor: !isDisabled
            ? isSelected
              ? textColor
              : chromaColor.alpha(0.5).hex()
            : undefined,
        },
      };
    },
  };

  const colorStyles = {
    control: (styles) => ({ ...styles, backgroundColor: 'transparent' }),
    groupHeading: (styles) => ({...styles, color: 'gray', fontWeight: 'bold' }),
    valueContainer: (styles) => ({...styles, backgroundColor: bgColor}),
    group: (styles) => ({...styles, backgroundColor: bgColor}),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      const color = colorSelector(data.source);
      const chromaColor = chroma(color);
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
            ? chromaColor.alpha(0.1).hex()
            : isFocused
              ? chromaColor.alpha(0.3).hex()
              : undefined,
        color: isSelected
          ? mixedColor(chromaColor)
          : isFocused
            ? mixedColor(chromaColor)
            : textColor,
        ...square(chromaColor.css()),
        cursor: isDisabled ? 'not-allowed' : 'default',
        ':active': {
          ...styles[':active'],
          backgroundColor: !isDisabled
            ? isSelected
              ? color
              : chromaColor.alpha(0.5).hex()
            : undefined,
        },
      };
    },
    input: (styles) => ({ ...styles, ...square(), color: textColor}),
    placeholder: (styles) => ({ ...styles, color: textColor }),
    menuList: (styles) => ({...styles, backgroundColor: bgColor}),
    multiValue: (styles, { data }) => {
      const color = colorSelector(data.source);
      return ({...styles, color: bgColor, backgroundColor: chroma(color).alpha(0.4).hex(),});
    },
    multiValueLabel: (styles) => ({...styles, backgroundColor: isDarkMode ? chroma(bgColor).brighten().hex() : chroma(bgColor).darken().hex(), color: textColor}),
    multiValueRemove: (styles, { data }) => {
      const color = colorSelector(data.source);
      return ({
        ...styles,
        color: isDarkMode ? chroma(color).brighten(3).hex() : chroma(color).darken(3).hex(),
        backgroundColor: chroma(color).alpha(0.4).hex(),
        ':hover': {
          color: isDarkMode ? chroma(color).darken(5).hex() : chroma(color).brighten(5).hex(),
          backgroundColor: isDarkMode ? chroma(color).alpha(0.4).brighter(2).hex() : chroma(color).alpha(0.4).darker(2).hex(),
        },
      });
    },
  };

  const defaultValueItemToOption = x => _.find(options, { value: x });

  return (
    <Select
      isMulti
      placeholder={placeholder}
      onFocus={() => setPlaceholder(selectAllMessage)}
      onBlur={() => {
        if (options.length === 0) {
          setPlaceholder('Select an option...');
        } else {
          setPlaceholder(selectAllMessage);
        }
      }}
      isClearable={true}
      isSearchable={true}
      closeMenuOnSelect={false}
      options={options}
      onChange={option => {
        onChange(option);
      }}
      value={_.isArray(value) ? value.map(item => (valueItemToOption ?? defaultValueItemToOption)(item)) : null}
      styles={_.isFunction(colorSelector) ? colorStyles : defaultStyle}
      {...props}
    />
  );
};