import { ChangeEvent, useEffect, useRef, useState } from "react";

function App() {
  const mapboxApiKey = import.meta.env.VITE_MAPBOX_KEY;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputAddress, setInputAddress] = useState<string>("");
  const [mapVisible, setMapVisible] = useState<boolean>(false);
  const [placeList, setPlaceList] = useState<Place[]>([]);
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [currentTabNumber, setCurrentTabNumber] = useState<number>(NaN);
  type Place = {
    id: string;
    name: string;
    formattedAddress: string;
    latitude?: number;
    longitude?: number;
    rating?: number;
  };

  useEffect(() => {
    setCurrentPlace(placeList[currentTabNumber]);
  }, [currentTabNumber, placeList]);

  //updates submittedAddress useState as user is typing
  function handleInputUpdate(event: ChangeEvent<HTMLInputElement>) {
    setInputAddress(event.currentTarget.value);
  }

  //checks to see if input is empty and skips submission if so
  async function handleSubmissionValidation() {
    if (inputRef.current?.value.trim() !== "") {
      setPlaceList(await getPlaceList());
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
        returnedLatitude = data.features[0].center[1];
        returnedLongitude = data.features[0].center[0];
      })
      .catch((error) => {
        console.log("error!");
        if (
          error.message ===
            `can't access property "center", data.features[0] is undefined` ||
          error.message ===
            `can't access property "center", data.features[1] is undefined`
        ) {
          window.alert(
            "Unable to find location, retry zip or address submission."
          );
        } else window.alert("Error: " + error.message);
      });
    if (returnedLatitude != 0 && returnedLongitude != 0) {
      return {
        latitude: returnedLatitude,
        longitude: returnedLongitude,
        id: "",
        name: "",
        formattedAddress: "",
      };
    } else
      return {
        latitude: undefined,
        longitude: undefined,
        id: "",
        name: "",
        formattedAddress: "",
      };
  }

  async function getPlaceList(fromClientLocation: boolean): Promise<Place[]> {
    const placeSearchResponse: Response = await searchPlaceEndpoint(
      fromClientLocation
    );
    const randomNumberList: number[] = [];
    const placeList: Place[] = [];
    // array of 5 random numbers
    while (randomNumberList.length < 20) {
      const randomNumber = Math.floor(Math.random() * 20);
      if (randomNumberList.indexOf(randomNumber) === -1)
        randomNumberList.push(randomNumber);
    }

    placeSearchResponse.json().then((data) => {
      for (let i = 0; i < 5; i++) {
        placeList.push({
          id: data.places[randomNumberList[i]].id,
          name: data.places[randomNumberList[i]].displayName.text,
          formattedAddress: data.places[randomNumberList[i]].formattedAddress,
        });
      }
      setCurrentTabNumber(0);
      if (mapVisible == false) {
        setMapVisible(true);
      }
    });
    console.log(placeList);
    return placeList;
  }

  //used to query Google places api, returns response
  async function searchPlaceEndpoint(
    fromClientLocation: boolean
  ): Promise<Response> {
    let addressCenter: Place;
    if (!fromClientLocation) {
      addressCenter = await handleAddressSubmission();
    } else {
      const successCallBack = (position: GeolocationCoordinates) => {
        addressCenter.latitude = position.latitude;
        addressCenter.longitude = position.latitude;
      };
      navigator.geolocation.getCurrentPosition(successCallBack);
    }
    const placesEndpoint = `https://places.googleapis.com/v1/places:searchNearby`;
    const searchRequest: RequestInit = {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googleMapsApiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.googleMapsUri",
      },
      body: JSON.stringify({
        includedTypes: ["restaurant"],
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: {
              latitude: addressCenter.latitude,
              longitude: addressCenter.longitude,
            },
            radius: 35000.0,
          },
        },
      }),
    };
    if (
      addressCenter.latitude !== undefined ||
      addressCenter.longitude !== undefined
    ) {
      return await fetch(placesEndpoint, searchRequest).then((response) => {
        return response;
      });
    } else return Promise.reject(new Error("invalid location"));
  }

  async function getClientLocation() {
    setPlaceList(await getPlaceList(true));
  }

  return (
    <div className="grid grid-cols-[60%,40%]">
      <div
        className="grid grid-cols-1 grid-rows-3 place-items-center"
        id="container"
      >
        <div
          className="select-none font-bungeeShade text-9xl text-[#1E1E1F]"
          id="title"
        >
          Hunger
        </div>
        <div className="flex">
          <input
            className="rounded-[2.5rem] w-2/3 text-center text-5xl font-cousine h-40 border duration-[35ms] ease-linear bg-transparent focus:outline focus:outline-2 border-[#1E1E1F] text-[#1E1E1F] placeholder-[#1E1E1F]"
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
            className="border h-40 w-40 rounded-full border-[#1E1E1F] "
            id="getClientLocation"
            onClick={getClientLocation}
          ></button>
        </div>
        <button
          className="rounded-[2.5rem] w-1/3 text-center text-6xl font-cousine h-40 border bg-transparent duration-500 ease-out shadow-[-10px,10px,0px,0px] border-[#1E1E1F] text-[#1E1E1F] "
          type="button"
          id="submitButton"
          onClick={handleSubmissionValidation}
        >
          submit
        </button>
      </div>
      <div className="grid grid-cols-1 grid-rows-1 w-full h-[100dvh] border-dashed border-l-2 border-[#1E1E1F]">
        {mapVisible ? (
          <div className="grid grid-rows-[10%,60%,30%] h-full w-full place-items-center">
            <div className="mt-48 flex gap-x-6 place-items-center">
              {placeList.map((place, index) => (
                <>
                  <button
                    className={`tabButton mt-8 h-6 w-8 bg-[#1E1E1F] duration-[350ms] ease-in rounded-full ${
                      currentTabNumber === index ? "bg-[#ffefd7]" : null
                    }`}
                    type="button"
                    id={`${index}`}
                    value={placeList.indexOf(place)}
                    onClick={(event) => {
                      setCurrentTabNumber(parseInt(event.currentTarget.value));
                    }}
                  ></button>
                </>
              ))}
            </div>
            <iframe
              className="mt-auto w-[70%] h-[80%] rounded-xl border-2 border-[#1E1E1F] row-span"
              id="map-embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}
              &q=place_id:${currentPlace?.id}`}
            />
            <div className="pt-10 mb-auto">
              <div className="font-cousine text-center text-4xl text-[#1E1E1F] whitespace-break-spaces">
                {currentPlace?.name}
              </div>
              <div className="font-cousine text-[#1E1E1F] text-center">
                {currentPlace?.formattedAddress}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
