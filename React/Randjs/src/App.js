import "./App.css";
import Map, { Marker,Source, Layer,Popup } from "react-map-gl";
import axios from "axios";
import { Card, CardContent, Typography } from "@mui/material";
import "mapbox-gl/dist/mapbox-gl.css";
import wco from "./wco";
import { useState, useEffect,useMemo,useCallback} from "react";
import {
  WiDaySunny,
  WiRainMix,
  WiThunderstorm,
  WiSnow,
  WiFog
} from "weather-icons-react";

const mapboxToken = "pk.eyJ1IjoiYWlkYXNoLWl2bXMiLCJhIjoiY2xhNnIxb3V2MWIzeDN1cXExN2FzNm1nZiJ9.h9zhuZQFrH4Tycnjj-XC1w";

function App() {
  const [allData, setAllData] = useState(null);
  const [temp, setTemp] = useState();
  const [weatherData,setWeatherData]=useState();
  const [showPopup, setShowPopup] = useState(true);

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point', 
          coordinates: [-122.4, 37.8]
        }
      }
    ]
  };

  const getData=()=>{
    fetch('./in.json')
    .then((response) =>  response.json()) //{return response.json()}
    .then((data) => {
      for(let x of data){
        let coordinate = [parseFloat(x.lng), parseFloat(x.lat)];
        let properties = x;
        delete properties.longitude;
        delete properties.latitude;          
        let feature = {"type": "Feature", "geometry": {"type": "Point", "coordinates": coordinate}, "properties": properties}

        geojson.features.push(feature);
      }
    }, 
    setAllData(geojson))

    .catch(err => console.error('Could not load data', err)); 
  }
  useEffect(() => {
    getData();
  },[]);

const layerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 5,
    'circle-color': 'blue'
  }
};

  const openPopup=  async(index)=>{
   setShowPopup(index)
   const res = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${parseFloat(allData?.features[index].geometry.coordinates[1])}&longitude=${parseFloat(allData?.features[index].geometry.coordinates[0])}&current_weather=true`
  );
  const weatherCode = res.data.current_weather.weathercode;
    setWeatherData(wco[weatherCode]);
    console.log(weatherData);
    setTemp(res.data.current_weather.temperature);
  }

  const closePopup = () => {
    setShowPopup(null);
  };


  const WeatherCard = ({ latitude,longitude, temp, weather,city }) => {
    console.log(weather);
    return (
      <Card variant="outlined">
        <CardContent sx={{bg:'black'}}>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {weather[1] === "clear" ? (    
              <WiDaySunny size={50} color="#FAD02C" />
            ) : weather[1] === "rain" ? (
              <WiThunderstorm size={50} color="#808080" />
            ) : weather[1] === "snow" ? (
              <WiSnow size={50} color="#D8E2F0" />
            ) : weather[1] === "drizzle" ? (
              <WiRainMix size={50} color="#A7C2E5" />
            ) : weather[1] === "fog" ? (
              <WiFog size={50} color="#929EAF" />
            ) : null}
      
          </Typography>
          <Typography variant="h5" component="div">
            {latitude}
          </Typography>
          <Typography variant="h5" component="div">
            {longitude}
          </Typography>
          <Typography variant="h5" component="div">
            {city}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {temp}° C
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {weather && weather[0]}
          </Typography>
         
        </CardContent>
      </Card>
    );
  };



  const CustomPopup = ({ index, closePopup }) => {
    const marker = allData?.features[index];

    return (
      
      <Popup
        latitude="28.6"
        // {(marker?.geometry.coordinates[1])}
        // {parseFloat(marker?.geometry.coordinates[1])}
        longitude="77.6"
        onClose={closePopup}
        closeButton={true}
        closeOnClick={false}
        style={{ color: "blue" }}>
      
        { weatherData &&
        <WeatherCard latitude={parseFloat(marker?.geometry.coordinates[1])} longitude={parseFloat(marker?.geometry.coordinates[0])}temp={temp} weather={weatherData} city={marker.properties.city}/>
        }  
        </Popup>
      
    );
  };
  return (
    <div className="App">
      <Map
        initialViewState={{
          longitude: 77.23,
          latitude: 28.66,
          zoom: 14,
        }}

        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={['data']}
        >

      <Source id="my-data" type="geojson" data={allData}>
         {allData?.features.map((x,i) => (
          <div key={i}>
             <Marker longitude={x.geometry.coordinates[0]} latitude={x.geometry.coordinates[1]} color="blue" onClick={() => openPopup(i)}/>
             {showPopup && (
              <CustomPopup index={showPopup} closePopup={closePopup} /> 
             )}
         </div>
         ))}
        <Layer {...layerStyle} />
      </Source>
     
      </Map>
    </div>
  );

}

export default App;
