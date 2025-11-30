import React, {useEffect} from "react";
import {DropdownButton, Dropdown} from "react-bootstrap";
import store from "store2";
import {STORE_THEME} from "../../../constants";
import {useThemeSelector} from "../../../state";

export const ThemeSelector = () => {
  const {theme: currentTheme, themes, setTheme } = useThemeSelector();

  useEffect(() => {
    if (store.has(STORE_THEME)) {
      setTheme(store.get(STORE_THEME));
    }
  }, []);

  useEffect(() => {
    const head = document.head;
    const link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";

    if (currentTheme === "default") {
      link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
    } else {
      link.href = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/${currentTheme}/bootstrap.min.css`;
    }

    head.appendChild(link);

    return () => {
      head.removeChild(link);
    };
  }, [currentTheme]);

  return <div className='d-none'>
    <DropdownButton
      key="theme-selector"
      id={`dropdown-button-drop-`}
      drop={"end"}
      variant="secondary"
      title={`Drop`}
      defaultValue={currentTheme}
    >
      { themes.map(theme => (<Dropdown.Item eventKey={theme} key={theme} onClick={() => setTheme(theme)} active={currentTheme === theme}>{theme}</Dropdown.Item>)) }
    </DropdownButton>
  </div>;
};