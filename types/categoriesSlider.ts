import { Section } from "./section";

export interface CategoriesSliderProps {
  sections: {id: string, name: string}[];
  onCategorySelect: (section: Section) => void;
  onTypeSelect: (type: { name: string }, section: Section) => void;
}
