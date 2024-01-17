import { ChangeEvent, useState, FormEvent } from "react";
import fetch from "node-fetch";

function App() {
  const [count, setCount] = useState(0);
  const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");

  let buttonClick = () => {
    console.log("Button was clicked " + "Count is " + count);
    setCount(count + 1);
  };
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

  async function callAdvice() {
    const response = await fetch("https://api.adviceslip.com/advice");
    const data = await response.json;
    //const advice = data.slip.
    console.log(data);
  }
  return (
    <div id="modal">
      <div id="content">
        <h1>Hunger</h1>
        <p>{submittedAddress}</p>
        <form onSubmit={callAdvice}>
          <input
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
            className="submit"
          />
        </form>
      </div>
    </div>
  );
}

export default App;
