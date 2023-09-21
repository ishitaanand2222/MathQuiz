import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [name, setName] = useState('');
  const [questionIds, setQuestionIds] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

 const navigate = useNavigate(); 

  const handleCheckboxChange = (event) => {
    const id = event.target.value;
    setQuestionIds(prevIds => {
        console.log('coming')
        if(prevIds.includes(id)){
            const a = prevIds.filter((prevId) => prevId !== id);
            console.log(a);
            setTotalTime(a.length * 5);
            return a;
        }else{
            const a =  [...prevIds, id];
            console.log(a);
            setTotalTime(a.length * 5);
            return a;
        }
    })
  }

  const handleStartTest = () => {
    if(questionIds.length === 0){
      return alert('Cannot Start the test, Pick one question type atleast')
    }
    const queryParams = new URLSearchParams();
    queryParams.append('totalTime', totalTime);
    queryParams.append('userName', name);
    questionIds.forEach((id, index) => {
      queryParams.append(`questionIds[${index}]`, id);
    });

    navigate(`/test?${queryParams.toString()}`);
  }

  const questionId = ['AreaUnderTheCurve_21',
                      'BinomialTheorem_13',
                      'BinomialTheorem_24',
                      'AreaUnderTheCurve_15', 
                      'AreaUnderTheCurve_2',
                      'BinomialTheorem_3',
                      ' BinomialTheorem_4',
                      'AreaUnderTheCurve_5']

  return (
    <div>
      <h1>Mathematics Test</h1>
      <label htmlFor="name">Name:</label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <h2>Select Questions for the Test:</h2>
      {questionId.map((quest,index) => {
        return (
            <div key={index}>
                <input 
                   type="checkbox"
                   id={`checkbox${index}`} 
                   value={quest}
                   onChange={handleCheckboxChange}
                />
                <label htmlFor={`checkbox${index}`}>{quest}</label>
            </div>
        )
      })}
      <p>Total Time for the Test: {totalTime} minutes</p>
      <button onClick={handleStartTest}>Start Test</button>
    </div>
  );
};

export default LandingPage;
