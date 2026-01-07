import { WeatherIcon } from '../common/weather-icon';

export const WeatherInfo = ({ weatherCode, description, temperature }) => (
  <div className="d-flex align-items-center gap-2 small mb-2">
    <WeatherIcon code={weatherCode} />
    <span>{temperature ? `${Math.round(temperature)}°F` : ''}</span>
    <span className="text-muted">{description}</span>
  </div>
);
