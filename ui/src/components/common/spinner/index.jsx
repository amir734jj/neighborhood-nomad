import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import {Fragment} from "react";
import _ from "lodash";

export const Spinner = ({ size = "", percentage = null, className = '', style = {}}) => {
  if (size) {
    style = {
      ...style,
      height: size,
      width: size,
    };
  }

  return (
    <Fragment>
      <BootstrapSpinner animation="border" role="status" className={className} style={style}>
        <span className="visually-hidden">Loading...</span>
      </BootstrapSpinner>
      {percentage ? <div className="mt-2">{_.round(percentage)}%</div> : null}
    </Fragment>
  );
};