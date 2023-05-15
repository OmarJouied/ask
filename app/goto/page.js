"use client";

import { useEffect, useState } from 'react';
import proj4 from 'proj4';

import GotoMap from '@/components/GotoMap'
import Input from '@/components/Input'
import InputSelect from '@/components/InputSelect'
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

  const getPoint = () => {
    setTarget(proj4((epsg.projSys.find((proj) => proj.proj_name = gotoData.proj_name))?.proj_params, 'EPSG:3857').forward([+gotoData.x, +gotoData.y]));
  }

  const activeGPS = () => {
    setIsGPSActive(p => !p);
  }

  return (
    <div className={styles.goto}>
        <GotoMap isGPSActive={isGPSActive} setIsGPSActive={setIsGPSActive} target={target} />
        <form>
            <div className="map-inputs">
                <div className="map-inputs__kernal">
                    <InputSelect name='country' placeholder={'country'} options={epsg.countries.map((country) => country.country)} value={gotoData.country} setValue={setGotoData} />
                    <InputSelect name='proj_name' placeholder={'projection system'} options={epsg.projSys.map((proj) => proj.proj_name)} value={gotoData.proj_name} setValue={setGotoData} />
                </div>
                <div className="map-inputs__coordinates">
                    <Input name='x' placeholder='X axes' value={gotoData.x} setValue={setGotoData} />
                    <Input name='y' placeholder='Y axes' value={gotoData.y} setValue={setGotoData} />
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