import { useState, useEffect, useCallback, useRef } from 'react'
import { Vector3 } from 'three'
import { useEarthStore } from '@/stores/earthStore'
import { countriesData, CountryData } from '@/data/countries'

interface QuizQuestion {
  id: string
  type: 'capital' | 'population' | 'area' | 'continent' | 'neighbor'
  question: string
  options: string[]
  correctAnswer: string
  country: CountryData
  difficulty: 'easy' | 'medium' | 'hard'
}

function generateQuestion(): QuizQuestion {
  const countries = Object.values(countriesData)
  const randomCountry = countries[Math.floor(Math.random() * countries.length)]
  
  const questionTypes: Array<{
    type: QuizQuestion['type']
    generate: (country: CountryData) => QuizQuestion
  }> = [
    {
      type: 'capital',
      generate: (country) => {
        const wrongCapitals = countries
          .filter((c) => c.id !== country.id)
          .map((c) => c.capital)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        const options = [country.capital, ...wrongCapitals].sort(() => Math.random() - 0.5)
        return {
          id: `${country.id}-capital`,
          type: 'capital',
          question: `${country.name}的首都是哪里？`,
          options,
          correctAnswer: country.capital,
          country,
          difficulty: 'easy',
        }
      },
    },
    {
      type: 'population',
      generate: (country) => {
        const populationStr = country.population > 100000000
          ? `${(country.population / 100000000).toFixed(1)}亿`
          : `${(country.population / 10000).toFixed(0)}万`
        const wrongPopulations = ['1亿', '5000万', '2亿', '3亿', '5亿']
          .filter((p) => p !== populationStr)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        const options = [populationStr, ...wrongPopulations].sort(() => Math.random() - 0.5)
        return {
          id: `${country.id}-population`,
          type: 'population',
          question: `${country.name}的人口大约是多少？`,
          options,
          correctAnswer: populationStr,
          country,
          difficulty: 'medium',
        }
      },
    },
    {
      type: 'area',
      generate: (country) => {
        const areaStr = country.area > 1000000
          ? `${(country.area / 1000000).toFixed(0)}百万平方公里`
          : `${(country.area / 10000).toFixed(0)}万平方公里`
        const wrongAreas = ['100万平方公里', '50万平方公里', '200万平方公里', '300万平方公里']
          .filter((a) => a !== areaStr)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        const options = [areaStr, ...wrongAreas].sort(() => Math.random() - 0.5)
        return {
          id: `${country.id}-area`,
          type: 'area',
          question: `${country.name}的国土面积大约是多少？`,
          options,
          correctAnswer: areaStr,
          country,
          difficulty: 'hard',
        }
      },
    },
    {
      type: 'continent',
      generate: (country) => {
        const continents = ['亚洲', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲']
        const wrongContinents = continents
          .filter((c) => !country.continent.includes(c))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        const options = [country.continent, ...wrongContinents].sort(() => Math.random() - 0.5)
        return {
          id: `${country.id}-continent`,
          type: 'continent',
          question: `${country.name}位于哪个大洲？`,
          options,
          correctAnswer: country.continent,
          country,
          difficulty: 'easy',
        }
      },
    },
  ]
  
  const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)]
  return randomType.generate(randomCountry)
}

interface QuizPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuizPanel({ isOpen, onClose }: QuizPanelProps) {
  const { setSelectedCountry } = useEarthStore()
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [streak, setStreak] = useState(0)
  const autoNextTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const generateNewQuestion = useCallback(() => {
    // 清除可能存在的自动下一题定时器
    if (autoNextTimer.current) {
      clearTimeout(autoNextTimer.current)
      autoNextTimer.current = null
    }
    setCurrentQuestion(generateQuestion())
    setSelectedAnswer(null)
    setIsCorrect(null)
  }, [])
  
  useEffect(() => {
    if (isOpen && !currentQuestion) generateNewQuestion()
  }, [isOpen, currentQuestion, generateNewQuestion])
  
  const handleSelectAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer) return
      setSelectedAnswer(answer)
      const correct = answer === currentQuestion?.correctAnswer
      setIsCorrect(correct)
      if (correct) {
        setScore((prev) => prev + 1)
        setStreak((prev) => prev + 1)
      } else {
        setStreak(0)
      }
      setTotalQuestions((prev) => prev + 1)
      // 不再自动下一题，用户手动点击"下一题"按钮
    },
    [selectedAnswer, currentQuestion, generateNewQuestion]
  )
  
  const handleViewCountry = useCallback(() => {
    if (currentQuestion) {
      const country = currentQuestion.country
      setSelectedCountry({
        id: country.id,
        name: country.name,
        nameEn: country.nameEn,
        capital: country.capital,
        population: country.population,
        area: country.area,
        continent: country.continent,
        coordinates: new Vector3(country.coordinates.lat, country.coordinates.lon, 0),
      })
      onClose()
    }
  }, [currentQuestion, setSelectedCountry, onClose])
  
  const handleClose = useCallback(() => {
    onClose()
    setCurrentQuestion(null)
  }, [onClose])

  if (!isOpen) return null
  
  return (
    <>
      <div className="overlay" onClick={handleClose} />
      <div className="quiz-panel">
        <div className="quiz-header">
          <div className="quiz-title">地理问答</div>
          <button className="quiz-close-btn" onClick={handleClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="quiz-stats">
          <div className="quiz-stat">
            <div className="quiz-stat-label">得分</div>
            <div className="quiz-stat-value">{score}</div>
          </div>
          <div className="quiz-stat">
            <div className="quiz-stat-label">题数</div>
            <div className="quiz-stat-value">{totalQuestions}</div>
          </div>
          <div className="quiz-stat">
            <div className="quiz-stat-label">连对</div>
            <div className="quiz-stat-value">{streak}</div>
          </div>
          <div className="quiz-stat">
            <div className="quiz-stat-label">正确率</div>
            <div className="quiz-stat-value">
              {totalQuestions > 0 ? `${Math.round((score / totalQuestions) * 100)}%` : '--'}
            </div>
          </div>
        </div>
        
        {currentQuestion && (
          <div className="quiz-content">
            <div className="quiz-difficulty">
              <span className={`difficulty-${currentQuestion.difficulty}`}>
                {currentQuestion.difficulty === 'easy' ? '简单' : currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
              </span>
            </div>
            
            <div className="quiz-question">{currentQuestion.question}</div>
            
            <div className="quiz-options">
              {currentQuestion.options.map((option, index) => {
                let cls = 'quiz-option'
                if (selectedAnswer) {
                  if (option === currentQuestion.correctAnswer) cls += ' correct'
                  else if (option === selectedAnswer) cls += ' wrong'
                }
                return (
                  <button
                    key={index}
                    className={cls}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={!!selectedAnswer}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            
            {selectedAnswer && (
              <div className={`quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
                <span>{isCorrect ? '回答正确' : '回答错误'}</span>
                <button className="quiz-view-btn" onClick={handleViewCountry}>
                  查看{currentQuestion.country.name}
                </button>
              </div>
            )}
            
            <button className="quiz-next-btn" onClick={generateNewQuestion}>
              下一题
            </button>
          </div>
        )}
      </div>
    </>
  )
}
