import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import MathJax from 'react-mathjax';
import axios from 'axios';
import CountDown from 'react-countdown';

const TestPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const[questions, setQuestions] = useState([]);
    const [startTime, setStartTime] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [previousQuestionTime, setPreviousQuestionTime] = useState(null);
    const [submit, setSubmit] = useState(false);
    const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState(null);
    const [loading, setLoading] = useState(true); 
    
    const queryParams = new URLSearchParams(location.search);
    const totalTime = parseInt(queryParams.get('totalTime'));
    const name = queryParams.get('userName');
    const questionIds = Array.from(queryParams.keys()).filter(key => key.startsWith('questionIds')).map(key => queryParams.get(key));
    const [timeSpentOnQuestions, setTimeSpentOnQuestions] = useState(Array(questionIds.length).fill(0));
    // console.log(questionIds);

    useEffect(()=>{
        setStartTime(new Date().getTime());
        const fetchedQuestions = async() => {
            try{
                const fetchedQuestions = []
                // console.log(questionIds);
                for(const questionId of questionIds){
                    console.log(questionId);
                    const response = await axios.get(
                        `https://0h8nti4f08.execute-api.ap-northeast-1.amazonaws.com/getQuestionDetails/getquestiondetails?QuestionID=${questionId}`
                    )
                    console.log(response.data[0].Question);
                    fetchedQuestions.push(response.data[0].Question);
                    console.log('here1', fetchedQuestions);
                    setQuestions(fetchedQuestions);
                    setLoading(false); 
                    console.log('here2');
                }
            }catch(err){
                console.log(err);
            }
        };

        fetchedQuestions();
    },[])

    const handleNextQuestion = () => {
        console.log('hhhs')
        if (currentQuestionStartTime) {
            console.log("heheh")
            const timeSpent = (new Date().getTime() - currentQuestionStartTime) / 1000; 
            setTimeSpentOnQuestions(prevTimeSpent => {
                const updatedTimeSpent = [...prevTimeSpent];
                updatedTimeSpent[currentQuestionIndex] += timeSpent;
                return updatedTimeSpent;
            });
            setPreviousQuestionTime(timeSpent);
        }

        setCurrentQuestionIndex(prevIndex => {
            const nextIndex = Math.min(prevIndex + 1, questions.length - 1);
            setCurrentQuestionStartTime(new Date().getTime());
            return nextIndex;
        });
        
    };


    const handlePreviousQuestion = () => {

        if (currentQuestionStartTime) {
            const timeSpent = (new Date().getTime() - currentQuestionStartTime) / 1000;
            setTimeSpentOnQuestions(prevTimeSpent => {
                const updatedTimeSpent = [...prevTimeSpent];
                updatedTimeSpent[currentQuestionIndex] += timeSpent;
                return updatedTimeSpent;
            });
            setPreviousQuestionTime(timeSpent);
        }

        setCurrentQuestionIndex(prevIndex => {
            const prevIndexClamped = Math.max(prevIndex - 1, 0);
            setCurrentQuestionStartTime(new Date().getTime());
            return prevIndexClamped;
        });
    };

    const handleSubmit1 = () => {
        setSubmit(true);
        console.log(currentQuestionStartTime);
        handleSubmit();
    }
    const handleSubmit = () => {
        console.log(currentQuestionStartTime);
        if (currentQuestionStartTime) {
            const timeSpent = (new Date().getTime() - currentQuestionStartTime) / 1000; 
            setTimeSpentOnQuestions(prevTimeSpent => {
                const updatedTimeSpent = [...prevTimeSpent];
                updatedTimeSpent[currentQuestionIndex] += timeSpent;
                return updatedTimeSpent;
            });
            setPreviousQuestionTime(timeSpent);
        }
        console.log('Time spent on each question:', timeSpentOnQuestions);
    };



    const renderer = ({hours, minutes, seconds}) =>{
        // console.log("renderer called")
        const remainingTime = Math.max(0, targetTime - new Date().getTime());
        const remainingMinutes = Math.floor((remainingTime / 1000) / 60);
        const remainingSeconds = Math.floor((remainingTime / 1000) % 60);

        return (
            <div>
            Total Time Remaining: {remainingMinutes} minutes {remainingSeconds} seconds
          </div>
        );
    }

    const targetTime = useMemo(() => startTime + totalTime * 60 * 1000, [startTime, totalTime]); 
    return(
        <>
         {loading ? <p>loading...</p> :
          <div>
          {submit === false? <div>
              <h2>Test Page</h2>
              <CountDown key={targetTime} date={targetTime} renderer={renderer} />
              {questions[currentQuestionIndex] && (
                  <div>
                      <MathJax.Provider>
                          {console.log(questions[currentQuestionIndex])}
                          <MathJax.Node formula={questions[currentQuestionIndex]} />
                      </MathJax.Provider>
                  </div>
              )}
              {currentQuestionIndex > 0 && <button onClick={handlePreviousQuestion}>Previous Question</button>}
              {currentQuestionIndex < questions.length && <button onClick={handleNextQuestion}>Next Question</button>}
              <br/>

              <button onClick={handleSubmit1}>Submit Test</button>
          </div> :  <div>
              <h1>Submit Details: {name}</h1>
              <h3>Time spent on each question:</h3>
                  <ul>
                      {timeSpentOnQuestions.map((timeSpent, index) => (
                          <li key={index}>
                              Question {questionIds[index]}: {timeSpent.toFixed(2)} seconds
                          </li>
                      ))}
                  </ul>
                  <h3>Total Time Taken: </h3>
                  {timeSpentOnQuestions.reduce((acc, curr) =>{
                       acc = acc+curr;
                      return acc
                  },0)} seconds
              </div> 
          }
  
      </div> }
         
        </>
    )


};

export default TestPage;
