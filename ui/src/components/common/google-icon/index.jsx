import React, {useEffect, useState} from "react";
import classNames from "classnames";

export const GoogleIcon = ({className, style = { fontSize: "36px" }, icon, lineHeight = '1', ...props}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  return (
    <span
      className={classNames('material-symbols-outlined', className)}
      style={{
        opacity: fontsLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease',
        lineHeight,
        ...style
      }}
      {...props}
    >
      {icon}
    </span>
  );
};
