import {Col, Container, Row, Card} from "react-bootstrap";
import {useGlobalConfig} from "../../state";
import {formatDateTime} from "../../utilities";
import {GoogleIcon} from "../common";

export const Jumbotron = () => {
  const { publicGlobalConfig } = useGlobalConfig();

  return <Container className="p-5 mb-4 rounded-3">
    <Container fluid="md" className="py-5">
      <Row>
        <Col sm={12}>
          <h5 className="display-5 fw-bold">
            Neighborhood Nomad
          </h5>
          <p className="lead">
            The goal of this website is to share simple 1-day adventures with people. Not every trip needs a full itinerary — these days,
            everyone is busy and often just looking for something quick and fun. This website gives you easy ideas and inspiration for short, memorable experiences.
          </p>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col sm={12}>
          <h3 className="mb-4">Features</h3>
        </Col>
        
        <Col sm={12} md={6} lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="mb-3">
                <GoogleIcon icon="explore" className="text-primary" style={{ fontSize: '2rem' }} />
              </div>
              <Card.Title>Discover Local Adventures</Card.Title>
              <Card.Text>
                Browse through a curated collection of one-day journeys shared by the community. Search by location or keywords to find your next adventure.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} md={6} lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="mb-3">
                <GoogleIcon icon="share" className="text-primary" style={{ fontSize: '2rem' }} />
              </div>
              <Card.Title>Share Your Journey</Card.Title>
              <Card.Text>
                Submit your own one-day adventures with photos, descriptions, and multiple stops. Help others discover amazing experiences in your area.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} md={6} lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="mb-3">
                <GoogleIcon icon="map" className="text-primary" style={{ fontSize: '2rem' }} />
              </div>
              <Card.Title>Interactive Maps</Card.Title>
              <Card.Text>
                Visualize each journey with interactive maps showing all stops, complete with addresses and descriptions. Plan your route with ease.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} md={6} lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="mb-3">
                <GoogleIcon icon="account_circle" className="text-primary" style={{ fontSize: '2rem' }} />
              </div>
              <Card.Title>Unique User Avatars</Card.Title>
              <Card.Text>
                Each user gets a unique geometric avatar generated from their email. Click on any avatar to see all journeys shared by that user.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} md={6} lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="mb-3">
                <GoogleIcon icon="photo_library" className="text-primary" style={{ fontSize: '2rem' }} />
              </div>
              <Card.Title>Photo Galleries</Card.Title>
              <Card.Text>
                Enhance your journey submissions with photos. Show others what makes your adventure special through visual storytelling.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} md={6} lg={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="mb-3">
                <GoogleIcon icon="cloud" className="text-primary" style={{ fontSize: '2rem' }} />
              </div>
              <Card.Title>Weather Information</Card.Title>
              <Card.Text>
                View historical weather data for journey dates to help plan similar trips and understand seasonal conditions.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col sm={12}>
          <Card className="border-primary">
            <Card.Body className="p-4">
              <h4 className="mb-3">
                <GoogleIcon icon="edit" className="me-2" />
                Manage Your Journeys
              </h4>
              <p className="mb-2">
                <strong>Did you submit a journey without creating an account?</strong> No problem!
              </p>
              <p>
                Simply sign up or log in using the <strong>same email address</strong> you used when submitting your journey, 
                and you'll be able to edit and manage all your submissions. This gives you full control over your content while 
                keeping the submission process simple and easy for everyone.
              </p>
              <ul className="mt-3">
                <li>Edit journey descriptions and details</li>
                <li>Update photos and locations</li>
                <li>Delete journeys you no longer want to share</li>
                <li>View all your submissions in one place</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col sm={12} md={8}>
          <hr className="my-4" />
          <p className="fs-4">
            Powered by Cross Culture Innovations LLC
          </p>
          <p className="fs-5 text-muted">
            Version 1.0, © 2026
          </p>
          <p className="fs-6 text-muted">
            BuildDate: {formatDateTime(publicGlobalConfig.buildDate)}
          </p>
        </Col>
      </Row>
    </Container>
  </Container>;
};
