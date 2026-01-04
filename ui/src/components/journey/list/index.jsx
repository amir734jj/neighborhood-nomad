import {useEffect, useState} from "react";
import {getJourneys} from "../../../api";
import {Link} from "react-router-dom";
import {getCompiledPath, pages} from "../../../data";
import {Button, Spinner, Table} from "react-bootstrap";
import {formatDate} from "../../../utilities";
import {LinkContainer} from "react-router-bootstrap";

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
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>
            Description
          </th>
          <th>
            User
          </th>
          <th>
            Date
          </th>
          <th>
            Submission Date
          </th>
          <th>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {journeys.map(journey => (
          <tr key={journey.id}>
            <td>
              {journey.description}
            </td>
            <td>
              {journey.email}
            </td>
            <td>
              {formatDate(journey.date)}
            </td>
            <td>
              {formatDate(journey.submissionDate)}
            </td>
            <td>
              <LinkContainer to={getCompiledPath(pages.journey.byId.view, {journeyId: journey.id})}>
                <Button>
                  View
                </Button>
              </LinkContainer>
              <LinkContainer to={getCompiledPath(pages.journey.byId.edit, {journeyId: journey.id})}>
                <Button className='ms-1'>
                  Edit
                </Button>
              </LinkContainer>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>;
};
