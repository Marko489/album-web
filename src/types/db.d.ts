declare global {
  interface Album {
    id: string;
    name: string;
    created_at: Date;
    password_hash: string;
  }

  interface Photo {
    id: string;
    album_id: string;
    blob_url: string;
    description: string | null;
  }
}