export interface AlbumItem {
  id: number;
  title: string;
  date: string;
  photoCount: number;
  description: string;
  location: string;
  participants: string[];
}

export const albumData: AlbumItem[] = [];
