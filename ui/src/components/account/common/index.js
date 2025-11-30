import {yupExt as yup} from "../../../utilities";

export const usernameSchema = {
  username: yup
    .string()
    .min(3, "must be at least 3 characters long")
    .max(60, "must be at most 60 characters long")
    .required(),
};

export const emailSchema = {
  email: yup
    .string()
    .email("must be a valid email")
    .required(),
};

export const passwordSchema = {
  password: yup
    .string()
    .min(8, "must be at least 8 characters long")
    .max(30, "must be at most 30 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    )
    .required(),
};

export const passwordConfirmationSchema = {
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'passwords do not match')
    .required("password confirmation is required"),
};

