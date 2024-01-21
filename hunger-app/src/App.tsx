import { ChangeEvent, useState } from "react";

function App() {
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [returnedFormattedAddress, setReturnedAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const apiKey = import.meta.env.VITE_MAPS_KEY;

  //updates submittedAddress useState as user is typing
  function handleInputUpdate(event: ChangeEvent<HTMLInputElement>) {
    setSubmittedAddress(event.currentTarget.value);
    console.log(submittedAddress);
  }

  //used on address submission, sends current state of input onSubmit to google address validation API
  async function handleAddressSubmission() {
    const apiEndpoint =
      "https://addressvalidation.googleapis.com/v1:validateAddress?key=" +
      apiKey;
    const apiRequest = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: { addressLines: [submittedAddress] } }),
    };
    if (!submittedAddress.includes(",USA")) {
      setSubmittedAddress(submittedAddress + ",USA");
    }
    console.log(submittedAddress);
    fetch(apiEndpoint, apiRequest)
      .then((response) => response.json())
      .then((data) => {
        console.log(data),
          setReturnedAddress(data.result.address.formattedAddress),
          setLatitude(data.result.geocode.location.latitude),
          setLongitude(data.result.geocode.location.longitude);
      });

    setSubmittedAddress("");
  }

  return (
    <div
      className="card card-compact mt-28 max-w-screen-md w-3/5 m-auto border border-solid border-secondary"
      id="content"
    >
      <h1 className="card-title rounded-tl-2xl font-bold font-rethinkSans text-[#1d202d] text-5xl p-5 rounded-tr-2xl justify-center bg-[#eca700]">
        Hunger
      </h1>
      <p className="card-body text-center">
        Your formatted address: {returnedFormattedAddress}
      </p>
      <p className="card-body text-center">Your latitude: {latitude}</p>
      <p className="card-body text-center">Your longitude: {longitude}</p>
      <input
        className="card-body self-center input w-2/3 outline my-9"
        type="text"
        id="address"
        value={submittedAddress}
        placeholder="Zip or Address"
        onChange={handleInputUpdate}
        autoComplete="off"
      />
      <button
        className="btn no-animation place-self-end bg-[#e92727] hover:bg-[#9c1a1a] active:bg-[#4f0d0d] transition-all rounded-bl-2xl rounded-br-2xl rounded-tl-none rounded-tr-none w-full"
        type="button"
        id="testButton"
        onClick={() => {
          if (submittedAddress !== "") handleAddressSubmission();
        }}
      >
        Submit
      </button>
    </div>
  );
}

export default App;
