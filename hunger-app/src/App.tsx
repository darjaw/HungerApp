import { ChangeEvent, useEffect, useRef, useState } from "react";

function App() {
  const mapboxApiKey = import.meta.env.VITE_MAPBOX_KEY;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const [inputAddress, setInputAddress] = useState("");
  const [mapVisible, setMapVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [placeList, setPlaceList] = useState<Place[]>([]);
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);

  //needs to become state
  let tabNumber: number = 0;

  type Place = {
    latitude?: number;
    longitude?: number;
    id: string;
    name: string;
    rating?: number;
    formattedAddress: string;
  };

  useEffect(() => {
    if (currentPlace !== null) {
      setMapVisible(true);
    }
  }, [currentPlace]);

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
        window.alert(error.message);
      });
    return {
      latitude: returnedLatitude,
      longitude: returnedLongitude,
      id: "",
      name: "",
      formattedAddress: "",
    };
  }

  async function getPlaceList(): Promise<Place[]> {
    const placeSearchResponse: Response = await searchPlaceEndpoint();
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
      setCurrentPlace(placeList[tabNumber]);
    });
    console.log(placeList);
    return placeList;
  }

  function updateUiState() {
    setCurrentPlace(placeList[tabNumber]);
  }

  function handleTabClick(tabNumber: number) {
    changeTabNumber(tabNumber);
    updateUiState();
  }

  function changeTabNumber(newNumber: number) {
    tabNumber = newNumber;
    console.log(tabNumber);
  }

  //used to query places api, returns response
  async function searchPlaceEndpoint(): Promise<Response> {
    const addressCenter = await handleAddressSubmission();
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

    return await fetch(placesEndpoint, searchRequest).then((response) => {
      return response;
    });
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
            <div className="flex gap-x-10 place-items-center">
              <button
                className="rounded-[2.5rem] w-1/3 text-center text-6xl border-[#1E1E1F] text-[#1E1E1F]"
                type="button"
                onClick={() => handleTabClick(0)}
              >
                1
              </button>
              <button
                className="rounded-[2.5rem] w-1/3 text-center text-6xl border-[#1E1E1F] text-[#1E1E1F]"
                type="button"
                onClick={() => handleTabClick(1)}
              >
                2
              </button>
              <button
                className="rounded-[2.5rem] w-1/3 text-center text-6xl border-[#1E1E1F] text-[#1E1E1F]"
                type="button"
                onClick={() => handleTabClick(2)}
              >
                3
              </button>
              <button
                className="rounded-[2.5rem] w-1/3 text-center text-6xl border-[#1E1E1F] text-[#1E1E1F]"
                type="button"
                onClick={() => handleTabClick(3)}
              >
                4
              </button>
              <button
                className="rounded-[2.5rem] w-1/3 text-center text-6xl border-[#1E1E1F] text-[#1E1E1F]"
                type="button"
                onClick={() => handleTabClick(4)}
              >
                5
              </button>
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
              <div className="font-cousine text-center text-4xl text-[#1E1E1F]">
                {currentPlace?.name}
              </div>
              <div className="font-cousine text-[#1E1E1F]">
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
