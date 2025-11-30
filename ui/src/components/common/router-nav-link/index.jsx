import {LinkContainer} from "react-router-bootstrap";
import Nav from "react-bootstrap/Nav";

export const RouterNavLink = ({to, name, pathname, children, style, showLabel = true, additionalActiveRoute = [] }) => {

  let toolTipProps = {};
  if (!showLabel) {
    toolTipProps = {
      'data-bs-toggle': "tooltip",
      'data-bs-placement': "bottom",
      title: name
    };
  }

  return (
    <LinkContainer to={to} style={{alignContent: 'center', display: 'flex', ...style}} className='align-items-center' {...toolTipProps}>
      <Nav.Link active={additionalActiveRoute.concat([to]).includes(pathname)}>
        {children}
        {showLabel ? name : null}
      </Nav.Link>
    </LinkContainer>
  );
};