export interface Brand {
  id: string;
  name: string;
}

export interface BrandModel {
  id: string;
  name: string;
  brandId: string;
}
