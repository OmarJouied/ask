import { useEffect, useState } from 'react';
import Feature from 'ol/Feature.js';
import Geolocation from 'ol/Geolocation.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import { Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';

import styles from "@/styles/Map.module.css";
import { LineString } from 'ol/geom';
import proj4 from 'proj4';
import { arrowSelect } from '@/images';

const GotoMap = ({ isGPSActive, setIsGPSActive, target }) => {

  const [GPSFeature] = useState(new Feature());

  const [vectSource] = useState(new VectorSource({ features: [GPSFeature] }));

  const [vectLayer] = useState(new VectorLayer({ source: vectSource }));

  const [view] = useState(new View({ center: [0, 0], zoom: 2, projection: "EPSG:3857" }));

  const [geolocation] = useState(new Geolocation({ trackingOptions: { enableHighAccuracy: true }, projection: view.getProjection() }));

  const [movingInfo, setMovingInfo] = useState(null);

  useEffect(() => {
    if (isGPSActive) {

      const position = geolocation.getPosition();

      const start = proj4('EPSG:3857', 'EPSG:4326').forward(position);
      const end = proj4('EPSG:3857', 'EPSG:4326').forward(target);

      fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.NEXT_PUBLIC_CARTONOVAROUTESTOKEN}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`)
      .then(r => r.json()).then(r => {
        setMovingInfo({
          ...r.features[0].properties.summary
        })
        const route = new LineString(r.features[0].geometry.coordinates);
        route.transform('EPSG:4326', 'EPSG:3857');

        const routeFeature = new Feature(route);
        routeFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "#03f703",
              width: 4,
            })
          })
        )
        
        vectSource.addFeature(routeFeature);
      });

      const startPosition = new Feature({ geometry: new Point(position) });
      startPosition.setStyle(
        new Style({
          fill: new Fill({
            color: '#0084ff',
          }),
          stroke: new Stroke({
            color: '#ff00ff',
            width: 4,
          }),
        })
      )

      const lineFeature = new Feature({ geometry: new LineString([target, position]) });
      lineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: '#0084ff',
            width: 2,
          }),
        })
      );

      vectSource.addFeature(startPosition);
      vectSource.addFeature(new Feature({ geometry: new Point(target) }));

      console.log(position, target);
    }
  }, [target]);

  useEffect(() => {
    geolocation.setTracking(isGPSActive);
  }, [isGPSActive]);

  useEffect(() => {

    const map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'map',
      view,
    });

    map.addLayer(vectLayer);
    
    // // update the HTML page when the position changes.
    geolocation.on('change', function () {
      // el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
      // el('altitude').innerText = geolocation.getAltitude() + ' [m]';
      // el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
      // el('heading').innerText = geolocation.getHeading() + ' [rad]';
      // el('speed').innerText = geolocation.getSpeed() + ' [m/s]';

      console.log(geolocation.getAccuracy() + ' [m]');
      console.log(geolocation.getAltitude() + ' [m]');
      console.log(geolocation.getAltitudeAccuracy() + ' [m]');
      console.log(geolocation.getHeading() + ' [rad]');
      console.log(geolocation.getSpeed() + ' [m/s]');
      
    });
    
    // // handle geolocation error.
    geolocation.on('error', function (error) {
      const errorPopup = document.querySelector("#map span");
      errorPopup.innerHTML = error.message;
      errorPopup.onclick = () => {
        errorPopup.innerHTML = '';
      }
      setIsGPSActive(false);
    });
    
    geolocation.on('change:position', function () {
      const coordinates = geolocation.getPosition();
      GPSFeature.setGeometry(coordinates ? new Point(coordinates) : null);
      view.setCenter(coordinates);
      view.setZoom(9);

      if (target.length)
        fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.NEXT_PUBLIC_CARTONOVAROUTESTOKEN}&start=${coordinates[0]},${coordinates[1]}&end=${target[0]},${target[1]}`)
        .then(r => r.json()).then(r => {
          console.log(r.features[0].properties.summary);
        });
    });

  }, []);

  return (
    <>
      <div id="map"  className={`${styles.mapContainer} ol-zoom`}><span></span></div>
      <div className="moving-info">
        <button disabled={!movingInfo}>
          <img src={arrowSelect.src} alt="arrow" />
        </button>
        {
          movingInfo && (
            <div className="moving-info__details">
              <MovingInfoDetails><span>distance:</span><span>{' ' + (+movingInfo?.distance / 1000).toFixed(2) + " km"}</span></MovingInfoDetails>
              <MovingInfoDetails><span>duration:</span><span>{' ' + (+movingInfo?.duration / 3600).toFixed(2) + " h"}</span></MovingInfoDetails>
            </div>
          )
        }
        
      </div>
    </>
  )
};

export default GotoMap;

const MovingInfoDetails = ({ children }) => (
  <div className="duration" onClick={() => console.log("children.toString()")}>
    {children}
  </div>
)