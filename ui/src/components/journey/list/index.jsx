import {Fragment, useEffect, useState} from "react";
import {deleteJourney, getJourneys} from "../../../api";
import {useNavigate} from "react-router-dom";
import {getCompiledPath, pages} from "../../../data";
import {Dropdown, DropdownButton, Spinner, Table} from "react-bootstrap";
import {formatDate} from "../../../utilities";
import {useConfirmModal} from "../../common";
import {DateTime} from "luxon";
import _ from "lodash";

export const ListJourneys = () => {
  const [journeys, setJourneys] = useState(null);
  const navigate = useNavigate();
  const { ConfirmationModal, confirmAction } = useConfirmModal();

  const refreshData = async () => {
    await getJourneys().then(({ data }) => {
      setJourneys(data);
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (!journeys) {
    return <Spinner />;
  }

  if (!journeys.length) {
    return <h3>No journey submitted yet</h3>;
  }

  return <Fragment>
    <div className='m-2'>
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
          {_.orderBy(journeys, x => DateTime.fromISO(x.date), 'desc').map(journey => (
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
                <DropdownButton id={`dropdown-${journey.id}`} title="Actions" size="sm">
                  <Dropdown.Item onClick={() => navigate(getCompiledPath(pages.journey.byId.view, {journeyId: journey.id}))}>
                    View
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate(getCompiledPath(pages.journey.byId.edit, {journeyId: journey.id}))}>
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    className="text-danger"
                    onClick={async () => {
                      if (await confirmAction('Are you sure you want to delete this journey?')) {
                        await deleteJourney(journey.id);
                        await refreshData();
                      }
                    }}>
                    Delete
                  </Dropdown.Item>
                </DropdownButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
    <ConfirmationModal />
  </Fragment>;
};
