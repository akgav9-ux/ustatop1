export interface Region {
  id: string;
  nameUz: string;
  nameRu: string;
  districts: { id: string; nameUz: string; nameRu: string }[];
}

export type Category = {
  id: string;
  icon: string;      // ← теперь это путь к фото
  image?: string;    // можно добавить отдельно
  nameUz: string;
  nameRu: string;
  color: string;
};

export interface Master {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  category: string;
  rating: number;
  reviews: number;
  region: string;
  district: string;
  isOnline: boolean;
  isVerified: boolean;
  isVIP: boolean;
  descriptionUz: string;
  descriptionRu: string;
  experience: number;
  jobsCompleted: number;
  services: { nameUz: string; nameRu: string; price: number }[];
}

export interface Job {
  id: string;
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  budget: number;
  category: string;
  region: string;
  district: string;
  createdAt: string;
  responses: number;
  images: string[];
  status: 'open' | 'in_progress' | 'completed';
  authorId: string;
  area?: number;
  deadline?: string;
  workType: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'master';
  avatar: string;
  region: string;
  district: string;
  isVerified: boolean;
  isVIP: boolean;
  balance: number;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Review {
  id: string;
  masterId: string;
  customerId: string;
  customerName: string;
  rating: number;
  textUz: string;
  textRu: string;
  createdAt: string;
}
