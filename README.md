# neighborhood-nomad

A platform to share your 1-day adventures.

[Website](https://nomad.hesamian.com/)

## Container health

The runtime image checks HTTP on `127.0.0.1:80/` every 30 seconds, using the
port configured by `ASPNETCORE_URLS`. The probe has a 5-second timeout, a
20-second startup grace period, and three retries. If the listening port is
changed, update the health-check URL too.
