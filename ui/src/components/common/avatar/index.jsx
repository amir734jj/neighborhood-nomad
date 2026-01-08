import React, {useEffect, useRef} from 'react';
import {toSvg} from 'jdenticon';
import './index.scss';
import _ from "lodash";

export const Avatar = ({ text, size = 40, onClick = _.noop, className = '' }) => {
  const iconRef = useRef(null);

  useEffect(() => {
    if (iconRef.current && text) {
      iconRef.current.innerHTML = toSvg(text, size);
    }
  }, [text, size]);

  const handleClick = () => {
    if (onClick) {
      onClick(text);
    }
  };

  return (
    <div
      ref={iconRef}
      className={`user-avatar ${onClick ? 'clickable' : ''} ${className}`}
      onClick={handleClick}
      title={text}
      style={{ width: size, height: size }}
    />
  );
};
