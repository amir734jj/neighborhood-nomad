import React, {useEffect, useState} from "react";
import {Accordion, Card, Col, Row, useAccordionButton} from "react-bootstrap";
import {SimpleButton} from "../simple-button";
import {GoogleIcon} from "../google-icon";
import _ from "lodash";

const CustomAccordionToggle = ({ eventKey, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);

  const decoratedOnClick = useAccordionButton(eventKey, () => {
    setOpen(!open);
  });

  useEffect(() => {
    if (defaultOpen && !open) {
      decoratedOnClick();
    } else if (!defaultOpen && open) {
      decoratedOnClick();
    }
  }, [defaultOpen]);

  return (
    <SimpleButton
      type="button"
      variant={"light"}
      onClick={() => {
        decoratedOnClick();
      }}
      style={{backgroundColor: "transparent"}}
      className='m-0 p-0'
    >
      { open ?
        <GoogleIcon icon='keyboard_arrow_up' /> :
        <GoogleIcon icon='keyboard_arrow_down' /> }
    </SimpleButton>
  );
};

export const CustomAccordionItem = ({ className = '', header, body, eventKey = _.uniqueId("accordion"), open = false }) => (
  <Card>
    <Card.Header>
      <Row>
        <Col xs={11}>
          {header}
        </Col>
        <Col xs={1} className='d-flex align-items-center justify-content-center'>
          <CustomAccordionToggle eventKey={eventKey.toString()} defaultOpen={open} />
        </Col>
      </Row>
    </Card.Header>
    <Accordion.Collapse eventKey={eventKey.toString()}>
      <Card.Body className={className}>{body}</Card.Body>
    </Accordion.Collapse>
  </Card>
);
