export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
}
