import React, { useMemo } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ================= FIX DEFAULT ICON =================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// ================= MARKER COLOR =================
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

// ================= AUTO FIT =================
const FitBounds = ({ path }) => {
    const map = useMap();

    React.useEffect(() => {
        if (path.length > 1) {
            map.fitBounds(path, { padding: [30, 30] });
        }
    }, [path, map]);

    return null;

};

const MapView = ({ punches = [] }) => {

    // ================= VALIDATE =================
    const validPunches = useMemo(() => {
        return punches
            .filter(p => p.latitude && p.longitude)
            .sort((a, b) => new Date(a.punched_at) - new Date(b.punched_at));
    }, [punches]);

    const hasData = validPunches.length > 0;

    // ================= DEFAULT LOCATION =================
    const defaultCenter = [23.0225, 72.5714]; // Ahmedabad

    const path = hasData
        ? validPunches.map(p => [p.latitude, p.longitude])
        : [];

    const last = hasData
        ? validPunches[validPunches.length - 1]
        : { latitude: defaultCenter[0], longitude: defaultCenter[1] };

    return (
        <div style={{ position: 'relative' }}>

            {/* EMPTY STATE OVERLAY */}
            {!hasData && (
                <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    width: '100%',
                    textAlign: 'center',
                    paddingTop: 10,
                    fontWeight: 500,
                    color: '#666'
                }}>
                    No tracking data available. Showing default location.
                </div>
            )}

            <MapContainer
                center={[last.latitude, last.longitude]}
                zoom={13}
                style={{ height: '350px', width: '100%', borderRadius: 8 }}
            >
                <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* AUTO FIT ONLY WHEN DATA */}
                {hasData && <FitBounds path={path} />}

                {/* PATH */}
                {hasData && (
                    <Polyline
                        positions={path}
                        color="red"
                        weight={4}
                        opacity={0.7}
                    />
                )}

                {/* MARKERS */}
                {hasData ? (
                    validPunches.map((p, i) => (
                        <Marker
                            key={i}
                            position={[p.latitude, p.longitude]}
                            icon={getMarkerIcon(i, validPunches.length)}
                        >
                            <Popup>
                                <div style={{ fontSize: 13 }}>
                                    <b>{p.punch_type || "Punch"}</b><br />
                                    📅 {new Date(p.punched_at).toLocaleString()}<br />
                                    📍 {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}<br />
                                    🚗 Distance: {p.distance_from_last || 0} km<br />
                                </div>
                            </Popup>
                        </Marker>
                    ))
                ) : (
                    <Marker position={defaultCenter}>
                        <Popup>
                            Default Location (No punches yet)
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );

};

export default MapView;