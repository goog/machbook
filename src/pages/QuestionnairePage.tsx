import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { questionnaireApi } from '@/services/api';
import { questions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import type { QuestionnaireAnswers } from '@/types';

export function QuestionnairePage() {
  const { refreshUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = async () => {
    if (!selectedOption) return;

    const newAnswers = {
      ...answers,
      [`q${currentQ.id}`]: selectedOption,
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption('');
    } else {
      // 完成问卷，提交到服务器
      setIsSubmitting(true);
      const result = await questionnaireApi.saveAnswers(newAnswers as QuestionnaireAnswers);
      if (result.success) {
        await refreshUser(); // 刷新用户信息
        setIsCompleted(true);
      } else {
        alert('保存失败，请重试');
      }
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevAnswer = answers[`q${questions[currentQuestion - 1].id}` as keyof QuestionnaireAnswers];
      setSelectedOption(prevAnswer || '');
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <Card className="max-w-md w-full border-0 shadow-2xl bg-white/90 backdrop-blur-sm relative z-10">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              问卷已完成！
            </h2>
            <p className="text-gray-600 mb-6">
              感谢你的真诚回答。我们会根据你的答案，为你寻找最合适的人。
            </p>
            <p className="text-sm text-rose-500 mb-6">
              每周最多为你匹配 3 位心动对象
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
            >
              查看我的匹配
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8 px-4">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-lg mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">了解你的心</h1>
          <p className="text-gray-600">回答 10 个问题，让我们找到懂你的人</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>问题 {currentQuestion + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQ.question}
            </h2>

            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-3"
            >
              {currentQ.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === option.value
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-100 hover:border-rose-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedOption(option.value)}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="border-rose-400 text-rose-500"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-gray-700"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一题
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedOption || isSubmitting}
                className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
              >
                {isSubmitting ? '保存中...' : currentQuestion === questions.length - 1 ? '完成' : '下一题'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
