import {GoogleIcon} from "../google-icon";
import React from "react";
import {useSideBarMode} from "../../../state";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

export const SidebarToggle = ({className = '', style = {} }) => {
  const { isSideBarOpen, toggleSideBarOpen } = useSideBarMode();

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {isSideBarOpen ? "Close Sidebar" : "Open Sidebar"}
    </Tooltip>
  );

  return <div className={className} style={style}>
    <OverlayTrigger
      placement="auto-start"
      delay={{show: 250, hide: 400}}
      overlay={renderTooltip}
    >
      <span onClick={toggleSideBarOpen} style={{cursor: 'pointer'}}>
        <GoogleIcon icon={isSideBarOpen ? "left_panel_close" : "left_panel_open"} className='mx-2'/>
      </span>
    </OverlayTrigger>
  </div>;
};