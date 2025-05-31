export interface Type {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: {
    secure_url: string;
    public_id: string;
  };
  applicableTypes?: Type[];
}

export interface Section {
  id?: string;
  name: string;
  section: string;
  slug: string;
  categories: Category[];
}
