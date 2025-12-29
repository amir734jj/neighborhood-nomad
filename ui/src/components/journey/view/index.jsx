import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { getJourneyById} from "../../../api";
import {getCompiledPath, pages} from "../../../data";
import {Badge, Card, Col, Container, Row, Spinner} from "react-bootstrap";
import {MapMultiple} from "../../common";
import {useWindowSize} from "usehooks-ts";

export const ViewJourney = () => {
  const {journeyId} = useParams();
  const {height} = useWindowSize();
  const [journey, setJourney] = useState(null);
  const [fetchFailed, setFetchFailed] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getJourneyById(journeyId).then(({ data }) => {
      setJourney(data);
    }).catch((err) => {
      setFetchFailed(err);
    });
  }, [journeyId]);

  if (fetchFailed) {
    navigate(pages.root);
    return null;
  }

  if (!journey) {
    return <Spinner />;
  }

  const locationData = journey.stops?.map(stop => ({
    marker: stop.address.name,
    infoWindowContent: <div>
      <h6>{stop.address.name}</h6>
      <p>{stop.description}</p>
    </div>,
    position: {
      lat: stop.address.latitude,
      lng: stop.address.longitude,
    }
  })) || [];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>{journey.title}</h2>
          {journey.tags && journey.tags.length > 0 && (
            <div className="mb-3">
              {journey.tags.map((tag, index) => (
                <Badge key={index} bg="secondary" className="me-2">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {journey.description && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Text>{journey.description}</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <MapMultiple
            style={{ height: height * 0.6, minHeight: '400px' }}
            locationData={locationData}
            zoom={13}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <h4 className="mb-3">Stops</h4>
          {journey.stops?.map((stop, index) => (
            <Card key={stop.id} className="mb-3">
              <Card.Body>
                <Card.Title>
                  <Badge bg="primary" className="me-2">{index + 1}</Badge>
                  {stop.address.name}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {stop.address.addressLine1}
                  {stop.address.city && `, ${stop.address.city}`}
                  {stop.address.state && `, ${stop.address.state}`}
                  {stop.address.postalCode && ` ${stop.address.postalCode}`}
                </Card.Subtitle>
                {stop.description && (
                  <Card.Text>{stop.description}</Card.Text>
                )}
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
};
