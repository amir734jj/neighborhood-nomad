import {useDarkMode} from "usehooks-ts";
import React, {useEffect} from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {GoogleIcon} from "../google-icon";
import {useColorMode, useIsDarkMode} from "../../../state";

export const DarkMode = ({ className, style, doInitialSetup = false }) => {
  const {setColorMode, toggleColorMode } = useColorMode();
  const {isDarkMode: isSystemDarkMode} = useDarkMode({
    defaultValue: false  // default to light-mode if we can't figure out system's color setting
  });
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    if (doInitialSetup) {
      if (isDarkMode !== isSystemDarkMode) {
        setColorMode(isSystemDarkMode);
      }
    }
  }, []);

  const darkModeIcon = (<GoogleIcon icon='dark_mode' lineHeight='1.5' />);
  const lightModeIcon = (<GoogleIcon icon='light_mode' lineHeight='1.5' />);

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      darkMode: {isDarkMode.toString()},
      SystemDarkMode: {isSystemDarkMode.toString()}
    </Tooltip>
  );

  return <div className={className} style={style}>
    <OverlayTrigger
      placement="auto-start"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <span onClick={toggleColorMode}
        style={{ cursor: 'pointer' }}>
        {isDarkMode ? lightModeIcon : darkModeIcon}
      </span>
    </OverlayTrigger>
  </div>;
};
