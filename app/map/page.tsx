"use client";

import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const center = { lat: 51.1283, lng: 71.4305 }; // Астана (Байтерек)

const containerStyle = {
  width: '100%',
  height: '100%'
};

export default function MapPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
  });

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Функция загрузки данных
  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        if (Array.isArray(data)) {
          setEvents(data);
        }
      } catch (e) {
        console.error("Ошибка загрузки данных:", e);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  if (!isLoaded || loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0a0f1c] text-white">Загрузка карты...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#0a0f1c]">
      {/* Верхняя панель с информацией */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
        <h1 className="text-white font-semibold">События на карте</h1>
        <div className="text-slate-400 text-sm italic">
          Найдено в базе: <span className="text-blue-400 font-bold">{events.length}</span>
        </div>
      </div>

      {/* Карта */}
      <div className="flex-1 w-full relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          options={{
            disableDefaultUI: false,
            clickableIcons: false,
            // Сюда потом вернем darkMapStyle
          }}
        >
          {events.map((event) => (
            <Marker
              key={event.id}
              position={{ lat: event.lat, lng: event.lng }}
              title={event.title}
              // Кастомная иконка
              icon={{
                url: 'https://cdn-icons-png.flaticon.com/512/7901/7901511.png',
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}