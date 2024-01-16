import {ChangeEvent, useState, FormEvent} from 'react'

function App() {
  const [count, setCount] = useState(0)
  const [address, setAddress] = useState("")

  let buttonClick = () => {
    console.log('Button was clicked ' + 'Count is ' +count)
    setCount(count+1);
  }
 
  function getAddress(event: ChangeEvent<HTMLInputElement>){
    setAddress(event.currentTarget.value);
  }
  
  function preventReload(event: FormEvent<HTMLFormElement>){
    event.preventDefault();
    console.log(address);
  }

  return (
    <div id='modal'>
      <div id='content'>
        <h1>Hunger</h1>
        <form onSubmit={preventReload}>
          <input type="text" id='address' placeholder="Zip or Address" onChange={getAddress}/>
          <input type="submit" id='submitButton' value='submit' className='submit'/>
        </form>
      </div>
    </div>
  )
}

export default App
