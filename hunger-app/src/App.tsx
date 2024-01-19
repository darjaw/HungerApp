import { ChangeEvent, useState, FormEvent , useEffect} from "react";

function App() {
  const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [advice, setAdvice] = useState("")
  //calling an api for advice (just a test)
  useEffect(
    () => {
      const fetchData = async () =>
      { 
      const result = await fetch("https://api.adviceslip.com/advice", {cache: "no-cache"})
      const data = result.json().then(json => {
        // console.log(json.slip.advice)
        setAdvice(json.slip.advice);
      });
      data
    }
    fetchData();
  },[]);

  //updates address
  function getAddress(event: ChangeEvent<HTMLInputElement>) {
    setAddress(event.currentTarget.value);
  }

  //used on submission, prevents page refresh and collects current state of input onSubmit
  function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(address);
    setSubmittedAddress(address);
    setAddress("");
  }

  return (
      <div className='card card-compact h-[75vh] max-w-screen-md my-auto w-3/5 m-auto border border-solid border-secondary' id="content">
        <h1 className='card-title justify-center mt-10'>Hunger</h1>
        <p className='card-body text-center'>{submittedAddress}</p>
        <p className='card-body text-center font-bold'>{advice}</p>
        <form className='card-body mb-20 mx-12' onSubmit={submitAddress}>
          <input
            className='input outline my-9'
            type="text"
            id="address"
            value={address}
            placeholder="Zip or Address"
            onChange={getAddress}
            autoComplete="off"
          />
          <input
            type="submit"
            id="submitButton"
            value="submit"
            className='btn btn-secondary' 
           />
        </form>
      </div>
  );
}

export default App;
