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
      const result = await fetch("https://api.adviceslip.com/advice", )
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
  

  // async function callAdvice() {

  // }

  return (
      <div className='card card-compact w-1/2 center' id="content">
        <h1 className='card-title justify-center'>Hunger</h1>
        <p className='card-body text-center'>{submittedAddress}</p>
        <p className='card-body text-center font-bold'>{advice}</p>
        <form className='card-body' onSubmit={submitAddress}>
          <input
            className='input outline'
            type="text"
            id="address"
            value={address}
            placeholder="Zip or Address"
            onChange={getAddress}
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
