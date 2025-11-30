import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {useAuthStore} from "../../state";
import {useLocation} from "react-router-dom";
import {NavDropdown} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserCircle} from "@fortawesome/free-solid-svg-icons";
import React, {Fragment} from "react";
import './style.scss';
import {RouterNavDropDownItem, RouterNavLink} from "../common";
import {pages} from "../../data/roles";

const BasicNavbar = () => {
  const authContext = useAuthStore();
  const isLoggedIn = !!authContext?.auth;
  const {pathname} = useLocation();

  return (
    <Navbar expand="lg" className="bg-body-tertiary align-items-center">
      <Container fluid className="align-items-center">
        <Navbar.Brand href="/" style={{ fontSize: '1rem' }} >
          Neighborhood Nomad
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Nav className="me-auto">
          { isLoggedIn ? <Fragment>
            <RouterNavLink to={pages.configuration} name='Configuration' pathname={pathname} />
            <RouterNavLink to={pages.journeys} name='Journeys' pathname={pathname} />
          </Fragment> : null }
          <RouterNavLink to={pages.about} name='About' pathname={pathname} />
        </Nav>
        { isLoggedIn ? <Navbar.Collapse id="basic-navbar-nav">
          <Nav className='ms-auto'>
            <Nav.Item className="mx-2 nav-item d-flex align-items-center">
              { `Hello${authContext.auth?.name ? `, ${authContext.auth?.name}` : ", user" }` }
            </Nav.Item>
            <NavDropdown
              title={<FontAwesomeIcon icon={faUserCircle} size='2xl'/>}
              id="basic-nav-dropdown"
              align="end"
              className='mx-2'
            >
              <RouterNavDropDownItem to={pages.profile} name='Profile' pathname={pathname} />
              <RouterNavDropDownItem to={pages.logout} name='Logout' pathname={pathname} />
            </NavDropdown>
          </Nav>
        </Navbar.Collapse> : null}
      </Container>
    </Navbar>
  );
};

export default BasicNavbar;
