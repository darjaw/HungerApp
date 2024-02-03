import { ChangeEvent, useEffect, useRef, useState } from "react";

function App() {
  const [inputAddress, setInputAddress] = useState("");
  const [returnedFormattedAddress, setReturnedAddress] = useState("");
  const [mapVisible, setMapVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [placeID, setPlaceID] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);

  const mapboxApiKey = import.meta.env.VITE_MAPBOX_KEY;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  type Place = {
    latitude?: number;
    longitude?: number;
    placeId?: string;
    placeName?: string;
  };

  useEffect(() => {
    if (placeID !== null) setMapVisible(true);
  }, [placeID]);

  async function updateUiState(viewStateOptions: Promise<Place>) {
    let restaurantPlaceId: string | undefined = "";
    let restaurantPlaceName: string | undefined = "";
    await viewStateOptions.then((data) => {
      restaurantPlaceId = data.placeId;
      restaurantPlaceName = data.placeName;
    });
    setPlaceID(restaurantPlaceId);
    setPlaceName(restaurantPlaceName);
  }

  //updates submittedAddress useState as user is typing
  function handleInputUpdate(event: ChangeEvent<HTMLInputElement>) {
    setInputAddress(event.currentTarget.value);
  }
  //checks to see if input is empty and skips submission if so
  function handleSubmissionValidation() {
    if (inputRef.current?.value !== "") {
      updateUiState(searchPlaceEndpoint());
    } else {
      window.alert("Please enter a ZIP code or address");
    }
  }

  //used on address submission, sends current state of input onSubmit to mapbox address validation API
  async function handleAddressSubmission(): Promise<Place> {
    const submittedAddress = inputRef.current?.value;
    let returnedLatitude = 0;
    let returnedLongitude = 0;

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

  //used to query placeS
  async function searchPlaceEndpoint(): Promise<Place> {
    const addressCenter: Promise<Place> = handleAddressSubmission();
    let addressLatitude: number | undefined = 0;
    let addressLongitude: number | undefined = 0;
    let returnedPlaceId = "";
    let returnedPlaceName = "";
    await addressCenter.then((data) => {
      addressLatitude = data.latitude;
      addressLongitude = data.longitude;
    });
    const placesEndpoint = `https://places.googleapis.com/v1/places:searchNearby`;
    const searchRequest: RequestInit = {
      method: "POST",
      cache: "no-cache",
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

    await fetch(placesEndpoint, searchRequest)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        returnedPlaceId = data.places[0].id;
        returnedPlaceName = data.places[0].displayName.text;
        setReturnedAddress(data.places[0].formattedAddress);
      })
      .catch((error) => {
        window.alert(error.message);
      });

    return {
      placeId: returnedPlaceId,
      placeName: returnedPlaceName,
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
      </div>
      <div className="grid grid-cols-1 grid-rows-1 place-items-center w-full h-[100dvh] border-dashed border-l border-[#1E1E1F]">
        {mapVisible ? (
          <>
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
