import { ChangeEvent, useRef, useState } from "react";

function App() {
  const [inputAddress, setInputAddress] = useState("");
  const [returnedFormattedAddress, setReturnedAddress] = useState("");
  const [returnedLatitude, setReturnedLatitude] = useState("");
  const [returnedLongitude, setReturnedLongitude] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const apiKey = import.meta.env.VITE_MAPBOX_KEY;

  //updates submittedAddress useState as user is typing
  function handleInputUpdate(event: ChangeEvent<HTMLInputElement>) {
    setInputAddress(event.currentTarget.value);
  }

  //used on address submission, sends current state of input onSubmit to google address validation API
  async function handleAddressSubmission() {
    const submittedAddress = inputRef.current?.value;
    setInputAddress("");
    const mapBoxEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${submittedAddress}.json?country=us&proximity=ip&access_token=${apiKey}`;

    console.log(submittedAddress);

    await fetch(mapBoxEndpoint)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setReturnedAddress(data.features[0].place_name),
          setReturnedLatitude(data.features[0].center[1]),
          setReturnedLongitude(data.features[0].center[0]);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  return (
    <main className="flex justify-center flex-wrap pt-28" id="container">
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
        <p className="p-0 text-center">Your latitude: {returnedLatitude}</p>
        <p className="p-0 text-center">Your longitude: {returnedLongitude}</p>

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
          id="testButton"
          onClick={() => {
            if (inputRef.current?.value !== "") {
              handleAddressSubmission();
            } else {
              window.alert("Please enter a ZIP code or address");
            }
          }}
        >
          Submit
        </button>
      </div>
    </main>
  );
}

export default App;
