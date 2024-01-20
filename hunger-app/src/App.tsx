import { ChangeEvent, useState, FormEvent, useEffect } from "react";

function App() {
  //const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [fetchAddress, setFetchAddress] = useState("");
  const [advice, setAdvice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const apiKey = "AIzaSyABISqSmSD1EjzYxxSmWQqEMY6gENLjYdA";


  //calling an api for advice (just a test)
  useEffect(
    () => {
      const fetchData = async () =>
      { 
      const result = await fetch("https://api.adviceslip.com/advice", {cache: "no-cache"})
      const data = result.json().then(json => {
        setAdvice(json.slip.advice);
      });
      data;
    };
    fetchData();
  },[]);

  
  //(test function) calling httpbin post test endpoint onClick of testButton, console logs json object
  async function sendTestCall() {
    const postURL = 'https://httpbin.org/post'
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': "application/json"},
      body:''
    }
    await fetch(postURL, requestOptions)
      .then(response => response.json()
      .then(data => console.log(data)))
      .catch(error => {
        console.warn('[ERROR] ' +postURL +' : ' + error.message)
        setSubmittedAddress('ERROR')
      })
  }

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
      <div className='card card-compact h-[75vh] mt-28 max-w-screen-md w-3/5 m-auto border border-solid border-secondary' id="content">
        <h1 className='card-title justify-center mt-10'>Hunger</h1>
        <p className="card-body text-center">
        Your formatted address: {fetchAddress}
      </p>
      <p className="card-body text-center">Your latitude: {latitude}</p>
      <p className="card-body text-center">Your longitude: {longitude}</p>
        <p className='card-body text-center font-bold'>{advice}</p>
        <form className='card-body mx-12' onSubmit={submitAddress}>
          <input
            className='input outline my-9'
            type="text"
            id="address"
            value={submittedAddress}
            placeholder="Zip or Address"
            onChange={updateAddress}
            autoComplete="off"
          />
          <input
            type="submit"
            id="submitButton"
            value="submit" 
            className='btn btn-secondary'
           />
        </form>
        <button className='btn no-animation btn-warning rounded-bl-xl rounded-br-xl rounded-tl-none rounded-tr-none w-full' type='button' id='testButton' onClick={sendTestCall}>A Button for Testing</button>
      </div>
  );
}

export default App;
