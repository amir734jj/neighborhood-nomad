import {GoogleIcon} from "../google-icon";

/*
    Complete List of WMO Weather Codes

    Code   Description
    ----------------------------
    0      Clear sky
    1      Mainly clear
    2      Partly cloudy
    3      Overcast
    45     Fog
    48     Depositing rime fog
    51     Drizzle: Light
    53     Drizzle: Moderate
    55     Drizzle: Dense
    56     Freezing drizzle: Light
    57     Freezing drizzle: Dense
    61     Rain: Slight
    63     Rain: Moderate
    65     Rain: Heavy
    66     Freezing rain: Light
    67     Freezing rain: Heavy
    71     Snowfall: Slight
    73     Snowfall: Moderate
    75     Snowfall: Heavy
    77     Snow grains
    80     Rain showers: Slight
    81     Rain showers: Moderate
    82     Rain showers: Violent
    85     Snow showers: Slight
    86     Snow showers: Heavy
    95     Thunderstorm: Slight or moderate
    96     Thunderstorm with slight hail
    99     Thunderstorm with heavy hail
*/
const weatherCodeToIcon = {
  0: "wb_sunny",
  1: "cloud",
  2: "cloud",
  3: "cloud",
  45: "foggy",
  48: "foggy",
  51: "rainy",
  53: "rainy",
  55: "rainy",
  61: "rainy",
  63: "rainy",
  65: "rainy",
  71: "ac_unit",
  73: "ac_unit",
  75: "ac_unit",
  80: "rainy",
  81: "rainy",
  82: "rainy",
  95: "thunderstorm",
  96: "thunderstorm",
  99: "thunderstorm"
};

export const WeatherIcon = ({ code, className }) => {
  const getWeatherIcon = weatherCode => {
    return weatherCodeToIcon[weatherCode] || "help";
  };

  return <GoogleIcon icon={getWeatherIcon(code)} className={className} />;
};