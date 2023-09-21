import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import MathJax from 'react-mathjax';
import axios from 'axios';
import CountDown from 'react-countdown';
import './TestPage.css';


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

    useEffect(()=>{
        setStartTime(new Date().getTime());
        const fetchedQuestions = async() => {
            try{
                const fetchedQuestions = []
                for(const questionId of questionIds){
                    const response = await axios.get(
                        `https://0h8nti4f08.execute-api.ap-northeast-1.amazonaws.com/getQuestionDetails/getquestiondetails?QuestionID=${questionId}`
                    )
                    fetchedQuestions.push(response.data[0].Question);
                    setQuestions(fetchedQuestions);
                    setLoading(false); 
                }
            }catch(err){
                console.log(err);
            }
        };

        fetchedQuestions();
    },[])

    const handleNextQuestion = () => {
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
        handleSubmit();
    }
    const handleSubmit = () => {
        if (currentQuestionStartTime) {
            const timeSpent = (new Date().getTime() - currentQuestionStartTime) / 1000; 
            setTimeSpentOnQuestions(prevTimeSpent => {
                const updatedTimeSpent = [...prevTimeSpent];
                updatedTimeSpent[currentQuestionIndex] += timeSpent;
                return updatedTimeSpent;
            });
            setPreviousQuestionTime(timeSpent);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    }


    const renderer = ({hours, minutes, seconds}) =>{
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
              <div className="countdown">
                <CountDown key={targetTime} date={targetTime} renderer={renderer} />
              </div>
              {questions[currentQuestionIndex] && (
                  <div className="mathjax-output">
                      <MathJax.Provider>
                          <MathJax.Node formula={questions[currentQuestionIndex]} />
                      </MathJax.Provider>
                  </div>
              )}
              <div className="navigation-buttons">
                {currentQuestionIndex > 0 && <button onClick={handlePreviousQuestion}>Previous Question</button>}
                {currentQuestionIndex < questions.length && <button onClick={handleNextQuestion}>Next Question</button>}
              </div>
              <br/>

              <button className="submit-button" onClick={handleSubmit1}>Submit Test</button>
          </div> :  <div  className="submit-details">
              <h1>Submit Details: {name}</h1>
              <h3>Time spent on each question:</h3>
                  <ul>
                      {timeSpentOnQuestions.map((timeSpent, index) => (
                          <li key={index}>
                              Question {questionIds[index]}:<strong> {timeSpent.toFixed(2)}</strong> seconds
                          </li>
                      ))}
                  </ul>
                  <h3>Total Time Taken: </h3>
                  <strong>{timeSpentOnQuestions.reduce((acc, curr) =>{
                       acc = acc+curr;
                      return acc
                  },0)}</strong> seconds
                  <br/>
                  <button onClick={handleBackToHome}>Home Page</button>
              </div> 
          }
  
      </div> }
         
        </>
    )


};

export default TestPage;
