import { ChangeEvent, useState, FormEvent, useEffect } from "react";

function App() {
  //const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [fetchAddress, setFetchAddress] = useState("");
  const [advice, setAdvice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const apiKey = import.meta.env.VITE_MAPS_KEY;

  //calling an api for advice (just a test)
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch("https://api.adviceslip.com/advice", {
        cache: "no-cache",
      });
      const data = result.json().then((json) => {
        // console.log(json.slip.advice)
        setAdvice(json.slip.advice);
      });
      data;
    };
    fetchData();
  }, []);

  //updates address
  function updateAddress(event: ChangeEvent<HTMLInputElement>) {
    setSubmittedAddress(event.currentTarget.value);
  }

  //used on submission, prevents page refresh and collects current state of input onSubmit
  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(submittedAddress);
    //setSubmittedAddress(address);
    // setAddress("");

    fetch(
      "https://addressvalidation.googleapis.com/v1:validateAddress?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: { addressLines: [submittedAddress] } }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data),
          setFetchAddress(data.result.address.formattedAddress),
          setLatitude(data.result.geocode.location.latitude),
          setLongitude(data.result.geocode.location.longitude);
      });

    setSubmittedAddress("");
  }

  return (
    <div className="card card-compact w-1/2 center" id="content">
      <h1 className="card-title justify-center">Hunger</h1>
      <p className="card-body text-center">
        Your formatted address: {fetchAddress}
      </p>
      <p className="card-body text-center">Your latitude: {latitude}</p>
      <p className="card-body text-center">Your longitude: {longitude}</p>
      <p className="card-body text-center font-bold">{advice}</p>
      <form className="card-body" onSubmit={submitAddress}>
        <input
          className="input outline"
          type="text"
          id="address"
          value={submittedAddress}
          placeholder="Zip or Address"
          onChange={updateAddress}
        />
        <input
          type="submit"
          id="submitButton"
          value="submit"
          className="btn btn-secondary"
        />
      </form>
    </div>
  );
}

export default App;
