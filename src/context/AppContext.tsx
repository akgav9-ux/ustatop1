import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Language } from '../i18n/translations';
import { User } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  user: User | null;
  setUser: (user: User | null) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('tashkent-city');
  const [selectedDistrict, setSelectedDistrict] = useState('chilonzor');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Загружаем пользователя из localStorage при запуске приложения
  useEffect(() => {
    const savedUser = localStorage.getItem('ustatop_user');
    const savedToken = localStorage.getItem('ustatop_token');
    if (savedUser && savedToken === 'true') {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Ошибка загрузки пользователя', e);
      }
    }
  }, []);

  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (isLoggedIn && user) {
      localStorage.setItem('ustatop_user', JSON.stringify(user));
      localStorage.setItem('ustatop_token', 'true');
    } else if (!isLoggedIn) {
      localStorage.removeItem('ustatop_user');
      localStorage.removeItem('ustatop_token');
    }
  }, [isLoggedIn, user]);

  const t = useCallback((key: string): string => {
    const translations: Record<string, Record<Language, string>> = {
      testModeHint: { uz: 'Kod qalqib chiquvchi oynada keladi (test rejimi)', ru: 'Код приходит в всплывающем окне (тестовый режим)' },
      // Для регистрации
      telegramId: { uz: 'Telegram ID', ru: 'Telegram ID' },
      telegramIdHint: { uz: 'Telegram ID ni qanday bilish mumkin: @userinfobot ga yozing → bot sizning ID yuboradi', ru: 'Как узнать Telegram ID: напишите @userinfobot → бот пришлёт ваш ID' },
      telegramIdRequired: { uz: 'Telegram ID ni kiriting', ru: 'Введите Telegram ID' },
      nameRequired: { uz: 'Ismingizni kiriting', ru: 'Введите ваше имя' },
      phoneRequired: { uz: 'Telefon raqamni kiriting', ru: 'Введите номер телефона' },
      invalidPhone: { uz: "O'zbekiston telefon raqamini to'g'ri kiriting (+998XXXXXXXXX)", ru: 'Введите корректный номер телефона Узбекистана в формате +998XXXXXXXXX' },
      onlyUzbekPhone: { uz: 'Faqat O\'zbekiston raqamlari uchun (+998XXXXXXXXX)', ru: 'Только для номеров Узбекистана (+998XXXXXXXXX)' },
      viaTelegram: { uz: 'Telegram orqali', ru: 'Через Telegram' },
      loginViaTelegram: { uz: 'Telegram orqali kirish', ru: 'Войти через Telegram' },
      byPhone: { uz: 'Telefon orqali', ru: 'По телефону' },
      codeTitle: { uz: 'UstaTop uchun tasdiqlash kodi', ru: 'Код подтверждения для UstaTop' },
      hello: { uz: 'Salom', ru: 'Привет' },
      yourCode: { uz: 'Sizning kodingiz', ru: 'Ваш код' },
      codeExpires: { uz: 'Kod 5 daqiqa amal qiladi. Hech kimga bermang!', ru: 'Код действителен 5 минут. Никому не сообщайте его!' },
      codeSentTo: { uz: 'Kod Telegram orqali yuborildi:', ru: 'Код отправлен в Telegram на ID:' },
      codeNotFound: { uz: 'Kod topilmadi. Yangi kod soʻrang', ru: 'Код не найден. Запросите новый код' },
      codeExpired: { uz: 'Kodning amal qilish muddati tugadi. Yangi kod soʻrang', ru: 'Срок действия кода истёк. Запросите новый код' },
      wrongCode: { uz: 'Noto\'g\'ri kod. Qaytadan urinib ko\'ring', ru: 'Неверный код. Попробуйте ещё раз' },
      telegramIdNotFound: { uz: 'Telegram ID topilmadi. ID ni to\'g\'ri kiritganingizga ishonch hosil qiling. ID ni @userinfobot dan bilib olishingiz mumkin', ru: 'Telegram ID не найден. Убедитесь, что вы ввели правильный ID. Узнать ID можно у @userinfobot' },
      serverError: { uz: 'Serverga ulanishda xatolik. Internetni tekshiring', ru: 'Не удалось подключиться к серверу. Проверьте интернет' },
      haveAccount: { uz: 'Hisobingiz bormi?', ru: 'Уже есть аккаунт?' },
      home: { uz: 'Bosh sahifa', ru: 'Главная' },
      jobs: { uz: 'Buyurtmalar', ru: 'Заявки' },
      masters: { uz: 'Ustalar', ru: 'Мастера' },
      messages: { uz: 'Xabarlar', ru: 'Сообщения' },
      favorites: { uz: 'Sevimlilar', ru: 'Избранное' },
      reviews: { uz: 'Sharhlar', ru: 'Отзывы' },
      notifications: { uz: 'Bildirishnomalar', ru: 'Уведомления' },
      wallet: { uz: 'Hamyon', ru: 'Кошелёк' },
      profile: { uz: 'Profil', ru: 'Профиль' },
      createJob: { uz: 'Buyurtma yaratish', ru: 'Создать заявку' },
      search: { uz: 'Usta yoki xizmat qidirish', ru: 'Поиск мастера или услуги' },
      region: { uz: 'Hudud', ru: 'Регион' },
      heroTitle: { uz: 'Istalgan ish uchun ishonchli usta toping', ru: 'Найдите проверенного мастера для любой работы' },
      heroSubtitle: { uz: 'Yoningizda minglab mutaxassislar. Tez, qulay va xavfsiz.', ru: 'Тысячи специалистов рядом с вами. Быстро, удобно и безопасно.' },
      createJobBtn: { uz: 'Buyurtma yaratish', ru: 'Создать заявку' },
      repairConstruction: { uz: "Ta'mirlash va qurilish", ru: 'Ремонт и строительство' },
      plumbing: { uz: 'Santexnika', ru: 'Сантехника' },
      electrical: { uz: 'Elektrika', ru: 'Электрика' },
      finishing: { uz: 'Pardozlash ishlari', ru: 'Отделочные работы' },
      furniture: { uz: 'Mebel buyurtma', ru: 'Мебель на заказ' },
      other: { uz: 'Boshqa kategoriyalar', ru: 'Другие категории' },
      freshJobs: { uz: 'Yangi buyurtmalar', ru: 'Свежие заявки' },
      viewAll: { uz: "Barchasini ko'rish", ru: 'Смотреть все' },
      responses: { uz: 'Javoblar', ru: 'Откликов' },
      today: { uz: 'Bugun', ru: 'Сегодня' },
      yesterday: { uz: 'Kecha', ru: 'Вчера' },
      sum: { uz: "so'm", ru: 'сум' },
      recommendedMasters: { uz: 'Tavsiya etilgan ustalar', ru: 'Рекомендуемые мастера' },
      online: { uz: 'Onlayn', ru: 'Онлайн' },
      recently: { uz: 'Yaqinda bo\'lgan', ru: 'Был недавно' },
      write: { uz: 'Yozish', ru: 'Написать' },
      review: { uz: 'sharh', ru: 'отзывов' },
      howItWorks: { uz: 'Bu qanday ishlaydi?', ru: 'Как это работает?' },
      step1Title: { uz: 'Buyurtma yarating', ru: 'Создайте заявку' },
      step1Desc: { uz: 'Nima qilish kerakligini yozing', ru: 'Опишите, что нужно сделать' },
      step2Title: { uz: 'Javoblarni oling', ru: 'Получайте отклики' },
      step2Desc: { uz: 'Ustalar xizmatlarini taklif qiladi', ru: 'Мастера предложат свои услуги' },
      step3Title: { uz: 'Eng yaxshisini tanlang', ru: 'Выберите лучшего' },
      step3Desc: { uz: 'Sharhlar va reytingni ko\'ring', ru: 'Смотрите отзывы и рейтинг' },
      step4Title: { uz: 'Ish bajarildi!', ru: 'Работа выполнена!' },
      step4Desc: { uz: 'Ustaga sharh qoldiring', ru: 'Оставьте отзыв мастеру' },
      becomeVIP: { uz: 'VIP-usta bo\'ling', ru: 'Станьте VIP-мастером' },
      vipDesc: { uz: "Ko'proq buyurtmalar va VIP buyurtmalarga kirish", ru: 'Больше заказов и доступ к VIP заявкам' },
      becomeVIPBtn: { uz: 'VIP bo\'lish', ru: 'Стать VIP' },
      topProfile: { uz: "TOPga kiring va ko'proq buyurtmalar oling", ru: 'Попадайте в ТОП и получайте больше заказов' },
      promoteProfile: { uz: 'Profilni rivojlantirish', ru: 'Продвинуть профиль' },
      login: { uz: 'Kirish', ru: 'Войти' },
      register: { uz: "Ro'yxatdan o'tish", ru: 'Регистрация' },
      phone: { uz: 'Telefon raqam', ru: 'Телефон' },
      phonePlaceholder: { uz: '+998 __ ___ __ __', ru: '+998 __ ___ __ __' },
      name: { uz: 'Ism', ru: 'Имя' },
      namePlaceholder: { uz: 'Ismingizni kiriting', ru: 'Введите ваше имя' },
      role: { uz: 'Rol', ru: 'Роль' },
      asCustomer: { uz: 'Buyurtmachi sifatida', ru: 'Как заказчик' },
      asMaster: { uz: 'Usta sifatida', ru: 'Как мастер' },
      sendCode: { uz: 'Kod yuborish', ru: 'Отправить код' },
      verifyCode: { uz: 'Kodni tasdiqlash', ru: 'Подтвердить код' },
      codePlaceholder: { uz: 'Kodni kiriting', ru: 'Введите код' },
      continue: { uz: 'Davom etish', ru: 'Продолжить' },
      back: { uz: 'Orqaga', ru: 'Назад' },
      myProfile: { uz: 'Mening profilim', ru: 'Мой профиль' },
      editProfile: { uz: 'Profilni tahrirlash', ru: 'Редактировать профиль' },
      aboutMe: { uz: 'Men haqimda', ru: 'Обо мне' },
      experience: { uz: 'Tajriba', ru: 'Опыт работы' },
      years: { uz: 'yil', ru: 'лет' },
      completedJobs: { uz: 'Bajarilgan buyurtmalar', ru: 'Выполненных заказов' },
      myServices: { uz: 'Xizmatlarim', ru: 'Мои услуги' },
      price: { uz: 'Narx', ru: 'Цена' },
      save: { uz: 'Saqlash', ru: 'Сохранить' },
      cancel: { uz: 'Bekor qilish', ru: 'Отмена' },
      jobType: { uz: 'Ish turi', ru: 'Тип работы' },
      area: { uz: 'Maydon', ru: 'Площадь' },
      sqm: { uz: 'm²', ru: 'м²' },
      deadline: { uz: 'Muddat', ru: 'Срок' },
      budget: { uz: 'Byudjet', ru: 'Бюджет' },
      published: { uz: "E'lon qilingan", ru: 'Опубликовано' },
      respondToJob: { uz: "Buyurtmaga javob berish", ru: 'Откликнуться на заявку' },
      writeCustomer: { uz: 'Buyurtmachiga yozish', ru: 'Написать заказчику' },
      fullTurnkey: { uz: "To'liq kalit ostida", ru: 'Ремонт под ключ' },
      about: { uz: 'Biz haqimizda', ru: 'О нас' },
      contact: { uz: 'Aloqa', ru: 'Контакты' },
      terms: { uz: 'Foydalanish shartlari', ru: 'Условия использования' },
      privacy: { uz: 'Maxfiylik siyosati', ru: 'Политика конфиденциальности' },
      allRights: { uz: 'Barcha huquqlar himoyalangan', ru: 'Все права защищены' },
      loading: { uz: 'Yuklanmoqda...', ru: 'Загрузка...' },
      error: { uz: 'Xatolik yuz berdi', ru: 'Произошла ошибка' },
      success: { uz: 'Muvaffaqiyatli', ru: 'Успешно' },
      noData: { uz: "Ma'lumot topilmadi", ru: 'Данные не найдены' },
      selectRegion: { uz: 'Hududni tanlang', ru: 'Выберите регион' },
      selectDistrict: { uz: 'Tumanni tanlang', ru: 'Выберите район' },
      tashkent: { uz: 'Toshkent', ru: 'Ташкент' },
      jobTitle: { uz: 'Sarlavha', ru: 'Заголовок' },
      description: { uz: 'Tavsif', ru: 'Описание' },
      jobTitlePlaceholder: { uz: 'Buyurtma sarlavhasini kiriting', ru: 'Введите заголовок заявки' },
      descriptionPlaceholder: { uz: 'Buyurtma tafsilotlarini yozing...', ru: 'Опишите детали заявки...' },
      selectCategory: { uz: 'Kategoriyani tanlang', ru: 'Выберите категорию' },
      budgetPlaceholder: { uz: 'Byudjetni kiriting', ru: 'Введите бюджет' },
      create: { uz: 'Yaratish', ru: 'Создать' },
      logout: { uz: 'Chiqish', ru: 'Выйти' },
      myJobs: { uz: 'Mening buyurtmalarim', ru: 'Мои заявки' },
      myResponses: { uz: 'Mening javoblarim', ru: 'Мои отклики' },
      settings: { uz: 'Sozlamalar', ru: 'Настройки' },
      language: { uz: 'Til', ru: 'Язык' },
      uzbek: { uz: "O'zbek", ru: 'Узбекский' },
      russian: { uz: 'Rus', ru: 'Русский' },
      masterProfile: { uz: 'Usta profili', ru: 'Профиль мастера' },
      services: { uz: 'Xizmatlar', ru: 'Услуги' },
      contactMaster: { uz: 'Usta bilan bog\'lanish', ru: 'Связаться с мастером' },
      call: { uz: 'Qo\'ng\'iroq qilish', ru: 'Позвонить' },
      sendMessage: { uz: 'Xabar yuborish', ru: 'Отправить сообщение' },
      rating: { uz: 'Reyting', ru: 'Рейтинг' },
      noJobs: { uz: 'Buyurtmalar yo\'q', ru: 'Заявок нет' },
      noMasters: { uz: 'Ustalar topilmadi', ru: 'Мастера не найдены' },
      filterByCategory: { uz: 'Kategoriya bo\'yicha filtrlash', ru: 'Фильтр по категории' },
      allCategories: { uz: 'Barcha kategoriyalar', ru: 'Все категории' },
      filterByRegion: { uz: 'Hudud bo\'yicha filtrlash', ru: 'Фильтр по региону' },
      allRegions: { uz: 'Barcha hududlar', ru: 'Все регионы' },
      sortBy: { uz: 'Saralash', ru: 'Сортировка' },
      newest: { uz: 'Eng yangi', ru: 'Новые' },
      cheapest: { uz: 'Arzon', ru: 'Дешевле' },
      expensive: { uz: 'Qimmat', ru: 'Дороже' },
      rating_high: { uz: 'Reyting bo\'yicha', ru: 'По рейтингу' },
      verified: { uz: 'Tasdiqlangan', ru: 'Проверенный' },
      vip: { uz: 'VIP', ru: 'VIP' },
      jobDetails: { uz: 'Buyurtma tafsilotlari', ru: 'Детали заявки' },
      workTypeLabel: { uz: 'Ish turi', ru: 'Тип работы' },
      areaLabel: { uz: 'Maydon', ru: 'Площадь' },
    };
    return translations[key]?.[language] || key;
  }, [language]);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      user,
      setUser,
      selectedRegion,
      setSelectedRegion,
      selectedDistrict,
      setSelectedDistrict,
      isLoggedIn,
      setIsLoggedIn,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}