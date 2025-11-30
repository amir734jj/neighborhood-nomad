import { useForm } from 'react-hook-form';
import {Button, Col, Container, Form, FormGroup, Row} from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import { login as loginAction, accountInfo as accountInfoAction } from '../../../api';
import { useNavigate } from "react-router-dom";
import {AlertDismissible, LoadingSimpleButton, Spinner} from '../../common';
import {yupExt as yup} from "../../../utilities";
import { yupResolver } from '@hookform/resolvers/yup';
import {useAuthStore} from "../../../state";
import {passwordSchema, usernameSchema} from "../common";
import {pages} from "../../../data/roles.js";
import _ from "lodash";
import Card from "react-bootstrap/Card";
import classNames from "classnames";

const schema = yup.object({
  ...usernameSchema,
  ...passwordSchema,
}).required();

const LoginForm = ({ loginHandler, status }) => {
  const { register: formRegister, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema)
  });

  const [validated, setValidated] = useState(false);

  useEffect(() => {
    setValidated(isValid);
  }, [errors, isValid]);

  return (
    <section className="h-100">
      <Container className="h-100">
        <Row className="justify-content-sm-center align-items-center h-100">
          <Col xxl={4} xl={5} lg={5} md={7} sm={9} className="mt-lg-5">
            <div className="text-center my-4">
              <h5 className="fs-4 card-title fw-bold mb-2 mt-2">Welcome to Neighborhood Nomad</h5>
            </div>
            <Card className="shadow-lg">
              <Card.Body className="p-5">
                <Form className="needs-validation" noValidate validated={validated}>
                  <FormGroup className='mb-3' controlId="username">
                    <Form.Label column='lg' className="mb-2 text-muted">Username</Form.Label>
                    <Form.Control
                      type="text"
                      isInvalid={!!errors.username}
                      className={classNames("form-control", {'is-invalid': errors.username})}
                      autoFocus
                      autoComplete='on'
                      {...formRegister("username")}
                    />
                    {errors.username && <Form.Control.Feedback type="invalid">{errors.username.message}</Form.Control.Feedback>}
                  </FormGroup>
                  <FormGroup className="mb-3" controlId="password">
                    <div className="mb-2 w-100 d-flex justify-content-between">
                      <Form.Label column="lg" className="mb-2 text-muted">Password</Form.Label>
                      <Button variant="link" href={pages.forgotPasswordRequest} 
                        className='p-0 fs-6 align-bottom link-primary align-self-center
                         mb-2 link-offset-2 link-offset-3-hover link-underline link-underline-opacity-50
                         link-underline-opacity-75-hover'>
                        Forgot Password?</Button>
                    </div>
                    <Form.Control
                      isInvalid={!!errors.password}
                      className={classNames("form-control", {'is-invalid': errors.password})}
                      type="password"
                      autoComplete="on"
                      {...formRegister("password")}
                    />
                    <Form.Text className="text-muted">
                      Password must be 8–20 characters long.
                    </Form.Text>
                    {errors.password && <Form.Control.Feedback type="invalid">{errors.password.message}</Form.Control.Feedback>}
                  </FormGroup>
                  <LoadingSimpleButton className='btn-primary' wide onClick={handleSubmit(loginHandler)}>Login</LoadingSimpleButton>
                  {status && <Form.Text className="text-muted pt-2">Status: {status}</Form.Text>}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export const Login = () => {
  const [error, setError] = useState(null);

  const [loggedIn, setLoggedIn] = useState(false);
  const [status, setStatus] = useState(null);

  const authContext = useAuthStore();
  const navigate = useNavigate();

  const loginHandler = async (arg) => {
    try {
      setStatus("Logging in");
      setError(null); // clear any error
      const { data: token } = await loginAction(arg);
      authContext.setToken(token);
      setStatus("Getting user profile");
      const { data: user } = await accountInfoAction();
      setStatus("Successfully fetched user profile");
      authContext.setUser(user);
      setLoggedIn(true);
      setStatus("Redirecting");
      navigate(pages.root);
    } catch (e) {
      setStatus("Failed to login");
      setError({
        message: e.message,
        innerError: _.isString(e.response?.data) ? [e.response?.data] : e.response?.data?.errors,
      });
    } finally {
      setStatus(null);
    }
  };

  if (loggedIn) {
    return <Spinner />;
  }

  return <div className='mt-2'>
    {error ?
      <AlertDismissible variant='danger'>
        {error.innerError?.map((err, index) => (<p key={index} className='bold'>{err}</p>))}
      </AlertDismissible> : null}
    <LoginForm loginHandler={loginHandler} status={status} />
  </div>;
};