import { ChangeEvent, useEffect, useRef, useState } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const [inputAddress, setInputAddress] = useState("");
  const [returnedFormattedAddress, setReturnedAddress] = useState("");
  const [showMap, setShowMap] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const defaultLocation = { latitude: 38.8977, longitude: 77.0365 };
  const [mapViewState, setMapViewState] = useState<ViewState | null>(null);
  const [markerViewState, setMarkerViewState] = useState<ViewState>({
    ...defaultLocation,
  });

  const apiKey = import.meta.env.VITE_MAPBOX_KEY;

  type ViewState = {
    latitude: number;
    longitude: number;
  };

  useEffect(() => {
    if (mapViewState !== null) setShowMap(true);
  }, [mapViewState]);

  function updateUiState(viewStateOptions: Promise<ViewState>) {
    viewStateOptions.then((data) => {
      setMapViewState({
        latitude: data.latitude,
        longitude: data.longitude,
      });
      setMarkerViewState({
        latitude: data.latitude,
        longitude: data.longitude,
      });
    });
  }

  //updates submittedAddress useState as user is typing
  function handleInputUpdate(event: ChangeEvent<HTMLInputElement>) {
    setInputAddress(event.currentTarget.value);
  }

  //used on address submission, sends current state of input onSubmit to mapbox address validation API
  async function handleAddressSubmission(): Promise<ViewState> {
    const submittedAddress = inputRef.current?.value;
    let returnedLatitude = 38.8977;
    let returnedLongitude = 77.0365;

    setInputAddress("");
    const mapBoxEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${submittedAddress}.json?country=us&proximity=ip&access_token=${apiKey}`;

    await fetch(mapBoxEndpoint)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setReturnedAddress(data.features[0].place_name);
        returnedLatitude = data.features[0].center[1];
        returnedLongitude = data.features[0].center[0];
      })
      .catch((error) => {
        window.alert(error.message);
      });
    return {
      latitude: returnedLatitude,
      longitude: returnedLongitude,
    };
  }

  return (
    <div className="grid grid-cols-[50%,50%] place-content-center">
      <div
        className="grid grid-cols-1 mt-24 gap-y-40 place-content-center"
        id="container"
      >
        <div
          className="text-center font-bungeeShade text-8xl text-[#1E1E1F] max-sm:"
          id="title"
        >
          Hunger
        </div>
        {/* <p className="pt-8 pb-2 text-center">
        Your formatted address: {returnedFormattedAddress}
      </p>
      <p className="p-0 text-center">Your latitude: {mapViewState?.latitude}</p>
      <p className="p-0 text-center">
        Your longitude: {mapViewState?.longitude}
      </p> */}
        {/* <label
        className="text-center text-xl mt-10 max-md:text-sm col-span-full"
        htmlFor="address"
      >
        5-digit ZIP Code or address
      </label> */}
        <input
          className="rounded-[2.5rem] w-3/4 text-center font-cousine h-40 ml-20 border bg-transparent focus:outline focus:outline-2 border-[#1E1E1F] text-[#1E1E1F] placeholder-[#1E1E1F]"
          type="text"
          id="address"
          ref={inputRef}
          value={inputAddress}
          placeholder="e.g. '21401' or '145 Broadway, Buffalo, NY 14203'"
          onChange={handleInputUpdate}
          autoComplete="off"
        />
        <button
          className="rounded-[2.5rem] w-3/4 text-center text-6xl font-cousine h-40 ml-20 border bg-transparent ease-in-out shadow-[-10px,10px,0px,0px] border-[#1E1E1F] text-[#1E1E1F] "
          type="button"
          id="submitButton"
          onClick={() => {
            if (inputRef.current?.value !== "") {
              updateUiState(handleAddressSubmission());
            } else {
              window.alert("Please enter a ZIP code or address");
            }
          }}
        >
          submit
        </button>

        {/* <input
        className="btn-primary w-1/4 h-5 border self-center"
        type="button"
        name=""
        value={showMap ? "Hide Map" : "Show Map"}
        id="testMap"
        onClick={(HTMLButtonElement) => {
          HTMLButtonElement.nativeEvent.preventDefault;
          if (showMap) {
            setShowMap(false);
          } else setShowMap(true);
        }}
      /> */}
      </div>
      {showMap ? (
        <Map
          {...mapViewState}
          id="map"
          reuseMaps
          zoom={16}
          mapboxAccessToken={apiKey}
          style={{ width: "60%", height: "50%", margin: "auto" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
        >
          <Marker {...markerViewState}>
            <img
              style={{ width: "4rem", height: "4rem" }}
              src="/src/assets/pin.png"
            />
          </Marker>
        </Map>
      ) : null}
    </div>
  );
}

export default App;
