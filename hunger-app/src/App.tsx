import {ChangeEvent, useState} from 'react'

function App() {
  const [count, setCount] = useState(0)
  const [address, setAddress] = useState("")

  let buttonClick = () => {
    console.log('Button was clicked ' + 'Count is ' +count)
    setCount(count+1);
  }
 
  function getData(event: ChangeEvent<HTMLInputElement>){
    setAddress(event.target.value)
    console.log(event.target.value)
  }

  return (
    <div id='modal'>
      <div id='content'>
        <h1>Hunger</h1>
        {/* <input type="text" id='address' placeholder="Zip or Address" onChange={getData} /> */}
        <input type="submit" id='submitButton' value='submit' className='submit'/>
      </div>
    </div>
  )
}

export default App
