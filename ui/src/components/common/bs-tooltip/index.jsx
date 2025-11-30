import React from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

export const BsTooltip = ({className = '', style = {}, message, children }) => {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {message}
    </Tooltip>
  );

  return <div className={className} style={style}>
    <OverlayTrigger
      show={true}
      placement="auto-start"
      delay={{show: 250, hide: 400}}
      overlay={renderTooltip}
    >
      {children}
    </OverlayTrigger>
  </div>;
};