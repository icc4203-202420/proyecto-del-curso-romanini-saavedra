import { useEffect, useRef, useState } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useLoadGMapsLibraries } from '../hooks/useLoadGMapsLibraries';
import { MAPS_LIBRARY, MARKER_LIBRARY, ControlPosition } from '../constants';
import useAxios from 'axios-hooks';

const MAP_CENTER = { lat: -33.325125, lng: -70.767349 };

const BarsMap = () => {
    const libraries = useLoadGMapsLibraries();
    const markerCluster = useRef();
    const mapNodeRef = useRef();
    const mapRef = useRef();
    const infoWindowRef = useRef();
    const inputRef = useRef();
    const [cities, setCities] = useState([]);
  

    // const [{ data: allBarsData, loading, error}, refetch] = useAxios(
    //     {
    //         url: 'http://127.0.0.1:3001/api/v1/bars',
    //         method: 'GET'
    //     }
    // );

    // console.log("BARS DATA:", allBarsData)
    

    // useEffect(() => {
    //     const dataParsed = allBarsData.bars
    //     setCities(dataParsed)
    // })
    // const dataParsed = allBarsData.bars
    // setCities(dataParsed)

    



    // Hacer peticion para el backend
    useEffect(() => {

      const fetchCities = async () => {
        const url = 'http://127.0.0.1:3001/api/v1/bars'
        const response = await fetch(url)
        const dataParsed = await response.json()
        const dataParsedFiltered = await dataParsed.bars
        
        console.log("DATA PARSED:", dataParsedFiltered)
        console.log("DATA PARSED:", dataParsedFiltered.typeof)
        setCities(dataParsedFiltered)
      }
      fetchCities();
    //   console.log("Ciudades:", cities)
    }, [])

    // useEffect(() => {
    //     console.log("CIUDADES:", cities);
    //     console.log("CIUDADES TIPO:", cities.typeof);
    // }, [cities]);
  
    useEffect(() => {
        
      if (!libraries) {
        return;
      }

      /* if (!cities || parseInt(cities.length) === 0) {
        console.log("ERROR CIUDADES:", cities)
        return;
      } */
    //   console.log("CIUDADES EN ACA:", cities)
  
      const { Map, InfoWindow } = libraries[MAPS_LIBRARY];
      mapRef.current = new Map(mapNodeRef.current, {
        mapId: 'DEMO_MAP_ID',
        center: MAP_CENTER,
        zoom: 7,
      });
  
    //   mapRef.current.controls[ControlPosition.TOP_LEFT].push(inputRef.current);
  
      navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords
        const userCords = {lat: latitude, lng: longitude}
  
        const marker = new Marker({position: userCords})
  
        marker.setMap(mapRef.current)
  
  
  
        // Esta funcion recibe la coordenada a la que queremos ir
        mapRef.current.panTo(userCords)
      })
   
      const { AdvancedMarkerElement: Marker, PinElement } = libraries[MARKER_LIBRARY];
      // const positions = Array.from({ length: 10 }, randomCoordinates(MAP_CENTER));
      // const markers = positions.map((position) => new Marker({ position }));

    //   console.log("CIUDADES:", cities)
    //   console.log("CIUDADES:", cities[0].latitude)
      const markers = cities.map(({name, lat, lng}) => {
        console.log("NAMES:", name)
        const pin = new PinElement
        pin.glyph = name
        // pin.background = "#00ff00"
        const  marker = new Marker ({position: {lat, lng}, content: pin.element})
  
        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close()
          }
  
          const infoWindow = new InfoWindow({
            content: `<div>${name}</div>`,
            position: {}
          })
  
          infoWindow.open(mapRef.current, marker)
          infoWindowRef.current = infoWindow
  
  
          console.log(`Hiciste click en el punto en ${latitude}, ${longitude}`)
        })
  
        
  
        return marker
      });
  
      markerCluster.current = new MarkerClusterer({
        map: mapRef.current,
        markers,
      });
    }, [libraries], [cities]);
  
    if (!libraries) {
      return <h1>Cargando. . .</h1>;
    }

    if (!cities || parseInt(cities.length) === 0) {
        return <h1>Cargando locaciones. . .</h1>;
    }
  
    return (
      <>
        <input ref={inputRef} type="text"/>
        <div ref={mapNodeRef} style={{ width: '100vw', height: '100vh' }} />;
      
      </>
    )
}

export default BarsMap;