import { useForm } from 'react-hook-form';
import {CardBody, CardHeader, Col, Container, Form, FormGroup, Row} from 'react-bootstrap';
import React, {Fragment, useEffect, useState} from "react";
import { passwordResetSubmit} from '../../../api';
import {Link, useSearchParams} from "react-router-dom";
import {AlertDismissible, LoadingSimpleButton} from '../../common';
import {yupExt as yup} from "../../../utilities";
import { yupResolver } from '@hookform/resolvers/yup';
import {emailSchema, passwordConfirmationSchema, passwordSchema, usernameSchema} from "../common";
import _ from "lodash";
import {pages} from "../../../data";
import Card from "react-bootstrap/Card";
import classNames from "classnames";

const schema = yup.object({
  ...emailSchema,
  ...usernameSchema,
  ...passwordSchema,
  ...passwordConfirmationSchema,
}).required();

const ForgotPasswordForm = ({ token, email, username, forgotPasswordRequestHandler, enabled }) => {
  const { reset: formReset, register: formRegister, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      token, email, username
    }
  });

  const [validated, setValidated] = useState(false);

  useEffect(() => {
    setValidated(isValid);
  }, [errors, isValid]);

  useEffect(() => {
    formReset({ token, email, username });
  }, [token, email, username]);

  return (
    <section className="h-100">
      <Container className="h-100">
        <Row className="justify-content-sm-center align-items-center h-100">
          <Col xxl={4} xl={5} lg={5} md={7} sm={9} className="mt-lg-5">
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
                      disabled={true}
                      {...formRegister("username")}
                    />
                    <Form.Text className="text-muted">
                      Username used to login
                    </Form.Text>
                    {errors.username && <Form.Control.Feedback type="invalid">{errors.username.message}</Form.Control.Feedback>}
                  </FormGroup>
                  <FormGroup className='mb-3' controlId="email">
                    <Form.Label column='lg' className="mb-2 text-muted">Email</Form.Label>
                    <Form.Control
                      type="email"
                      isInvalid={!!errors.email}
                      className={classNames("form-control", {'is-invalid': errors.email})}
                      disabled={true}
                      {...formRegister("email")}
                    />
                    <Form.Text className="text-muted">
                      Email address used to login
                    </Form.Text>
                    {errors.email && <Form.Control.Feedback type="invalid">{errors.email.message}</Form.Control.Feedback>}
                  </FormGroup>
                  <FormGroup className="mb-3" controlId="password">
                    <Form.Label column="lg" className="mb-2 text-muted">Password</Form.Label>
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
                  <FormGroup className='mb-3' controlId="confirm_password">
                    <Form.Label column='lg' className="mb-2 text-muted">Password Confirmation</Form.Label>
                    <Form.Control
                      isInvalid={!!errors.password_confirmation}
                      className={classNames("form-control", {'is-invalid': errors.password_confirmation})}
                      type="password"
                      autoComplete="on"
                      {...formRegister("password_confirmation")}
                    />
                    <Form.Text className="text-muted">
                      Password confirmation must match the password
                    </Form.Text>
                    {errors.password_confirmation && <Form.Control.Feedback type="invalid">{errors.password_confirmation.message}</Form.Control.Feedback>}
                  </FormGroup>
                  <LoadingSimpleButton className='btn-primary' wide disabled={!enabled}
                    onClick={handleSubmit(forgotPasswordRequestHandler)}>Submit Password
                    Reset</LoadingSimpleButton>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export const ForgotPasswordSubmit = () => {
  const [error, setError] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const username = searchParams.get("username");

  const forgotPasswordRequestHandler = async ({ password, token }) => {
    try {
      setEnabled(false);
      setError(null); // clear any error
      await passwordResetSubmit({email, token, username, password});
      setRequestSubmitted(true);
      setSearchParams({});
    } catch (e) {
      setEnabled(true);
      setError({
        message: e.message,
        innerError: _.isString(e.response?.data) ? [e.response?.data] : e.response?.data?.errors,
      });
    }
  };

  return <div className='mt-2'>
    { requestSubmitted ? <AlertDismissible
      dismissible={false}
      header='Success'
      variant='success'
      message={<Fragment>
        <p>
          Successfully reset password. Please <Link to={pages.login}>
            login
          </Link> using new password.
        </p>
      </Fragment>}
    /> : null }
    {error ?
      <AlertDismissible header='Error' variant='danger' message={error.message}>
        {error.innerError?.map((err, index) => (<p key={index}>{err}</p>))}
      </AlertDismissible> : null}
    <ForgotPasswordForm forgotPasswordRequestHandler={forgotPasswordRequestHandler} {...{ email, username, token, enabled }}/>
  </div>;
};
