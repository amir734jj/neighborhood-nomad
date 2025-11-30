import { Container } from "react-bootstrap";

const Error404 = () =>
  <Container fluid>
    <div style={{
      maxWidth: "fit-content",
      margin: "auto"
    }}>
      <p>Page Not Found</p>
      <img src="https://http.cat/images/404.jpg" className="img-fluid" alt="404" />
    </div>
  </Container>;

export default Error404;