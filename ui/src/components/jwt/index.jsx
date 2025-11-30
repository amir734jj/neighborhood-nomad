import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { DateTime } from "luxon";
import { useAuthStore } from "../../state";
import { accountInfo, refreshToken } from "../../api";
import { useInterval } from "usehooks-ts";

const jwtTokenExpiration = (token) => {
  const expiredAt = new Date(0);

  // If token is falsy then its expired
  if (token) {
    try {
      const { exp } = jwtDecode(token);
      expiredAt.setUTCSeconds(exp);
    } finally {
      // empty
    }
  }

  return expiredAt;
};

const isJwtTokenExpired = (token) => {
  const expiredAt = jwtTokenExpiration(token);
  return !(DateTime.fromJSDate(expiredAt).diffNow().milliseconds > 0);
};

export const JWT = () => {
  const authContext = useAuthStore();
  const [refreshTokenDelay, setRefreshTokenDelay] = useState(null);

  useInterval(
    () => {
      handleRefreshToken();
    },
    refreshTokenDelay,
  );

  const handleRefreshToken = async () => {
    try {
      const { data: token } = await refreshToken();
      authContext.setToken(token);
      const { data: user } = await accountInfo();
      authContext.setUser(user);
    } catch (_) {
      authContext.logout();
      setRefreshTokenDelay(null); // clear refresh interval
    }
  };

  // Recover account only once based on information from token stored in local storage
  useEffect(() => {
    const callback = async () => {
      if (authContext.token) {
        if (isJwtTokenExpired(authContext.token)) {
          authContext.logout();
          setRefreshTokenDelay(null); // clear refresh interval
        } else {
          await handleRefreshToken();
        }
      }

      authContext.setInitialized();
    };

    callback();
  }, []);

  useEffect(() => {
    if (authContext.auth && !refreshTokenDelay) {
      const renewAt = 10 * 60000; // Renew in 10 minutes
      const expiredAt = jwtTokenExpiration(authContext.token);

      if (isJwtTokenExpired(authContext.token)) {
        setRefreshTokenDelay(null); // clear refresh interval
      } else {
        if (DateTime.fromJSDate(expiredAt).diffNow().milliseconds <= renewAt) {
          handleRefreshToken();
        }

        setRefreshTokenDelay(renewAt);
      }
    }
  }, [authContext.auth, authContext.token]);

  return <div style={{ display: "none" }}>{authContext.token}</div>;
};
