import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { categories, regions } from '../data';
import { ArrowLeft } from 'lucide-react';

export default function CreateJob() {
  const { t, language, isLoggedIn, user, selectedRegion, setSelectedRegion, selectedDistrict, setSelectedDistrict } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [area, setArea] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentRegion = regions.find(r => r.id === selectedRegion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim() && category && budget) {
      setLoading(true);

      // Создаём объект заказа
      const newJob = {
        id: 'job_' + Date.now(),
        titleUz: title,
        titleRu: title,
        descriptionUz: description,
        descriptionRu: description,
        budget: parseInt(budget) || 0,
        category: category,
        region: selectedRegion,
        district: selectedDistrict,
        area: area ? parseInt(area) : undefined,
        deadline: deadline || undefined,
        createdAt: new Date().toISOString(),
        responses: 0,
        images: [],
        status: 'open',
        authorId: user?.id || 'unknown',
        authorName: user?.name || 'Пользователь',
      };

      console.log('Сохраняем заказ:', newJob);

      // Сохраняем в ОБЩЕЕ хранилище all_jobs (видят все пользователи)
      const existingJobs = JSON.parse(localStorage.getItem('all_jobs') || '[]');
      existingJobs.unshift(newJob);
      localStorage.setItem('all_jobs', JSON.stringify(existingJobs));

      // Проверяем, что сохранилось
      const saved = localStorage.getItem('all_jobs');
      console.log('Сохранённые заказы:', saved);

      setTimeout(() => {
        setLoading(false);
        navigate('/jobs');
      }, 500);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'uz' ? 'Tizimga kiring' : 'Войдите в систему'}
          </h2>
          <p className="text-gray-500 mb-6">
            {language === 'uz' ? 'Buyurtma yaratish uchun tizimga kiring' : 'Войдите, чтобы создать заявку'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('back')}
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('createJob')}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('jobTitle')} *
              </label>
              <input
                type="text"
                placeholder={t('jobTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')} *
              </label>
              <textarea
                placeholder={t('descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('selectCategory')} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'uz' ? cat.nameUz : cat.nameRu}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('selectRegion')} *
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    const region = regions.find(r => r.id === e.target.value);
                    if (region) setSelectedDistrict(region.districts[0].id);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {language === 'uz' ? region.nameUz : region.nameRu}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('selectDistrict')} *
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {currentRegion?.districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {language === 'uz' ? district.nameUz : district.nameRu}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('budget')} ({t('sum')}) *
              </label>
              <input
                type="number"
                placeholder={t('budgetPlaceholder')}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('areaLabel')} ({t('sqm')})
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('deadline')}
                </label>
                <input
                  type="text"
                  placeholder={language === 'uz' ? 'Masalan: 1-2 hafta' : 'Например: 1-2 недели'}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim() || !category || !budget}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? t('loading') : t('create')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}