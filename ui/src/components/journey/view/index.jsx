import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { getJourneyById} from "../../../api";
import {pages} from "../../../data";
import {Badge, Card, Col, Container, Row, Spinner} from "react-bootstrap";
import {MapMultiple, FetchImage} from "../../common";
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

  const firstLine = journey.singleLineDescription;
  const restLines = journey.moreDescription;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h3>{firstLine}</h3>
          { restLines ? <p>{restLines}</p> : null }
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <MapMultiple
            style={{ height: height * 0.6, minHeight: '400px' }}
            locationData={locationData}
          />
        </Col>
      </Row>

      {(journey.photos || []).length ? (
        <Row className="mb-4">
          <Col>
            <h4 className="mb-3">Photos</h4>
            <Row>
              {journey.photos.map((photoKey, index) => (
                <Col xs={12} sm={6} md={4} lg={3} key={index} className="mb-3">
                  <FetchImage
                    fileKey={photoKey}
                    alt={`Journey photo ${index + 1}`}
                    style={{ width: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      ) : null}

      <Row>
        <Col>
          <h4 className="mb-3">Stops</h4>
          {(journey.stops || []).map((stop, index) => (
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
