import classNames from "classnames";
import _ from "lodash";
import {Spinner} from "../spinner";
import React from "react";

export const SimpleButton = ({loading = false, wide = false, tooltip = '', disabled = false, type = "button", onClick, children, className, style = {}, spanProps = {}, ...props}) => {
  const buttonProps = { ...props };
  
  if (tooltip) {
    buttonProps['data-bs-toggle'] = "tooltip";
    buttonProps['data-bs-placement'] = "bottom";
    buttonProps['title'] = tooltip;
  }

  return (
    <button
      {...buttonProps}
      type={type}
      onClick={onClick}
      className={classNames('btn', { 'w-100': wide }, className)}
      style={_.extend({}, style, {borderColor: "transparent"})}
      disabled={disabled}>
      { loading ? <Spinner className='me-1' size='1rem' /> : null }
      {children}
    </button>
  );
};
