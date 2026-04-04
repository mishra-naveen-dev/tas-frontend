import React, { useEffect, useMemo, useState, useRef } from 'react';
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
import { Box, Button, Stack } from '@mui/material';

// ================= ICON FIX =================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// ================= MAP FIT =================
const FitBounds = ({ path }) => {
    const map = useMap();

    useEffect(() => {
        if (path.length > 1) {
            map.fitBounds(path, { padding: [40, 40] });
        }
    }, [path, map]);

    return null;
};

// ================= MAIN =================
const MapView = ({ punches = [] }) => {

    const [routePath, setRoutePath] = useState([]);
    const [playIndex, setPlayIndex] = useState(0);
    const [playing, setPlaying] = useState(false);

    const intervalRef = useRef(null);

    // ================= SORT + FILTER =================
    const validPunches = useMemo(() => {
        return punches
            .filter(p => p.latitude && p.longitude)
            .sort((a, b) => new Date(a.punched_at) - new Date(b.punched_at));
    }, [punches]);

    // ================= FETCH ROAD ROUTE =================
    useEffect(() => {
        const fetchRoute = async () => {

            if (validPunches.length < 2) {
                setRoutePath(validPunches.map(p => [p.latitude, p.longitude]));
                return;
            }

            try {
                const coords = validPunches
                    .map(p => `${p.longitude},${p.latitude}`)
                    .join(';');

                const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

                const res = await fetch(url);
                const data = await res.json();

                const routeCoords = data.routes[0].geometry.coordinates.map(
                    ([lng, lat]) => [lat, lng]
                );

                setRoutePath(routeCoords);

            } catch (err) {
                console.error("Route API failed, fallback:", err);

                // fallback straight line
                setRoutePath(validPunches.map(p => [p.latitude, p.longitude]));
            }
        };

        fetchRoute();
    }, [validPunches]);

    // ================= PLAYBACK =================
    useEffect(() => {
        if (!playing) return;

        intervalRef.current = setInterval(() => {
            setPlayIndex(prev => {
                if (prev >= routePath.length - 1) {
                    clearInterval(intervalRef.current);
                    return prev;
                }
                return prev + 1;
            });
        }, 200); // speed

        return () => clearInterval(intervalRef.current);
    }, [playing, routePath]);

    const handlePlay = () => {
        setPlayIndex(0);
        setPlaying(true);
    };

    const handlePause = () => {
        setPlaying(false);
    };

    // ================= DEFAULT =================
    const defaultCenter = [23.0225, 72.5714];

    const currentPosition =
        routePath[playIndex] || defaultCenter;

    return (
        <Box position="relative">

            {/* ================= CONTROLS ================= */}
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 1000
                }}
            >
                <Button variant="contained" onClick={handlePlay}>
                    ▶ Play
                </Button>

                <Button variant="outlined" onClick={handlePause}>
                    ⏸ Pause
                </Button>
            </Stack>

            <MapContainer
                center={currentPosition}
                zoom={13}
                style={{ height: '500px', width: '100%', borderRadius: 8 }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {routePath.length > 1 && <FitBounds path={routePath} />}

                {/* ROAD PATH */}
                <Polyline
                    positions={routePath}
                    color="blue"
                    weight={5}
                />

                {/* ORIGINAL PUNCH POINTS */}
                {validPunches.map((p, i) => (
                    <Marker
                        key={i}
                        position={[p.latitude, p.longitude]}
                    >
                        <Popup>
                            Point {i + 1} <br />
                            {new Date(p.punched_at).toLocaleString()}
                        </Popup>
                    </Marker>
                ))}

                {/* MOVING MARKER */}
                {routePath.length > 0 && (
                    <Marker position={currentPosition}>
                        <Popup>🚗 Moving</Popup>
                    </Marker>
                )}

            </MapContainer>
        </Box>
    );
};

export default MapView;