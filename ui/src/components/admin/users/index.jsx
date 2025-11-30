import React, {useEffect, useState} from "react";
import {deleteUser, enableOrDisableUser, getUsers} from "../../../api";
import {Badge, Dropdown, DropdownButton, Table} from "react-bootstrap";
import classNames from "classnames";
import _ from "lodash";
import {formatDate} from "../../../utilities";

export const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const refresh = async () => {
    const { data } = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  return <Table striped bordered hover>
    <thead>
      <tr>
        <th>Username</th>
        <th>Linked Employee</th>
        <th>Role</th>
        <th>Created Date</th>
        <th>Last Active</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      { _.orderBy(users, [x => x => x.userName, x => !x.enabled, ]).map((user) => (
        <tr key={user.id} className={classNames({'table-danger': !user.enabled})}>
          <td>{user.userName}</td>
          <td>{user.employee?.firstname} {user.employee?.lastname}</td>
          <td>
            {user.roles?.join(',')}
          </td>
          <td>{formatDate(user.createdAt)}</td>
          <td>{formatDate(user.lastLoginDate)}</td>
          <td>
            <DropdownButton
              id="dropdown-basic-button"
              title="Action"
              size="sm"
              variant='primary'>
              <Dropdown.Item onClick={async () => {
                await enableOrDisableUser(user.id, !user.enabled);
                await refresh();
              }}>
                {user.enabled ? "Disable" : "Enable"}
              </Dropdown.Item>
              { !user.enabled ? <Dropdown.Item onClick={async () => {
                await deleteUser(user.id);
                await refresh();
              }}>
                Delete
              </Dropdown.Item> : null }
            </DropdownButton>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>;
};