# neighborhood-nomad

A platform to share your 1-day adventures.

[Website](https://nomad.hesamian.com/)

## Container health

The runtime image checks HTTP on `127.0.0.1:${PORT:-5000}/` every 30 seconds,
following the application's `PORT` setting (5000 by default; 3000 in Coolify).
The probe has a 5-second timeout, a 20-second startup grace period, and three
retries.
