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
  const inputNodeRef = useRef();
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  const handleSearch = (event) => {
    if (event.key !== 'Enter') {
      return;
    }
  
    const inputValue = inputNodeRef.current.value.toLowerCase();
  
    // Buscar en la lista de ciudades filtradas
    const foundCity = filteredCities.find((city) =>
      city.name.toLowerCase().includes(inputValue) ||
      city.address.line1.toLowerCase().includes(inputValue) ||
      city.address.line2?.toLowerCase().includes(inputValue) ||
      city.address.city.toLowerCase().includes(inputValue) ||
      city.address.country.name.toLowerCase().includes(inputValue)
    );
  
    if (foundCity) {
      // Panear a la ubicación de la ciudad encontrada
      mapRef.current.panTo({ lat: foundCity.latitude, lng: foundCity.longitude });
      mapRef.current.setZoom(12); // Opcional, ajusta el nivel de zoom para centrar mejor
    } else {
      console.log("Ciudad no encontrada");
    }
  };

  const handleFilter = (event) => {
    //event.preventDefault();
    
    const inputValue = event.target.value.toLowerCase();

    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(inputValue) ||
      city.address.line1.toLowerCase().includes(inputValue) ||
      city.address.line2?.toLowerCase().includes(inputValue) ||
      city.address.city.toLowerCase().includes(inputValue) ||
      city.address.country.name.toLowerCase().includes(inputValue)
    );

    setFilteredCities(filtered);
    
    // En inputValue tenemos almacenado lo que el usuario ha escrito hasta el minuto input 
    //Por que?, porque con event.target obtenemos el elemento HTML que llamó a esta función, y con .value tenemos su valor.

    /* TODO: Ahora lo que tenemos que hacer, es
    mediante la lista cities, quedarnos con las ciudades que partan/contengan lo almacenado en el input, con esta nueva lista de ciudades, setearlas en nuestro estado
    filteredCities
    */
  };

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
      setFilteredCities(dataParsedFiltered); // Mostrar todos los bares inicialmente
    }
    fetchCities();
  //   console.log("Ciudades:", cities)
  }, [])
  
  useEffect(() => {
    if (!libraries || cities.length === 0) {
      return;
    }
  
    const { Map, InfoWindow } = libraries[MAPS_LIBRARY];
    
    // Solo inicializamos el mapa si no ha sido ya inicializado
    if (!mapRef.current) {
      mapRef.current = new Map(mapNodeRef.current, {
        mapId: 'DEMO_MAP_ID',
        center: MAP_CENTER,
        zoom: 7,
      });
      
      mapRef.current.controls[ControlPosition.TOP_RIGHT].push(inputNodeRef.current);
  
      // Colocar el marcador de ubicación del usuario
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const userCords = { lat: latitude, lng: longitude };
        const marker = new Marker({ position: userCords });
        marker.setMap(mapRef.current);
        mapRef.current.panTo(userCords);
      });
    }
  
    const { AdvancedMarkerElement: Marker, PinElement } = libraries[MARKER_LIBRARY];
    
    // Crear o actualizar los marcadores en función de las ciudades filtradas
    const markers = filteredCities.map(({ name, latitude, longitude }) => {
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
  
    // Actualizar los marcadores del cluster
    if (markerCluster.current) {
      markerCluster.current.clearMarkers();
    }
  
    markerCluster.current = new MarkerClusterer({
      map: mapRef.current,
      markers,
    });
  
  }, [libraries, filteredCities]);

  if (!libraries) {
    return <h1>Cargando. . .</h1>;
  }

  if (!cities || parseInt(cities.length) === 0) {
      return <h1>Cargando locaciones. . .</h1>;
  }

  return (
    <>
      <input 
        ref={inputNodeRef} 
        type="text"
        placeholder='Buscar bar'
        onKeyDown={handleSearch}
        onChange={handleFilter}
      />
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