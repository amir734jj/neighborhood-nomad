import {Route, Routes} from 'react-router-dom';
import './App.scss';
import {useAuthStore} from "./state";
import {Header} from "./components/layout";
import {Login} from "./components/account/login";
import {ForgotPasswordRequest, ForgotPasswordSubmit, Logout, Register} from "./components/account";
import {Col, Container, Row} from "react-bootstrap";
import About from "./pages/About";
import {pages} from "./data/roles";
import {DarkMode, GoogleMapApiLoader, LoadPublicConfig, NotAuthorize, Spinner} from "./components/common";
import React, {Fragment} from "react";
import Board from "./pages/Board.jsx";
import Profile from "./components/profile";
import {ResetPassword} from "./components/account/reset-password";
import Configuration from "./pages/Configuration.jsx";
import {Admin} from "./components/admin";
import {EditJourney, ListJourneys} from "./components/journey/index.js";
import {ThemeSelector} from "./components/common/theme-selector/index.jsx";

const App = () => {
  const authContext = useAuthStore();
  const isLoggedIn = !!authContext?.auth;
  const authInitialized = authContext.initialized;

  return (
    <Fragment>
      <LoadPublicConfig />
      <GoogleMapApiLoader>
        <Fragment>
          <Header/>
          <Container fluid className='ps-0 pe-0'>
            <div className='mx-0 d-flex root-container min-vh-md-100'>
              <Container className='main-container' fluid>
                <Row>
                  <Col sm={12}>
                    <Routes>
                      {authInitialized ? <Fragment>
                        <Route path={pages.about} element={<About/>} key="about"/>
                        <Route path={pages.root} element={<Board/>} key="home"/>
                        {isLoggedIn ? <Fragment>
                          <Route path={pages.logout} element={<Logout/>} key="logout"/>
                          <Route path={pages.profile} element={<Profile/>} key="profile"/>
                          <Route path={pages.journeyById} element={<EditJourney/>} key="edit-journey"/>
                          <Route path={pages.journeys} element={<ListJourneys/>} key="list-journeys"/>
                          <Route path={pages.resetPassword} element={<ResetPassword/>} key="reset-password"/>
                          <Route path={pages.configuration} element={<Configuration/>} key="configuration"/>
                          <Route path={pages.admin} element={<Admin/>} key="admin"/>
                        </Fragment> : <Fragment>
                          <Route path={pages.login} element={<Login/>} key="login"/>
                          <Route path={pages.register} element={<Register/>} key="register"/>
                          <Route path={pages.forgotPasswordRequest} element={<ForgotPasswordRequest/>} key="forgot-password-request"/>
                          <Route path={pages.forgotPasswordSubmit} element={<ForgotPasswordSubmit/>} key="forgot-password-submit"/>
                        </Fragment>}
                        <Route path={pages.any} element={<NotAuthorize/>} key="no-match"/>
                      </Fragment> : <Route path={pages.any} element={<Spinner/>} key="wait-until-load-completes"/> }
                    </Routes>
                  </Col>
                </Row>
              </Container>
            </div>
          </Container>
        </Fragment>
      </GoogleMapApiLoader>
    </Fragment>
  );
};

export default App;
