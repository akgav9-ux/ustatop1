import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Messages() {
  const { t, language } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'uz' ? 'Xabarlar' : 'Сообщения'}
          </h1>
        </div>
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {language === 'uz' ? 'Hozircha xabarlar yo\'q' : 'Пока нет сообщений'}
          </p>
        </div>
      </div>
    </div>
  );
}