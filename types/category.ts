export interface TypeData {
  _id?: string;
  name: string;
  slug: string;
}

export interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  section: string;
  icon: File | {
    secure_url: string;
    public_id: string;
  };
  currentIcon?: {
    secure_url: string;
    public_id: string;
  };
  types: TypeData[];
}
