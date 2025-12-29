import {useEffect, useState} from "react";
import {getJourneys} from "../../../api";
import {Link} from "react-router-dom";
import {getCompiledPath, pages} from "../../../data";
import {Spinner} from "react-bootstrap";
import {formatDate} from "../../../utilities";

export const ListJourneys = () => {
  const [journeys, setJourneys] = useState(null);

  useEffect(() => {
    getJourneys().then(({ data }) => {
      setJourneys(data);
    });
  }, []);

  if (!journeys) {
    return <Spinner />;
  }

  if (!journeys.length) {
    return <h3>No journey submitted yet</h3>;
  }

  return <div className='m-2'>
    <h3>List of Journeys</h3>
    <ul>
      {journeys.map(journey => (
        <li key={journey.id}>
          <Link to={getCompiledPath(pages.journey.byId.view, {journeyId: journey.id})}>
            {journey.description} @ {formatDate(journey.date)} by {journey.email}
          </Link>
        </li>
      ))}
    </ul>
  </div>;
};