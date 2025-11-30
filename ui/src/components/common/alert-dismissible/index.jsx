import {useState, isValidElement, Fragment} from 'react';
import {Alert} from 'react-bootstrap';
import {useTimeout} from "usehooks-ts";
import _ from "lodash";
import ms from "ms";

export const AlertDismissible = ({
  message,
  header,
  variant,
  children,
  dismissible = true,
  onDismiss = _.noop,
  style = {},
  className = '',
  autoHide = null
}) => {
  const [show, setShow] = useState(true);
  const closeCallback = () => {
    setShow(false);
    onDismiss();
  };

  useTimeout(() => {
    closeCallback();
  }, autoHide ? ms(autoHide) : autoHide);

  if (show) {
    return (
      <Alert
        variant={variant}
        onClose={closeCallback}
        dismissible={dismissible}
        style={style}
        className={className}>
        {header ? <Alert.Heading> {header}</Alert.Heading> : null}
        {message ? <Fragment>
          {_.isArray(message) ? _.compact(message).map((item, index) => (<p key={index}>{item}</p>)) : isValidElement(message) ? <div>{message}</div> : <p>{message}</p>}
        </Fragment> : null}
        {children}
      </Alert>
    );
  }
  return null;
};