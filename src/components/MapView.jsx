import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// FIX ICON
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// MARKER COLOR
const getMarkerIcon = (index, total) => {
    let color = 'blue';
    if (index === 0) color = 'green';
    else if (index === total - 1) color = 'red';

    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
};

const MapView = ({ punches = [] }) => {

    if (!Array.isArray(punches) || punches.length === 0) {
        return <p>No location data</p>;
    }

    const sortedPunches = [...punches].sort(
        (a, b) => new Date(a.punched_at) - new Date(b.punched_at)
    );

    const path = sortedPunches.map(p => [p.latitude, p.longitude]);
    const last = sortedPunches[sortedPunches.length - 1];

    return (
        <MapContainer
            center={[last.latitude, last.longitude]}
            zoom={13}
            style={{ height: '350px', width: '100%' }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* PATH */}
            <Polyline positions={path} color="red" weight={4} />

            {/* MARKERS */}
            {sortedPunches.map((p, i) => {
                const offset = i * 0.00005; // prevent overlap

                return (
                    <Marker
                        key={i}
                        position={[
                            p.latitude + offset,
                            p.longitude + offset
                        ]}
                        icon={getMarkerIcon(i, sortedPunches.length)}
                    >
                        <Popup>
                            <b>{p.punch_type}</b><br />
                            {new Date(p.punched_at).toLocaleString()}<br />
                            Distance: {p.distance_from_last || 0} km
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default MapView;