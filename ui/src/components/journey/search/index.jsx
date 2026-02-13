import React, {Fragment, useCallback, useEffect, useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {queryJourney} from "../../../api";
import _ from "lodash";
import {MapMultiple} from "../../common";
import {useWindowSize} from "usehooks-ts";
import {useGeolocation} from "../../../utilities";
import {getCompiledPath, pages} from "../../../data";
import {Link} from "react-router-dom";

const milwaukeeCoordinates = {
  longitude: -87.91,
  latitude: 43.04
};

export const SearchJourney = () => {
  const {height} = useWindowSize();
  const geolocation = useGeolocation();
  const latitude = geolocation.latitude ?? milwaukeeCoordinates.latitude;
  const longitude = geolocation.longitude ?? milwaukeeCoordinates.longitude;
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
          defaultCenter={{ lat: latitude, lng: longitude }}
          userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : null}
          locationData={_.flatten(journeys.map(j => j.stops.map(s => ({
            marker: s.address.name,
            infoWindowContent: <Fragment>
              <p>{s.description}</p>
              <Link to={getCompiledPath(pages.journey.byId.view, { journeyId: j.id })}>
                {j.description}
              </Link>
            </Fragment>,
            position: {
              lat: Number(s.address.latitude),
              lng: Number(s.address.longitude),
            }
          }))))} />
      </Col>
      <Col xs={12} md={4}>
        <Row>
          <Col xs={12}>
            <Form.Label column="md" className="mb-2 text-muted">Keywords</Form.Label>
            <Form.Control
              type="text"
              onChange={e => {
                searchJourneys(e.target.value);
              }}
            />
          </Col>
          <Col xs={12}>
            { journeys.length ? <ul className='mt-2'>
              { journeys.map(journey => (
                <li key={journey.id}>
                  <Link to={getCompiledPath(pages.journey.byId.view,  { journeyId: journey.id })}>
                    {journey.description}
                  </Link>
                </li>
              ))}
            </ul> : null }
          </Col>
        </Row>
      </Col>
    </Row>
  </Fragment>;
};
