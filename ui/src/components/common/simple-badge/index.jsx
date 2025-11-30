import {Badge} from "react-bootstrap";

export const SimpleBadge = ({ tooltip, spanProps = {}, children, ...props}) => {
  if (tooltip) {
    spanProps = {
      ...spanProps,
      'data-bs-toggle': "tooltip",
      'data-bs-placement': "bottom",
      title: tooltip,
    };
  }

  return  <Badge {...props} {...spanProps}>
    {children}
  </Badge>;
};
