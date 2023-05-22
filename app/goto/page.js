"use client";

import { useEffect, useState } from 'react';
import proj4 from 'proj4';

import { GotoMap, Input, InputSelect } from '@/components';
import { search, location } from '@/images';

import styles from '@/styles/goto.module.css';
import getEPSGData from '@/utils/getEPSGData';

const Goto = () => {
  const [gotoData, setGotoData] = useState({
    x: "",
    y: "",
    country: 'World',
    proj_name: ''
  });

  const [epsg, setEpsg] = useState({
    countries: [],
    projSys: [],
  });

  const [isGPSActive, setIsGPSActive] = useState(false);
  const [target, setTarget] = useState([]);
  const [isWithCoordinates, setIsWithCoordinates] = useState(true);

  useEffect(() => {
    getEPSGData()
    .then(r => setEpsg(p => ({...p, ...r})))
    .catch(err => console.log(err));
  }, [])

  useEffect(() => {
    if (!epsg?.countries.length || epsg?.countries?.find(({country}) => country === gotoData.country))
      getEPSGData(gotoData.country)
      .then(r => {
        setEpsg(p => ({...p, ...r}));
        setGotoData(p => ({...p, proj_name: r?.projSys[0].proj_name}));
      })
      .catch(err => console.log(err));
  }, [gotoData.country])

  if (!epsg.countries.length || !epsg.projSys.length) return null;

  const getPoint = async () => {
    let addressCoordinates;

    if (!isWithCoordinates) {
      const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${process.env.NEXT_PUBLIC_CARTONOVAROUTESTOKEN}&text=${encodeURIComponent(gotoData.x)}&size=1`);
      addressCoordinates = await res.json();
    }

    setTarget(
      proj4(
        isWithCoordinates ? epsg.projSys.find(proj => proj.projName = gotoData.proj_name).proj_params : 'EPSG:4326',
        'EPSG:3857'
      ).forward(
        isWithCoordinates ? [+gotoData.x, +gotoData.y] : addressCoordinates.features[0].geometry.coordinates
    ));
  }

  const activeGPS = () => {
    setIsGPSActive(p => !p);
  }

  const switchRadiosHandler = (value) => {
    setIsWithCoordinates(value);
    setGotoData(p => ({...p, x: "", y: ""}));
  }

  return (
    <div className={styles.goto}>
        <GotoMap isGPSActive={isGPSActive} setIsGPSActive={setIsGPSActive} target={target} />
        <form>
            <div className="map-type-search-switch">
              <label>
                coordinates
                <input type="radio" checked={isWithCoordinates} name="type-search" id="" onChange={() => switchRadiosHandler(true)} />
              </label>
              <label>
                address
                <input type="radio" checked={!isWithCoordinates} name="type-search" id="" onChange={() => switchRadiosHandler(false)} />
              </label>
            </div>
            <div className="map-inputs">
                <div className="map-inputs__kernal">
                    <InputSelect name='country' placeholder={'country'} options={epsg.countries.map((country) => country.country)} value={gotoData.country} setValue={setGotoData} />
                    <InputSelect name='proj_name' placeholder={'projection system'} options={epsg.projSys.map((proj) => proj.proj_name)} value={gotoData.proj_name} setValue={setGotoData} />
                </div>
                <div className="map-inputs__coordinates">
                    <Input name='x' placeholder={isWithCoordinates ? 'X axes' : 'address'} value={gotoData.x} setValue={setGotoData} />
                    {isWithCoordinates && <Input name='y' placeholder='Y axes' value={gotoData.y} setValue={setGotoData} />}
                </div>
            </div>
            <div className="map-btns">
                <button type='button' onClick={getPoint}>
                    <img src={search.src} alt="search icon" /> 
                </button>
                <button type='button' onClick={activeGPS}>
                    <img src={location.src} alt="search icon" {...(isGPSActive ? { style: { filter: "invert(38%) sepia(88%) saturate(4037%) hue-rotate(196deg) brightness(105%) contrast(103%)" } } : {})} />
                </button>
            </div>
        </form>
    </div>
  )
}

export default Goto