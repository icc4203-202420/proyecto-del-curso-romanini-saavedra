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
  
    useEffect(() => {
      if (!libraries || cities.length === 0) {
        return;
      }
    
      const { Map, InfoWindow } = libraries[MAPS_LIBRARY];
      mapRef.current = new Map(mapNodeRef.current, {
        mapId: 'DEMO_MAP_ID',
        center: MAP_CENTER,
        zoom: 7,
      });
    
      // Colocar el marcador de ubicación del usuario
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const userCords = { lat: latitude, lng: longitude };
        const marker = new Marker({ position: userCords });
        marker.setMap(mapRef.current);
        mapRef.current.panTo(userCords);
      });
    
      const { AdvancedMarkerElement: Marker, PinElement } = libraries[MARKER_LIBRARY];
    
      const markers = cities.map(({ name, latitude, longitude }) => {
        const pin = new PinElement();
        pin.glyph = name;
        const marker = new Marker({
          position: { lat: latitude, lng: longitude },
          content: pin.element,
        });
    
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          const infoWindow = new InfoWindow({
            content: `<div>${name}</div>`,
          });
          infoWindow.open(mapRef.current, marker);
          infoWindowRef.current = infoWindow;
        });
        return marker;
      });
    
      markerCluster.current = new MarkerClusterer({
        map: mapRef.current,
        markers,
      });
    }, [libraries, cities]);
  
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

        // useEffect(() => {
    //     console.log("CIUDADES:", cities);
    //     console.log("CIUDADES TIPO:", cities.typeof);
    // }, [cities]);