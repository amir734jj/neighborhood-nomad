import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {AddJourney} from "../components/journey/add";
import {SearchJourney} from "../components/journey/search/index.jsx";

const Board = () => {
  return (
    <section className="h-100">
      <Container className="h-100 mb-4">
        <Row className="justify-content-sm-center align-items-start h-100">
          <SearchJourney />

          <Col xxl={8} xl={9} lg={10} md={11} sm={12} className="mt-4">
            <h2>Share your one-day local adventure with people</h2>
            <p>Once you submit the journey, you will receive an email that needs to be confirmed before journey is made public</p>
            <AddJourney />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Board;
