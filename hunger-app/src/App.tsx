import { ChangeEvent, useRef, useState } from "react";

function App() {
  const [inputAddress, setInputAddress] = useState("");
  const [returnedFormattedAddress, setReturnedAddress] = useState("");
  const [returnedLatitude, setReturnedLatitude] = useState("");
  const [returnedLongitude, setReturnedLongitude] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const apiKey = import.meta.env.VITE_MAPS_KEY;

  //updates submittedAddress useState as user is typing
  function handleInputUpdate(event: ChangeEvent<HTMLInputElement>) {
    setInputAddress(event.currentTarget.value);
  }

  //used on address submission, sends current state of input onSubmit to google address validation API
  async function handleAddressSubmission() {
    let submittedAddress = inputRef.current?.value;
    setInputAddress("");
    const apiEndpoint =
      "https://addressvalidation.googleapis.com/v1:validateAddress?key=" +
      apiKey;

    if (
      submittedAddress?.includes(",USA") === false ||
      submittedAddress?.includes(", USA") === false
    ) {
      submittedAddress = submittedAddress + ", USA";
    }

    const apiRequest = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: { addressLines: [submittedAddress] } }),
    };

    console.log(submittedAddress);
    await fetch(apiEndpoint, apiRequest)
      .then((response) => response.json())
      .then((data) => {
        console.log(data),
          setReturnedAddress(data.result.address.formattedAddress),
          setReturnedLatitude(data.result.geocode.location.latitude),
          setReturnedLongitude(data.result.geocode.location.longitude);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  return (
    <div
      className="card card-compact mt-28 max-w-screen-md w-3/5 m-auto border border-solid border-secondary"
      id="content"
    >
      <h1 className="card-title rounded-tl-2xl font-bold font-rethinkSans text-[#1d202d] text-5xl p-5 rounded-tr-2xl justify-center bg-[#eca700]">
        Hunger
      </h1>
      <p className="pb-4 text-center">
        Your formatted address: {returnedFormattedAddress}
      </p>
      <p className="p-0 text-center">Your latitude: {returnedLatitude}</p>
      <p className="p-0 text-center">Your longitude: {returnedLongitude}</p>
      <input
        className="self-center input w-2/3 outline my-8"
        type="text"
        id="address"
        ref={inputRef}
        value={inputAddress}
        placeholder="Zip or Address"
        onChange={handleInputUpdate}
        autoComplete="off"
      />
      <button
        className="btn no-animation place-self-end bg-[#e92727] hover:bg-[#9c1a1a] active:bg-[#4f0d0d] transition-all rounded-bl-2xl rounded-br-2xl rounded-tl-none rounded-tr-none w-full"
        type="button"
        id="testButton"
        onClick={() => {
          if (inputRef.current?.value !== "") {
            handleAddressSubmission();
          } else {
            window.alert("Empty address, could not submit request");
          }
        }}
      >
        Submit
      </button>
    </div>
  );
}

export default App;
