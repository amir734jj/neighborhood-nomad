import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {getJourneyById, queryWeather, queryJourneyByEmail} from "../../../api";
import {pages} from "../../../data";
import {Badge, Card, Col, Container, Row, Spinner} from "react-bootstrap";
import {MapMultiple, FetchImage, Avatar} from "../../common";
import {useWindowSize} from "usehooks-ts";
import {calculateGeographicCenter} from "../../../utilities";
import {WeatherInfo} from "../../weather";
import {DateTime} from "luxon";
import {UserJourneysModal} from "../user-journeys";

export const ViewJourney = () => {
  const {journeyId} = useParams();
  const {height} = useWindowSize();
  const [journey, setJourney] = useState(null);
  const [fetchFailed, setFetchFailed] = useState(null);
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [showUserJourneysModal, setShowUserJourneysModal] = useState(false);
  const [userJourneys, setUserJourneys] = useState([]);
  const [loadingUserJourneys, setLoadingUserJourneys] = useState(false);

  const fetchData = async (journeyId) => {
    try {
      const { data: journey } = await getJourneyById(journeyId);
      setJourney(journey);

      const center = calculateGeographicCenter(journey.stops.map(stop => ({
        position: {
          lat: stop.address.latitude,
          lng: stop.address.longitude,
        }
      })));
      
      // Wrap weather query in try-catch so failures don't break the page
      try {
        const { data: weather } = await queryWeather(center.lat, center.lng, journey.date);
        setWeather(weather);
      } catch (weatherErr) {
        // Log the error but don't throw - journey should still display
        console.error('Failed to fetch weather data:', weatherErr);
        // setWeather remains null, so weather won't be displayed
      }

    } catch (err) {
      // Only set fetchFailed if journey data fails to load
      setFetchFailed(err);
    }
  };

  useEffect(() => {
    fetchData(journeyId);
  }, [journeyId]);

  const handleAvatarClick = async (email) => {
    setLoadingUserJourneys(true);
    setShowUserJourneysModal(true);
    try {
      const { data } = await queryJourneyByEmail(email);
      setUserJourneys(data);
    } catch (error) {
      console.error('Failed to fetch user journeys:', error);
      setUserJourneys([]);
    } finally {
      setLoadingUserJourneys(false);
    }
  };

  const handleCloseModal = () => {
    setShowUserJourneysModal(false);
    setUserJourneys([]);
  };

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
      lat: Number(stop.address.latitude),
      lng: Number(stop.address.longitude),
    }
  })) || [];

  const firstLine = journey.singleLineDescription;
  const restLines = journey.moreDescription;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center gap-3 mb-3">
            <Avatar
              text={journey.email}
              size={50} 
              onClick={handleAvatarClick}
            />
            <div>
              <small className="text-muted d-block">Shared by</small>
              <span className="fw-medium">{journey.email}</span>
            </div>
          </div>
          <h3>{firstLine}</h3>
          { restLines ? <p>{restLines}</p> : null }
          <div className="d-flex align-items-center gap-3 mt-2">
            <small className="text-muted">
              {DateTime.fromISO(journey.date).toLocaleString(DateTime.DATE_HUGE)}
            </small>
            { weather ? <WeatherInfo {...weather} /> : null }
          </div>
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

      <UserJourneysModal
        show={showUserJourneysModal}
        onHide={handleCloseModal}
        journeys={loadingUserJourneys ? [] : userJourneys}
        email={journey.email}
      />
    </Container>
  );
};
