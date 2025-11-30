import React, {Fragment, useState} from "react";
import {Form} from "react-bootstrap";
import {queryJourney} from "../../../api/index.js";
import _ from "lodash";
import {MapMultiple} from "../../common/index.js";

export const SearchJourney = () => {
  const [keywords, setKeywords] = useState(null);
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

  return <Fragment>
    <Form.Label column="md" className="mb-2 text-muted">Keywords</Form.Label>
    <Form.Control
      type="text"
      onChange={e => {
        setKeywords(e.target.value);
        queryJourney(filterToKeywords(e.target.value)).then(({ data }) => {
          setJourneys(data);
        });
      }}
    />
    <MapMultiple />
  </Fragment>;
};