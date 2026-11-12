import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Phone, MapPin, Star, Briefcase, CheckCircle, Edit2, Settings, LogOut, Heart, MessageCircle, Clock, Camera, X, Plus, Edit3, Trash2 } from 'lucide-react';
import { regions, categories } from '../data';
import { supabase } from '../lib/supabaseClient';

// Компонент для загрузки аватара
function AvatarUpload({ currentAvatar, onAvatarChange, size = 120 }: { 
  currentAvatar?: string; 
  onAvatarChange: (avatarUrl: string) => void; 
  size?: number;
}) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { t } = useApp();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('onlyImages') || 'Только изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('maxSize') || 'Файл не более 5MB');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      const maxDimension = 640;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        alert(t('error') || 'Не удалось обработать изображение');
        return;
      }
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (!blob) {
          alert(t('error') || 'Не удалось обработать изображение');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreview(result);
          onAvatarChange(result);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.82);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      alert(t('error') || 'Не удалось открыть изображение');
    };
    image.src = imageUrl;
  };

  const handleRemove = () => {
    setPreview(null);
    onAvatarChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={t('avatarTip') || 'Change profile photo'}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-4 focus:ring-blue-200"
        style={{ width: size, height: size }}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-5xl font-bold">
            {currentAvatar ? '?' : '📷'}
          </span>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-8 h-8 text-white" />
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {preview && (
        <button
          onClick={handleRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function Profile() {
  const { t, language, user, setUser, setIsLoggedIn, isLoggedIn } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [aboutUz, setAboutUz] = useState('');
  const [aboutRu, setAboutRu] = useState('');
  const [experience, setExperience] = useState(0);
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<{ index: number; nameUz: string; nameRu: string; price: number } | null>(null);
  const [newService, setNewService] = useState({ nameUz: '', nameRu: '', price: 0 });
  const navigate = useNavigate();

  // Загружаем данные пользователя из Supabase
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    loadUserProfile();
  }, [user?.id, isLoggedIn]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const { data, error: loadError } = await supabase
        .from('users')
        .select('id, name, phone, avatar_url, about_uz, about_ru, experience, services, is_verified, role, region, district, rating, jobs_completed, favorites_count')
        .eq('id', user.id)
        .single();

      if (loadError) {
        console.error('Ошибка загрузки профиля:', loadError);
      } else if (data) {
        setName(data.name || user.name || '');
        setPhone(data.phone || user.phone || '');
        setRegion(data.region || '');
        setDistrict(data.district || '');
        const savedCategory = categories.find(item => item.id === data.category || item.nameUz === data.category || item.nameRu === data.category);
        setCategory(savedCategory?.id || '');
        setAvatar(data.avatar_url || user.avatar || '');
        setAboutUz(data.about_uz || '');
        setAboutRu(data.about_ru || '');
        setExperience(data.experience || 0);
        setServices(data.services || []);
        
        setUser({
          ...user,
          name: data.name || user.name,
          phone: data.phone || user.phone,
          avatar: data.avatar_url || user.avatar,
          aboutUz: data.about_uz,
          aboutRu: data.about_ru,
          experience: data.experience,
          services: data.services || [],
          isVerified: data.is_verified,
          role: data.role,
          region: data.region,
          district: data.district,
        });
      }
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setAvatar(avatarUrl);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      setProfileError(language === 'uz' ? 'Ismni kiriting.' : 'Введите имя.');
      return;
    }
    if (phone && !/^\+998[0-9]{9}$/.test(phone)) {
      setProfileError(language === 'uz' ? 'Telefon +998XXXXXXXXX formatida bo‘lishi kerak.' : 'Телефон должен быть в формате +998XXXXXXXXX.');
      return;
    }
    if (user.role === 'master' && region && !regions.find(item => item.id === region)?.districts.some(item => item.id === district)) {
      setProfileError(language === 'uz' ? 'Hudud va tumanni to‘g‘ri tanlang.' : 'Выберите корректный регион и район.');
      return;
    }
    setSaving(true);
    setProfileError('');

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          phone: phone,
          avatar_url: avatar,
          about_uz: aboutUz,
          about_ru: aboutRu,
          experience: experience,
          services: services,
          ...(user.role === 'master' ? { region, district, category } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Ошибка сохранения:', updateError);
        setProfileError(language === 'uz' ? 'Profilni saqlab bo‘lmadi. Qayta urinib ko‘ring.' : 'Не удалось сохранить профиль. Попробуйте ещё раз.');
        setSaving(false);
        return;
      }

      setUser({ 
        ...user, 
        name: name.trim(), 
        avatar,
        phone,
        aboutUz, 
        aboutRu, 
        experience,
        services,
        region: user.role === 'master' ? region : user.region,
        district: user.role === 'master' ? district : user.district,
        category: user.role === 'master' ? category : user.category,
      });
      
      setEditMode(false);
      setSaving(false);
      alert(language === 'uz' ? 'Profil yangilandi.' : 'Профиль обновлён.');
    } catch (err) {
      console.error('Ошибка:', err);
      setProfileError(language === 'uz' ? 'Saqlashda xatolik yuz berdi.' : 'Произошла ошибка при сохранении.');
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/');
  };

  const addService = async () => {
    if (newService.nameUz && newService.nameRu && newService.price > 0) {
      const updatedServices = [...services, { ...newService }];
      
      if (user) {
        const { error: serviceError } = await supabase
          .from('users')
          .update({ services: updatedServices })
          .eq('id', user.id);
        
        if (serviceError) {
          console.error('Ошибка сохранения услуги:', serviceError);
          alert('Ошибка сохранения услуги');
          return;
        }
      }
      
      setServices(updatedServices);
      setUser({ ...user, services: updatedServices } as any);
      setNewService({ nameUz: '', nameRu: '', price: 0 });
      setShowServiceModal(false);
    }
  };

  const editService = (index: number) => {
    const service = services[index];
    setEditingService({ index, ...service });
    setShowServiceModal(true);
  };

  const updateService = async () => {
    if (editingService) {
      const updatedServices = [...services];
      updatedServices[editingService.index] = {
        nameUz: editingService.nameUz,
        nameRu: editingService.nameRu,
        price: editingService.price,
      };
      
      if (user) {
        const { error: serviceError } = await supabase
          .from('users')
          .update({ services: updatedServices })
          .eq('id', user.id);
        
        if (serviceError) {
          console.error('Ошибка сохранения услуги:', serviceError);
          alert('Ошибка сохранения услуги');
          return;
        }
      }
      
      setServices(updatedServices);
      setUser({ ...user, services: updatedServices } as any);
      setEditingService(null);
      setShowServiceModal(false);
    }
  };

  const deleteService = async (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    
    if (user) {
      const { error: serviceError } = await supabase
        .from('users')
        .update({ services: updatedServices })
        .eq('id', user.id);
      
      if (serviceError) {
        console.error('Ошибка удаления услуги:', serviceError);
        alert('Ошибка удаления услуги');
        return;
      }
    }
    
    setServices(updatedServices);
    setUser({ ...user, services: updatedServices } as any);
  };

  const currentRegion = regions.find(r => r.id === (region || user?.region));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'uz' ? 'Tizimga kiring' : 'Войдите в систему'}
          </h2>
          <p className="text-gray-500 mb-6">
            {language === 'uz' ? 'Profilni ko\'rish uchun tizimga kiring' : 'Войдите, чтобы увидеть профиль'}
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Profile Header */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <AvatarUpload
                  currentAvatar={avatar || user.avatar}
                  onAvatarChange={handleAvatarChange}
                  size={120}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{name || user.name}</h1>
                  {user.isVerified && <CheckCircle className="w-6 h-6 text-blue-500" />}
                </div>
                <div className="flex items-center gap-4 text-gray-500 mt-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {phone || user.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {language === 'uz' ? currentRegion?.nameUz : currentRegion?.nameRu}
                  </span>
                </div>
                <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-medium ${
                  user.role === 'master'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {user.role === 'master' ? t('asMaster') : t('asCustomer')}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('editProfile')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {user.role === 'master' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{user.rating != null ? Number(user.rating).toFixed(1) : '—'}</p>
              <p className="text-sm text-gray-500">{t('rating')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{user.jobsCompleted ?? '—'}</p>
              <p className="text-sm text-gray-500">{t('completedJobs')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{experience || user.experience || 0}</p>
              <p className="text-sm text-gray-500">{t('experience')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{user.favoritesCount ?? '—'}</p>
              <p className="text-sm text-gray-500">{t('favorites')}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('aboutMe')}</h2>
              {editMode ? (
                <div className="space-y-4">
                  {profileError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{profileError}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {user.role === 'master' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('aboutMe')} (UZ)
                        </label>
                        <textarea
                          value={aboutUz}
                          onChange={(e) => setAboutUz(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('aboutMe')} (RU)
                        </label>
                        <textarea
                          value={aboutRu}
                          onChange={(e) => setAboutRu(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('experience')} ({t('years')})
                        </label>
                        <input
                          type="number"
                          value={experience}
                          onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{language === 'uz' ? 'Asosiy xizmat yo‘nalishi' : 'Основная категория услуг'}</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="">{language === 'uz' ? 'Yo‘nalishni tanlang' : 'Выберите категорию'}</option>
                          {categories.map(item => <option key={item.id} value={item.id}>{language === 'uz' ? item.nameUz : item.nameRu}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{language === 'uz' ? 'Hudud' : 'Регион'}</label>
                        <select
                          value={region}
                          onChange={(e) => {
                            const nextRegion = regions.find(item => item.id === e.target.value);
                            setRegion(e.target.value);
                            setDistrict(nextRegion?.districts[0]?.id || '');
                          }}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="">{language === 'uz' ? 'Hududni tanlang' : 'Выберите регион'}</option>
                          {regions.map(item => <option key={item.id} value={item.id}>{language === 'uz' ? item.nameUz : item.nameRu}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{language === 'uz' ? 'Tuman' : 'Район'}</label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          disabled={!region}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                        >
                          <option value="">{language === 'uz' ? 'Tumanni tanlang' : 'Выберите район'}</option>
                          {regions.find(item => item.id === region)?.districts.map(item => <option key={item.id} value={item.id}>{language === 'uz' ? item.nameUz : item.nameRu}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...') : t('save')}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="border border-gray-300 px-6 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">
                    {user.role === 'master' 
                      ? (language === 'uz' ? (aboutUz || user.aboutUz || 'Ma\'lumot kiritilmagan') : (aboutRu || user.aboutRu || 'Информация не добавлена'))
                      : (language === 'uz' ? 'Buyurtmachi' : 'Заказчик')}
                  </p>
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    {t('avatarTip') || 'Нажмите на фото, чтобы загрузить аватар'}
                  </p>
                </div>
              )}
            </div>

            {/* Services (for masters) */}
            {user.role === 'master' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{t('myServices')}</h2>
                  <button
                    onClick={() => {
                      setEditingService(null);
                      setNewService({ nameUz: '', nameRu: '', price: 0 });
                      setShowServiceModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'uz' ? 'Xizmat qo\'shish' : 'Добавить услугу'}
                  </button>
                </div>
                
                {services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'uz' 
                      ? 'Hozircha xizmatlar qo\'shilmagan. "Xizmat qo\'shish" tugmasini bosing.'
                      : 'Услуги пока не добавлены. Нажмите кнопку "Добавить услугу".'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <span className="font-medium text-gray-900">
                            {language === 'uz' ? service.nameUz : service.nameRu}
                          </span>
                          <span className="text-green-600 font-semibold ml-3">
                            {service.price.toLocaleString('ru-RU')} {t('sum')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editService(index)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteService(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('settings')}
              </h3>
              <nav className="space-y-2">
                <Link to="/profile/jobs" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span>{t('myJobs')}</span>
                </Link>
                <Link to="/profile/responses" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                  <span>{t('myResponses')}</span>
                </Link>
              </nav>
            </div>


          </div>
        </div>
      </div>

      {/* Modal for adding/editing service */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingService !== null 
                ? (language === 'uz' ? 'Xizmatni tahrirlash' : 'Редактировать услугу')
                : (language === 'uz' ? 'Yangi xizmat' : 'Новая услуга')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название (UZ)
                </label>
                <input
                  type="text"
                  value={editingService ? editingService.nameUz : newService.nameUz}
                  onChange={(e) => editingService 
                    ? setEditingService({ ...editingService, nameUz: e.target.value })
                    : setNewService({ ...newService, nameUz: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  placeholder="Santexnika o'rnatish"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название (RU)
                </label>
                <input
                  type="text"
                  value={editingService ? editingService.nameRu : newService.nameRu}
                  onChange={(e) => editingService
                    ? setEditingService({ ...editingService, nameRu: e.target.value })
                    : setNewService({ ...newService, nameRu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  placeholder="Установка сантехники"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('price')} ({t('sum')})
                </label>
                <input
                  type="number"
                  value={editingService ? editingService.price : newService.price}
                  onChange={(e) => editingService
                    ? setEditingService({ ...editingService, price: parseInt(e.target.value) || 0 })
                    : setNewService({ ...newService, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  placeholder="150000"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingService ? updateService : addService}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700"
              >
                {editingService ? t('save') : t('add')}
              </button>
              <button
                onClick={() => {
                  setShowServiceModal(false);
                  setEditingService(null);
                }}
                className="flex-1 border border-gray-300 py-2 rounded-xl font-semibold hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}