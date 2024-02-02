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
  const [placeID, setPlaceID] = useState("");
  const [placeName, setPlaceName] = useState("");

  const mapboxApiKey = import.meta.env.VITE_MAPBOX_KEY;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

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
  //checks to see if input is empty and skips submission if so
  function handleSubmissionValidation() {
    if (inputRef.current?.value !== "") {
      updateUiState(findRestaurant());
    } else {
      window.alert("Please enter a ZIP code or address");
    }
  }

  //used on address submission, sends current state of input onSubmit to mapbox address validation API
  async function handleAddressSubmission(): Promise<ViewState> {
    const submittedAddress = inputRef.current?.value;
    let returnedLatitude = 38.8977;
    let returnedLongitude = 77.0365;

    setInputAddress("");
    const mapBoxEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${submittedAddress}.json?country=us&proximity=ip&access_token=${mapboxApiKey}`;

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

  async function findRestaurant(): Promise<ViewState> {
    const addressCenter: Promise<ViewState> = handleAddressSubmission();
    let addressLatitude: number = 0;
    let addressLongitude: number = 0;
    let restaurantLatitude = 0;
    let restaurantLongitude = 0;
    await addressCenter.then((data) => {
      addressLatitude = data.latitude;
      addressLongitude = data.longitude;
    });
    const googleMapsEndpoint = `https://places.googleapis.com/v1/places:searchNearby`;
    const searchRequest = {
      method: "POST",
      cahce: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googleMapsApiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress",
      },
      body: JSON.stringify({
        includedTypes: ["restaurant"],
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: {
              latitude: addressLatitude,
              longitude: addressLongitude,
            },
            radius: 35000.0,
          },
        },
      }),
    };

    await fetch(googleMapsEndpoint, searchRequest)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setPlaceID(data.places[0].id);
        setPlaceName(data.places[0].displayName.text);
        setReturnedAddress(data.places[0].formattedAddress);
      })
      .catch((error) => {
        window.alert(error.message);
      });

    return {
      latitude: restaurantLatitude,
      longitude: restaurantLongitude,
    };
  }

  return (
    <div className="grid grid-cols-[65%,35%]">
      <div
        className="grid grid-cols-1 grid-rows-3 place-items-center"
        id="container"
      >
        <div
          className="select-none font-bungeeShade text-8xl text-[#1E1E1F]"
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
        {/* <label className="" htmlFor="address">
          5-digit ZIP Code or address
        </label> */}
        <input
          className="rounded-[2.5rem] w-2/3 text-center text-6xl font-cousine h-40 border duration-[35ms] ease-linear bg-transparent focus:outline focus:outline-2 border-[#1E1E1F] text-[#1E1E1F] placeholder-[#1E1E1F]"
          type="text"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmissionValidation();
            }
          }}
          id="address"
          ref={inputRef}
          value={inputAddress}
          placeholder="e.g. '21401' or '145 Broadway, Buffalo, NY 14203'"
          onChange={handleInputUpdate}
          autoComplete="off"
        />
        <button
          className="rounded-[2.5rem] w-2/3 text-center text-6xl font-cousine h-40 border bg-transparent duration-500 ease-out shadow-[-10px,10px,0px,0px] border-[#1E1E1F] text-[#1E1E1F] "
          type="button"
          id="submitButton"
          onClick={handleSubmissionValidation}
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
      <div className="grid grid-cols-1 grid-rows-1 place-items-center w-full h-[100dvh] border-dashed border-l border-[#1E1E1F]">
        {showMap ? (
          <>
            {/* <Map
              {...mapViewState}
              id="map"
              reuseMaps
              zoom={15}
              mapboxAccessToken={apiKey}
              style={{
                width: "70%",
                height: "50%",
                margin: "auto",
                borderWidth: "1px",
                borderColor: "#1E1E1F",
                borderRadius: "2rem",
              }}
              mapStyle="mapbox://styles/mapbox/streets-v9"
            >
              <Marker {...markerViewState}>
                <img
                  style={{ width: "4rem", height: "4rem" }}
                  src="/src/assets/pin.png"
                />
              </Marker>
            </Map> */}
            <iframe
              width="70%"
              height="50%"
              style={{ border: "1px" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}
              &q=place_id:${placeID}`}
            ></iframe>
            <p>Your recommended eatery is {placeName}.</p>
            <p>Address: {returnedFormattedAddress}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;
