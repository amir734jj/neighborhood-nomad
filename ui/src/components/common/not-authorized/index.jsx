import {useLocation} from "react-router-dom";
import {Container} from "react-bootstrap";
import {AlertDismissible} from "../alert-dismissible";
import {Fragment} from "react";

export const NotAuthorize = () => {
  const location = useLocation();

  return <Container className='mt-3'>
    <AlertDismissible
      variant='danger' dismissible={false}
      header={<Fragment>
        Unauthorized Attempt to Access <code>{location.pathname}</code>
      </Fragment>}
      message={<p>
        Please contact website administrator for gain access.
      </p>}
    />
  </Container>;
};
