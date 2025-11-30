import { useForm } from 'react-hook-form';
import {CardHeader, Col, Container, Form, FormGroup, Row} from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import { passwordResetRequest} from '../../../api';
import {AlertDismissible, LoadingSimpleButton} from '../../common';
import {yupExt as yup} from "../../../utilities";
import { yupResolver } from '@hookform/resolvers/yup';
import {emailSchema, usernameSchema} from "../common";
import _ from "lodash";
import Card from "react-bootstrap/Card";
import classNames from "classnames";
import {useIsDarkMode} from "../../../state";

const schema = yup.object({
  ...emailSchema,
  ...usernameSchema,
}).required();

const ForgotPasswordForm = ({ forgotPasswordRequestHandler, enabled }) => {
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
                      isInvalid={!!errors.email}
                      className={classNames("form-control", {'is-invalid': errors.email})}
                      type="email"
                      autoComplete="on"
                      {...formRegister("email")}
                    />
                    <Form.Text className="text-muted">
                      Email address used to register
                    </Form.Text>
                    {errors.email && <Form.Control.Feedback type="invalid">{errors.email.message}</Form.Control.Feedback>}
                  </FormGroup>
                  <LoadingSimpleButton wide className="btn-primary" disabled={!enabled}
                    onClick={handleSubmit(forgotPasswordRequestHandler)}>Submit Password Reset
                    Request</LoadingSimpleButton>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export const ForgotPasswordRequest = () => {
  const [error, setError] = useState(null);

  const [sentRequest, setSentRequest] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const forgotPasswordRequestHandler = async ({email, username}) => {
    try {
      setEnabled(false);
      setError(null); // clear any error
      await passwordResetRequest({email, username});
      setSentRequest(true);
    } catch (e) {
      setEnabled(true);
      setError({
        message: e.message,
        innerError: _.isString(e.response?.data) ? [e.response?.data] : e.response?.data?.errors,
      });
    }
  };

  return <div className='mt-2'>
    {sentRequest ? <AlertDismissible
      header='Success'
      variant='success'
      message='Successfully sent password request. Please check your email.'
    /> : null}
    {error ?
      <AlertDismissible header='Error' variant='danger' message={error.message}>
        {error.innerError?.map((err, index) => (<p key={index}>{err}</p>))}
      </AlertDismissible> : null}
    <ForgotPasswordForm forgotPasswordRequestHandler={forgotPasswordRequestHandler} enabled={enabled}/>
  </div>;
};