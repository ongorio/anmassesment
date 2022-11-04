# ANM Assessment

## Objective
Create a  web page that took a place/city as input and return in a Google Maps markers of the nearest earquakes reports. The web pages keeps a search history of previous places. Also has a list of the top 10 strongest earthquakes around the world that can also place markers on the map.

## Technologies
* External
    1. Google Maps JS API
    2. Google Maps Geocoding API
    3. Geonames Earthquakes API
* Web Page
    1. HTML
    2. CSS
    3. JS

## Usage
Simply open index.html with main.css and index.js on the same folder and enjoy.

## Issues
In the deployment the https server still gives mixed content error because geonames sents HTTP requests. <br>
**Current Workaround** In the browser, in the site settings allow insecure content 