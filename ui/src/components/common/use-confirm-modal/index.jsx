import React, {isValidElement, useState} from "react";
import {Modal, Button, Row, Col} from "react-bootstrap";
import _ from "lodash";
import classNames from "classnames";

export const useConfirmModal = () => {
  const [showData, setShowData] = useState(null);
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirmAction = (message = null) => {
    return new Promise((resolve) => {
      setShowData({
        message: message
      });
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) resolvePromise(true);
    setShowData(null);
  };

  const handleClose = () => {
    if (resolvePromise) resolvePromise(false);
    setShowData(null);
  };

  const ConfirmationModal = ({messageClassName = null}) => (
    <Modal show={!!showData} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Action</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="justify-content-around align-items-center">
          <Col md={10} className="">
            { !showData?.message ? <p>Are you sure you want to proceed?</p> : _.isArray(showData.message) ?
              _.compact(showData.message).map((item, index) => (<p key={index} className={classNames('mt-1', messageClassName)}>{item}</p>)) :
              isValidElement(showData.message) ?
                <div className={classNames('mt-1', messageClassName)}>{showData.message}</div> :
                <p className={classNames('mt-1', messageClassName)}>{showData.message}</p> }
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return { confirmAction, ConfirmationModal };
};
