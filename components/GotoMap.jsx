import { useEffect, useState } from 'react';
import Feature from 'ol/Feature.js';
import Geolocation from 'ol/Geolocation.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import { Stroke, Style, Icon} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';

import styles from "@/styles/Map.module.css";
import { LineString } from 'ol/geom';
import proj4 from 'proj4';
import { arrowSelect } from '@/images';
import timeFormatter from '@/utils/timeFormatter.js';
import distanceFormatter from '@/utils/distanceFormatter';

const GotoMap = ({ isGPSActive, setIsGPSActive, target }) => {

  const [GPSFeature] = useState(new Feature());

  const [vectSource] = useState(new VectorSource({ features: [GPSFeature] }));

  const [vectLayer] = useState(new VectorLayer({ source: vectSource }));

  const [image, setImage] = useState(new Icon({ anchor: [.5, 24.5], anchorXUnits: 'fraction', anchorYUnits: 'pixels', src: 'geolocation_marker_heading.png' }));

  const [iconStyle, setIconStyle] = useState(new Style({ image }));

  const [view] = useState(new View({ center: [0, 0], zoom: 2, projection: "EPSG:3857" }));

  const [geolocation] = useState(new Geolocation({ trackingOptions: { enableHighAccuracy: true }, projection: view.getProjection() }));

  const [movingInfo, setMovingInfo] = useState(null);

  useEffect(() => {
    if (isGPSActive) {

      const position = geolocation.getPosition();

      if (!position) return;

      const start = proj4('EPSG:3857', 'EPSG:4326').forward(position);
      const end = proj4('EPSG:3857', 'EPSG:4326').forward(target);

      (async () => {
        // convert address to ccordinates await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${process.env.NEXT_PUBLIC_CARTONOVAROUTESTOKEN}&text=tanger&size=1`);
        const car = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.NEXT_PUBLIC_CARTONOVAROUTESTOKEN}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`);
        const carData = await car.json();

        setMovingInfo({
          ...carData.features[0].properties.summary
        })

        const cycling = await fetch(`https://api.openrouteservice.org/v2/directions/cycling-electric?api_key=${process.env.NEXT_PUBLIC_CARTONOVAROUTESTOKEN}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`);
        const cyclingData = await cycling.json();

        // const t = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${process.env.NEXT_PUBLIC_CARTONOVAROUTESTOKEN}&text=${'طنجة%20البالية'}&size=1`);
        // const tData = await t.json();
        // vectSource.addFeature(new Feature({ geometry: new Point(proj4('EPSG:4326', 'EPSG:3857').forward(tData.features[0].geometry.coordinates)) }));

        const routeRecommended = new LineString(carData.features[0].geometry.coordinates);
        routeRecommended.transform('EPSG:4326', 'EPSG:3857');

        const routeFeatureRecommended = new Feature(routeRecommended);
        routeFeatureRecommended.setStyle(
          new Style({
            stroke: new Stroke({
              color: "#03f703",
              width: 4,
            })
          })
        )

        const routeAlternative = new LineString(cyclingData.features[0].geometry.coordinates);
        routeAlternative.transform('EPSG:4326', 'EPSG:3857');

        const routeFeatureAlternative = new Feature(routeAlternative);
        routeFeatureAlternative.setStyle(
          new Style({
            stroke: new Stroke({
              color: "#f63c3c",
              width: 4,
            }),
            // text: new Text({
            //   text: "omar"
            // })
          })
        )
        
        vectSource.addFeature(routeFeatureRecommended);
        vectSource.addFeature(routeFeatureAlternative);
      })();

      const iconFeature = new Feature({ geometry: new Point(position) });

      vectSource.addFeature(iconFeature);
      vectSource.addFeature(new Feature({ geometry: new Point(target) }));

      view.setCenter(target);

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

      const accuracy = geolocation.getAccuracy() && geolocation.getAccuracy() + ' [m]';
      const altitude = geolocation.getAltitude() && geolocation.getAltitude() + ' [m]';
      const altitudeAccuracy = geolocation.getAltitudeAccuracy() && geolocation.getAltitudeAccuracy() + ' [m]';
      const heading = +(geolocation.getHeading() ?? 0).toFixed(2);
      const speed = +(geolocation.getSpeed() ?? 0).toFixed(2);

      image.setRotation(heading);

      setMovingInfo(prev => ({
        ...prev,
        accuracy,
        altitude,
        altitudeAccuracy,
        speed,
      }))
      
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
      GPSFeature.setStyle(iconStyle);
      if (geolocation.getRevision() === 0) {
        view.setCenter(coordinates);
        view.setZoom(18);
      }

      // if (target.length)
      //   fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.NEXT_PUBLIC_CARTONOVAROUTESTOKEN}&start=${coordinates[0]},${coordinates[1]}&end=${target[0]},${target[1]}`)
      //   .then(r => r.json()).then(r => {
      //     console.log(r.features[0].properties.summary);
      //   });
    });

  }, []);

  return (
    <>
      <div id="map"  className={`${styles.mapContainer} ol-zoom`}><span></span></div>
      <div className="moving-info">
        <label htmlFor='userInfo'>
          <img src={arrowSelect.src} alt="arrow" />
        </label>
        <input type='checkbox' id='userInfo' disabled={!movingInfo} />
        <div className="moving-info__details">
          <MovingInfoDetails><span>distance:&nbsp;</span><span>{distanceFormatter(+movingInfo?.distance)}</span></MovingInfoDetails>
          <MovingInfoDetails><span>duration:&nbsp;</span><span>{timeFormatter(movingInfo?.speed ? +movingInfo?.distance / movingInfo?.speed : +movingInfo?.duration) }</span></MovingInfoDetails>
          <MovingInfoDetails><span>speed:&nbsp;</span><span>{movingInfo?.speed + " m/s"}</span></MovingInfoDetails>
        </div>
        {
          // movingInfo && (
          //   <div className="moving-info__details">
          //     <div>
          //       {/* <img src={compass.src} alt="compass icon" /> */}
          //     </div>
          //   </div>
          // )
        }
        
      </div>
    </>
  )
};

export default GotoMap;

const MovingInfoDetails = ({ children }) => (
  <div className="duration" onClick={() => navigator.clipboard.writeText(children[1].props.children)}>
    {children}
  </div>
)