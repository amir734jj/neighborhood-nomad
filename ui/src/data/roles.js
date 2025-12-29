import _ from "lodash";

export const pages = {
  login: "/login",
  register: "/register",
  forgotPasswordRequest: "/forgot-password/request",
  forgotPasswordSubmit: "/forgot-password/submit",
  invite: "/invite",
  profile: "/profile",
  resetPassword: "/reset-password",
  logout: "/logout",
  admin: "/admin",
  configuration: "/configuration",
  about: "/about",
  journey: {
    root: "/journey",
    byId: {
      view: "/journey/:journeyId",
      edit: "/journey/:journeyId/edit",
    }
  },
  root: "/",
  any: "*",
};

export const getCompiledPath = (route, params) => {
  const compiled = _.template(route.replace(/:([a-zA-Z0-9_]+)/g, '<%= $1 %>'));
  return compiled(params);
};