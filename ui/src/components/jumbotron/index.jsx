import {Col, Container, Row} from "react-bootstrap";
import {useGlobalConfig} from "../../state";
import {formatDateTime} from "../../utilities";

export const Jumbotron = () => {
  const { publicGlobalConfig } = useGlobalConfig();

  return <Container className="p-5 mb-4 rounded-3">
    <Container fluid="md" className="py-5">
      <Row>
        <Col sm={12} md={8}>
          <h5 className="display-5 fw-bold">
            Neighborhood Nomad
          </h5>
          <p>
            The goal of this website is to share simple 1-day adventures with people. Not every trip needs a full itinerary — these days, everyone is busy and often just looking for something quick and fun. This website gives you easy ideas and inspiration for short, memorable experiences.
          </p>
          <p className="fs-4">
            Powered by Cross Culture Innovations LLC
          </p>
          <p className="fs-5">
            Version 1.0, © 2025
          </p>
          <p className="fs-5">
            BuildDate: {formatDateTime(publicGlobalConfig.buildDate)}
          </p>
        </Col>
      </Row>
    </Container>
  </Container>;
};
