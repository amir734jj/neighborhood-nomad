import React from 'react';
import { Modal, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { getCompiledPath, pages } from '../../../data';

export const UserJourneysModal = ({ show, onHide, journeys, email }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Journeys by {email}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {journeys && journeys.length > 0 ? (
          <ListGroup>
            {journeys.map((journey) => (
              <ListGroup.Item
                key={journey.id}
                as={Link}
                to={getCompiledPath(pages.journey.byId.view, { journeyId: journey.id })}
                onClick={onHide}
                className="d-flex justify-content-between align-items-start"
                action
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{journey.singleLineDescription || journey.description}</div>
                  {journey.moreDescription && (
                    <small className="text-muted">{journey.moreDescription}</small>
                  )}
                  <div className="mt-1">
                    <small className="text-muted">
                      {DateTime.fromISO(journey.date).toLocaleString(DateTime.DATE_MED)}
                    </small>
                  </div>
                </div>
                <Badge bg="primary" pill>
                  {journey.stops?.length || 0} stops
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-center text-muted">No journeys found for this user.</p>
        )}
      </Modal.Body>
    </Modal>
  );
};
