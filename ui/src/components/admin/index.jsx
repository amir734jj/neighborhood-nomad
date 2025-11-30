import React from "react";
import {Container, Tabs, Tab, Row} from "react-bootstrap";
import {GoogleIcon} from "../common";
import {UserManagement} from "./users";

export const Admin = () => {
  return (
    <section className="h-100">
      <Container className="mt-4">
        <Tabs variant='underline' justify={true} defaultActiveKey="manageCompany" id="admin-tabs" className="mb-3">
          <Tab eventKey="manageUser" title={<span><GoogleIcon icon="settings_account_box"/><br/>User Management</span>}>
            <Row className="pe-1 mx-auto">
              <UserManagement />
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </section>
  );
};