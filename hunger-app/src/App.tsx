import { ChangeEvent, useEffect, useRef, useState } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const [inputAddress, setInputAddress] = useState("");
  const [returnedFormattedAddress, setReturnedAddress] = useState("");
  const [uiLatitude, setUiLatitude] = useState<number | null>(null);
  const [uiLongitude, setUiLongitude] = useState<number | null>(null);
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
      setUiLatitude(data.latitude);
      setUiLongitude(data.longitude);
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
    <main
      className="flex place-content-center flex-col flex-wrap pt-28"
      id="container"
    >
      <div
        className="card card-compact max-w-screen-md w-3/5 flex border-4 border-solid border-secondary"
        id="content"
      >
        <h1 className="card-title font-bold font-rethinkSans text-[#1d202d] text-5xl p-5 rounded-tl-xl rounded-tr-xl border-0 justify-center bg-[#eca700]">
          Hunger
        </h1>
        <p className="pt-8 pb-2 text-center">
          Your formatted address: {returnedFormattedAddress}
        </p>
        <p className="p-0 text-center">Your latitude: {uiLatitude}</p>
        <p className="p-0 text-center">Your longitude: {uiLongitude}</p>
        <label
          className=" self-center text-xl input mt-10 max-md:text-sm"
          htmlFor="address"
        >
          5-digit ZIP Code or address
        </label>
        <input
          className="self-center text-sm place-content-center input w-2/3 outline mb-8 max-md:text-xs"
          type="text"
          id="address"
          ref={inputRef}
          value={inputAddress}
          placeholder="e.g. '21401' or '145 Broadway, Buffalo, NY 14203'"
          onChange={handleInputUpdate}
          autoComplete="off"
        />
        <button
          className="btn no-animation place-self-end bg-[#e92727] hover:bg-[#9c1a1a] active:bg-[#4f0d0d] border-0 transition-all rounded-bl-xl rounded-br-xl rounded-tl-none rounded-tr-none w-full"
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
          Submit
        </button>
      </div>
      <input
        className="btn btn-primary w-1/4 h-5 border self-center"
        type="button"
        name=""
        value="Open Map"
        id="testMap"
        onClick={(HTMLButtonElement) => {
          HTMLButtonElement.nativeEvent.preventDefault;
          if (showMap) {
            setShowMap(false);
          } else setShowMap(true);
        }}
      />
      {showMap ? (
        <Map
          {...mapViewState}
          reuseMaps
          zoom={16}
          mapboxAccessToken={apiKey}
          style={{ width: "40%", height: "50vh" }}
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
    </main>
  );
}

export default App;
