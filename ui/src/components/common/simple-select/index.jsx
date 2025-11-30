import React from "react";
import Select from "react-select";
import chroma from 'chroma-js';
import _ from "lodash";
import {useColorMode} from "../../../state";

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

export const SimpleSelect = ({ options, onChange = _.noop, colorSelector = null, value, ...props }) => {

  const { colorMode } = useColorMode();
  const textColor = colorMode === 'light' ? 'black' : 'white';
  const bgColor = colorMode === 'light' ? 'white' : 'var(--bs-body-bg)';
  const mixedColor = (color) => chroma.mix(color, textColor, 0.8, 'lrgb').hex();
  
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
    placeholder: (styles) => ({ ...styles, ...square('#ccc'), color: textColor}),
    singleValue: (styles, { data }) => {
      const color = colorSelector(data.source);
      return ({...styles, ...square(color), color: textColor});
    },
  };

  return (
    <Select
      isClearable={true}
      isSearchable={true}
      closeMenuOnSelect={true}
      options={options}
      onChange={option => {
        onChange(option);
      }}
      value={value}
      styles={_.isFunction(colorSelector) ? colorStyles : null}
      {...props}
    />
  );
};