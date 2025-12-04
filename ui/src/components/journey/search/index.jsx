import React, {Fragment, useCallback, useEffect, useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {queryJourney} from "../../../api";
import _ from "lodash";
import {MapMultiple} from "../../common";
import {useWindowSize} from "usehooks-ts";

export const SearchJourney = () => {
  const {height} = useWindowSize();
  const [journeys, setJourneys] = useState([]);

  const filterToKeywords = filter => {
    return _.chain(filter)
      .toLower()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .map(_.trim)
      .filter(Boolean)
      .uniq()
      .value();
  };

  const searchJourneys = useCallback((input) => {
    queryJourney(filterToKeywords(input)).then(({ data }) => {
      setJourneys(data);
    });
  }, [filterToKeywords]);

  useEffect(() => {
    searchJourneys('');
  }, []);

  return <Fragment>
    <Row>
      <Col xs={12} md={8}>
        <MapMultiple
          style={{ height: height * 0.75 }}
          locationData={_.flatten(journeys.map(j => j.stops.map(s => ({
            marker: s.address.name,
            infoWindowContent: <p>{s.description}</p>,
            position: {
              lat: s.address.latitude,
              lng: s.address.longitude,
            }
          }))))} />
      </Col>
      <Col xs={12} md={4}>
        <Form.Label column="md" className="mb-2 text-muted">Keywords</Form.Label>
        <Form.Control
          type="text"
          onChange={e => {
            searchJourneys(e.target.value);
          }}
        />
      </Col>
    </Row>
  </Fragment>;
};