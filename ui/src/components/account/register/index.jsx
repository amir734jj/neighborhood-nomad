import React, {useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {Button, Form, FormGroup} from 'react-bootstrap';
import {register as registerAction} from "../../../api";
import {useNavigate} from "react-router-dom";
import {AlertDismissible, Spinner} from '../../common';
import { yupExt as yup } from "../../../utilities";
import {yupResolver} from '@hookform/resolvers/yup';
import {emailSchema, passwordConfirmationSchema, passwordSchema, usernameSchema} from "../common";
import _ from "lodash";
import {pages} from "../../../data";
import {useGlobalConfig} from "../../../state/index.js";

const schema = yup.object({
  ...usernameSchema,
  ...emailSchema,
  ...passwordSchema,
  ...passwordConfirmationSchema,
}).required();

const RegisterForm = ({registerHandler}) => {
  const {register: formRegister, handleSubmit, formState: {errors, isValid}} = useForm({
    resolver: yupResolver(schema)
  });

  const [validated, setValidated] = useState(false);

  useEffect(() => {
    setValidated(isValid);
  }, [errors, isValid]);

  return (
    <div className='d-flex justify-content-center align-items-center mt-2 mt-sm-3 mt-md-5'>
      <Form onSubmit={handleSubmit(registerHandler)} className="pure-form pure-form-aligned border p-4 rounded" validated={validated}>
        <FormGroup className='mb-3' controlId="username">
          <Form.Label column='lg'>Username</Form.Label>
          <Form.Control
            isInvalid={!!errors.username}
            {...formRegister("username")}
          />
          <Form.Text className="text-muted">
            Username
          </Form.Text>
          {errors.username ? <Form.Control.Feedback type="invalid">{errors.username.message}</Form.Control.Feedback> : null}
        </FormGroup>
        <FormGroup className='mb-3' controlId="email">
          <Form.Label column='lg'>Email</Form.Label>
          <Form.Control
            isInvalid={!!errors.email}
            {...formRegister("email")}
          />
          <Form.Text className="text-muted">
            Email address
          </Form.Text>
          {errors.email ? <Form.Control.Feedback type="invalid">{errors.email.message}</Form.Control.Feedback> : null}
        </FormGroup>
        <FormGroup className='mb-3' controlId="password">
          <Form.Label column='lg'>Password</Form.Label>
          <Form.Control
            isInvalid={!!errors.password}
            type="password"
            {...formRegister("password")}
          />
          <Form.Text className="text-muted">
            Password must be 8–20 characters long.
          </Form.Text>
          {errors.password ?
            <Form.Control.Feedback type="invalid">{errors.password.message}</Form.Control.Feedback> : null}
        </FormGroup>
        <FormGroup className='mb-3' controlId="confirm_password">
          <Form.Label column='lg'>Password Confirmation</Form.Label>
          <Form.Control
            isInvalid={!!errors.password_confirmation}
            type="password"
            {...formRegister("password_confirmation")}
          />
          <Form.Text className="text-muted">
            Password confirmation must match the password
          </Form.Text>
          {errors.password_confirmation ?
            <Form.Control.Feedback type="invalid">{errors.password_confirmation.message}</Form.Control.Feedback> : null}
        </FormGroup>
        <Button variant="primary" type="submit" className='w-100'>Register</Button>
      </Form>
    </div>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);
  const { publicGlobalConfig: { registrationEnabled = false } } = useGlobalConfig();

  const registerHandler = async (arg) => {
    try {
      setError(null); // clear any error
      await registerAction(arg);
      setRegistered(true);
      navigate(pages.login);
    } catch (e) {
      setError({
        message: e.message,
        innerError: _.isString(e.response?.data) ? [e.response?.data] : e.response?.data?.errors,
      });
    }
  };

  if (!registrationEnabled) {
    return <div style={{ width: "100%" }} className='d-flex justify-content-center align-items-center mt-1'>
      <AlertDismissible
        variant='danger'
        message={'Registration is currently disabled. Please try again later.'}
        dismissible={false}
        className='col-sm-12 col-md-6'
      />
    </div>;
  }

  if (registered) {
    return <Spinner/>;
  }

  return <div className='mt-2'>
    {error ?
      <AlertDismissible header='registering failed' variant='danger' message={error.message}>
        {error.innerError?.map((err, index) => (<p key={index}>{err}</p>))}
      </AlertDismissible> : null}
    <RegisterForm registerHandler={registerHandler}/>
  </div>;
};