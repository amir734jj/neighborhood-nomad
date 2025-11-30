import './style.scss';

export const Footer = () => (
  <footer
    className="text-muted border-top justify-content-center footer"
    style={{
      bottom: 0,
      position: "fixed",
      padding: "10px 0",
      zIndex: 1000, // ensures it stays on top of other elements
    }}
  >
    &copy; Neighborhood Nomad
  </footer>
);
