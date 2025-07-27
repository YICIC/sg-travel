import React, { useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  LoadScript,
  Autocomplete
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 1.3521,
  lng: 103.8198,
};

export default function MapComponent() {
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const autoCompleteRef = useRef(null);

  const onLoad = (mapInstance: any) => {
    setMap(mapInstance);
  };

  const handlePlaceChanged = () => {
    const place = autoCompleteRef.current.getPlace();
    if (!place.geometry || !place.geometry.location) {
      alert("未找到有效地址，请重新选择");
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setMarkerPosition({ lat, lng });
    map.panTo({ lat, lng });
    setPlaceName(place.formatted_address || place.name || "");
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["places"]}
    >
      <div style={{ position: "absolute", zIndex: 100, top: 10, left: 10, background: "white", padding: 8, borderRadius: 4 }}>
        <Autocomplete
          onLoad={(autocomplete) => (autoCompleteRef.current = autocomplete)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            type="text"
            placeholder="Search location..."
            style={{
              width: "300px",
              height: "40px",
              padding: "0 12px",
              fontSize: "16px",
            }}
          />
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
        onLoad={onLoad}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={(e) =>
              setMarkerPosition({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              })
            }
          />
        )}
      </GoogleMap>

      {/* 右下角确认按钮 */}
      {markerPosition && (
        <div style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 100,
        }}>
          <button
            onClick={() => {
              alert(`添加成功：\n${placeName}\n经纬度: ${markerPosition.lat}, ${markerPosition.lng}`);
              // 此处你可以写：保存卡片信息到状态 / 本地存储 / 数据库
            }}
            style={{
              padding: "12px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            确认添加
          </button>
        </div>
      )}
    </LoadScript>
  );
}
