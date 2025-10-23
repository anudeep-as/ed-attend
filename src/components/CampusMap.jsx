import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CampusMap = () => {
  const auditoriumLocation = { lat: 12.909367891934833, lng: 79.29550887282808 };
  const libraryLocation = { lat: 12.908486913735121, lng: 79.29533002485054 };

  // Calculate center between the two locations
  const centerLat = (auditoriumLocation.lat + libraryLocation.lat) / 2;
  const centerLng = (auditoriumLocation.lng + libraryLocation.lng) / 2;

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={18}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[auditoriumLocation.lat, auditoriumLocation.lng]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold">Auditorium</h3>
              <p className="text-sm text-gray-600">
                Latitude: {auditoriumLocation.lat}<br />
                Longitude: {auditoriumLocation.lng}
              </p>
            </div>
          </Popup>
        </Marker>
        <Marker position={[libraryLocation.lat, libraryLocation.lng]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold">Library</h3>
              <p className="text-sm text-gray-600">
                Latitude: {libraryLocation.lat}<br />
                Longitude: {libraryLocation.lng}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default CampusMap;
