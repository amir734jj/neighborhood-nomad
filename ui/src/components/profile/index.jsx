import {useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {Button, Form, FormGroup} from 'react-bootstrap';
import {updateProfile as updateProfileAction} from '../../api';
import {AlertDismissible, Spinner} from '../common';
import { yupExt as yup } from '../../utilities';
import {yupResolver} from '@hookform/resolvers/yup';
import _ from 'lodash';
import {useAuthStore} from "../../state";
import Container from "react-bootstrap/Container";
import {useNavigate} from "react-router-dom";
import {pages} from "../../data";

const schema = yup.object({
  name: yup
    .string()
    .required(),
}).required();

const ProfileForm = (arg) => {
  const navigate = useNavigate();

  const {reset: formReset, register: formRegister, handleSubmit, formState: {errors, isValid}} = useForm({
    defaultValues: arg.profile,
    resolver: yupResolver(schema)
  });

  const [validated, setValidated] = useState(false);

  const navigateToResetPassword = () => {
    navigate(pages.resetPassword, {
      state: { 
        username: arg.profile.username,
        email: arg.profile.email,
      }
    });
  };

  useEffect(() => {
    setValidated(isValid);
  }, [errors, isValid]);

  useEffect(() => {
    formReset(arg.profile);
  }, [arg.profile]);

  return (
    <Form onSubmit={handleSubmit(arg.updateProfileHandler)} className="pure-form pure-form-aligned"
      validated={validated}>
      <FormGroup className='mb-3' controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          isInvalid={!!errors.name}
          {...formRegister("name")}
        />
        {errors.firstname ? <Form.Control.Feedback type="invalid">{errors.firstname.message}</Form.Control.Feedback> : null}
      </FormGroup>
      <FormGroup className='mb-3' controlId="email">
        <Form.Label>User Email address</Form.Label>
        <Form.Control
          isInvalid={!!errors.email}
          readOnly={true}
          disabled={true}
          {...formRegister("email")}
        />
        {errors.email ? <Form.Control.Feedback type="invalid">{errors.email.message}</Form.Control.Feedback> : null}
      </FormGroup>
      <FormGroup className='mb-3' controlId="role">
        <Form.Label>Role</Form.Label>
        <Form.Control
          isInvalid={!!errors.role}
          readOnly={true}
          disabled={true}
          {...formRegister("role")}
        />
      </FormGroup>
      <Button variant="primary" type="submit" className='me-1'>Update</Button>
      <Button variant="secondary" type="button" onClick={navigateToResetPassword}>Reset Password</Button>
    </Form>
  );
};

const Profile = () => {
  const authContext = useAuthStore();

  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  const updateProfileHandler = async (arg) => {
    try {
      setError(null);
      setUpdating(true);
      const {data: user} = await updateProfileAction(arg);
      authContext.setUser(user);
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (updating) {
    return <Spinner className='mt-2' />;
  }

  return (
    <Container fluid className='mt-2'>
      { _.isBoolean(updating) && !updating ? <AlertDismissible autoHide={'5s'} header='Updating profile succeeded' variant='success' message="Successfully updated profile" /> : null }
      { error ? <AlertDismissible header='Updating profile failed' variant='danger' message={error}/> : null }
      <ProfileForm {...{profile: _.pick(authContext.auth, ['userId', 'username', 'email', 'role', 'name']), updateProfileHandler}} />
    </Container>
  );
};

export default Profile;
