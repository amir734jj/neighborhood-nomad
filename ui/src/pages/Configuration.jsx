import React, {Fragment, useEffect, useState} from "react";
import { Button, Form, Row, Col, Accordion } from "react-bootstrap";
import { useGlobalConfig } from "../state";
import {
  getGlobalConfig as getGlobalConfigAction, isSenderRegistered, registerSender,
  setGlobalConfig as setGlobalConfigAction,
} from "../api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { yupExt as yup } from "../utilities";
import {AlertDismissible, LoadingSimpleButton, Spinner} from "../components/common";

const globalConfigSchema = yup
  .object({
    geocodioApiKey: yup.string().required(),
    mailjetApiKey: yup.string().required(),
    mailjetApiSecret: yup.string().required(),
    emailTestMode: yup.boolean().required(),
    websiteAdminEmail: yup.string().email().required(),
    websiteAddress: yup.string().url().required(),
    googleMapsAutoComplete: yup.string().required(),
    emailCCMode: yup.boolean().required(),
  })
  .required();

const Configuration = () => {
  const { initialized, globalConfig, setGlobalConfig, setInitialized } = useGlobalConfig();

  const {
    watch: formWatch,
    reset: formReset,
    register: formRegister,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(globalConfigSchema),
    defaultValues: globalConfig,
  });

  const [validated, setValidated] = useState(false);
  const [formValues, setFormValues] = useState(globalConfig);
  const [registeredToSendEmail, setRegisteredToSendEmail] = useState(null);
  const [requestToRegisterToSendEmail, setRequestToRegisterToSendEmail] = useState(null);
  const canSendEmails = registeredToSendEmail !== null && registeredToSendEmail.success;

  useEffect(() => {
    formReset(globalConfig);
  }, [globalConfig]);

  useEffect(() => {
    const subscription = formWatch((form) => {
      setFormValues(form);
    });
    return () => subscription.unsubscribe();
  }, [formWatch]);

  useEffect(() => {
    setValidated(isValid);
  }, [errors, isValid]);

  const checkRegisteredToSendEmail = (email) => {
    isSenderRegistered(email).then(({data}) => {
      setRegisteredToSendEmail({
        success: data.success,
        message: data.message,
      });
    });
  };

  const requestToRegisteredToSendEmailHandler = (email) => {
    setRequestToRegisterToSendEmail(null);
    registerSender(email).then(({data}) => {
      setRequestToRegisterToSendEmail({
        success: data.success,
        message: data.message,
      });
    }).then(() => checkRegisteredToSendEmail(email));
  };

  useEffect(() => {
    if (formValues.websiteAdminEmail) {
      checkRegisteredToSendEmail(formValues.websiteAdminEmail);
    }
  }, [formValues.websiteAdminEmail]);

  const refresh = () => {
    getGlobalConfigAction()
      .then(({ data }) => {
        setGlobalConfig(data);
      })
      .finally(() => {
        setInitialized(true);
      });
  };

  useEffect(() => {
    if (!initialized) {
      refresh();
    }
  }, []);

  const handleEditGlobalConfig = async (form) => {
    await setGlobalConfigAction(form);
    refresh();
  };

  if (!initialized) {
    return <Spinner className="mt-2" />;
  }

  return (
    <div className="mt-2 ms-1">
      { (registeredToSendEmail && !registeredToSendEmail.success) ? <AlertDismissible
        className='py-2'
        variant='danger'
        dismissible={false}
        message={registeredToSendEmail?.message}
        header={"Website email not registered to send emails"}>
        <p>
          {requestToRegisterToSendEmail?.message}
        </p>
        <Button variant='outline-primary' onClick={() => requestToRegisteredToSendEmailHandler(formValues.websiteAdminEmail)} className='me-2'>Register To Send Emails</Button>
        <Button variant='outline-secondary' onClick={() => checkRegisteredToSendEmail(formValues.websiteAdminEmail)}>Refresh</Button>
      </AlertDismissible> : null }

      {globalConfig.quickBooksSandboxMode || globalConfig.emailTestMode ? (
        <AlertDismissible
          variant={globalConfig.emailTestMode ? "warning" : "secondary"}
          dismissible={false}
          header={ globalConfig.emailTestMode ? 'Test Mode is Active' : "SandboxMode is Active" }
          message={
            <Fragment>
              {globalConfig.emailTestMode ? (
                <p>
                  Email test mode is active; no emails are being sent to customers.
                  Emails will instead be sent to {globalConfig.websiteAdminEmail}
                </p>
              ) : null}
            </Fragment>
          } />
      ) : null}

      <Form validated={validated}>
        <Row>
          <Col xs={6}>
            <Form.Group className="mb-3" controlId="emailtestmode">
              <Form.Check
                type="switch"
                className="mb-2"
                label={"Email Test Mode"}
                {...formRegister("emailTestMode")}
              />
              <Form.Text className="text-muted">
                In Email test mode, all emails will be sent to admin email
                address.
              </Form.Text>
              {errors.emailTestMode ? (
                <Form.Control.Feedback type="invalid">
                  {errors.emailTestMode.message}
                </Form.Control.Feedback>
              ) : null}
            </Form.Group>

            <Form.Group className="mb-3" controlId="emailCCMode">
              <Form.Check
                type="switch"
                className="mb-2"
                label={"Email CC Mode"}
                {...formRegister("emailCCMode")}
              />
              <Form.Text className="text-muted">
                In Email CC mode, all emails will also be CCed to website admin email
              </Form.Text>
              {errors.emailCCMode ? (
                <Form.Control.Feedback type="invalid">
                  {errors.ccMode.emailCCMode}
                </Form.Control.Feedback>
              ) : null}
            </Form.Group>
          </Col>

          <Col xs={6}>
            <Form.Group className="mb-3" controlId="websiteAdminEmail">
              <Form.Label>Admin Email</Form.Label>
              <Form.Control
                type="text"
                isInvalid={!!errors.websiteAdminEmail}
                {...formRegister("websiteAdminEmail")}
              />
              {errors.websiteAdminEmail && (
                <Form.Control.Feedback type="invalid">
                  {errors.websiteAdminEmail.message}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted">
                This email will be used when email test mode is active and used as sender <code>from</code> in website auto-generated emails.
              </Form.Text>
              {errors.websiteAdminEmail ? (
                <Form.Control.Feedback type="invalid">
                  {errors.websiteAdminEmail.message}
                </Form.Control.Feedback>
              ) : null}
            </Form.Group>
          </Col>

          <Col xs={{ span: 6, offset: 6 }}>
            <Form.Group className="mb-3" controlId="websiteAdminPhoneNumber">
              <Form.Label>Website Address</Form.Label>
              <Form.Control
                type="text"
                isInvalid={!!errors.websiteAddress}
                {...formRegister("websiteAddress")}
              />
              <Form.Text className="text-muted">
                This address is used in emails and QuickBooks to get a token.
              </Form.Text>
              {errors.websiteAddress && (
                <Form.Control.Feedback type="invalid">
                  {errors.websiteAddress.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Accordion defaultActiveKey="10" className="mb-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>GeoCodio ApiKey</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3" controlId="geocodioApiKey">
                <Form.Label>GeoCodio ApiKey</Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.geocodioApiKey}
                  {...formRegister("geocodioApiKey")}
                />
                {errors.geocodioApiKey && (
                  <Form.Control.Feedback type="invalid">
                    {errors.geocodioApiKey.message}
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  ApiKey for <a href="https://www.geocod.io/">geocod.io</a> used
                  in address autocomplete.
                </Form.Text>
                {errors.geocodioApiKey ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.geocodioApiKey.message}
                  </Form.Control.Feedback>
                ) : null}
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1">
            <Accordion.Header>Mailjet ApiKey/ApiSecret</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3" controlId="mailjetApiKey">
                <Form.Label>Mailjet ApiKey</Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.mailjetApiKey}
                  {...formRegister("mailjetApiKey")}
                />
                {errors.mailjetApiKey && (
                  <Form.Control.Feedback type="invalid">
                    {errors.mailjetApiKey.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="mailjetApiSecret">
                <Form.Label>Mailjet ApiSecret</Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.mailjetApiSecret}
                  {...formRegister("mailjetApiSecret")}
                />
                {errors.mailjetApiSecret && (
                  <Form.Control.Feedback type="invalid">
                    {errors.mailjetApiSecret.message}
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  API Key and Secret for{" "}
                  <a href="https://www.mailjet.com/">Mailjet.com</a> are used to send emails.
                </Form.Text>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="6">
            <Accordion.Header>GoogleMaps ApiKey</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3" controlId="googleMapsAutoComplete">
                <Form.Label>GoogleMaps ApiKey</Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.googleMapsAutoComplete}
                  {...formRegister("googleMapsAutoComplete")}
                />
                {errors.googleMapsAutoComplete && (
                  <Form.Control.Feedback type="invalid">
                    {errors.googleMapsAutoComplete.message}
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  ApiKey for GoogleMaps used in address autocomplete.
                </Form.Text>
                {errors.googleMapsAutoComplete ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.googleMapsAutoComplete.message}
                  </Form.Control.Feedback>
                ) : null}
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <LoadingSimpleButton className="btn-primary"  tooltip={!canSendEmails ? "send email may not work" : null} onClick={handleSubmit(handleEditGlobalConfig)}>
          Save Changes
        </LoadingSimpleButton>
      </Form>
    </div>
  );
};

export default Configuration;
