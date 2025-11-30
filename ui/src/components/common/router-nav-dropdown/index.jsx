import {LinkContainer} from "react-router-bootstrap";
import {NavDropdown} from "react-bootstrap";

export const RouterNavDropDownItem = ({to, name, pathname}) => (
  <LinkContainer to={to}>
    <NavDropdown.Item active={pathname === to}>
      {name}
    </NavDropdown.Item>
  </LinkContainer>
);