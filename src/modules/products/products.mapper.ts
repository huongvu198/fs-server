import { ProductEntity } from '../../entities/products.entity';

export class ProductMapper {
  static toDomain(raw: ProductEntity) {
    return {
      id: raw.id,
      name: raw.name,
      price: raw.price,
      description: raw.description,
      isActive: raw.isActive,
      isArchived: raw.isArchived,
      discount: raw.discount,
      totalQuantity: raw.totalQuantity,
      totalSoldQuantity: raw.totalSoldQuantity,
      totalInventory: raw.totalInventory,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      variants: raw.variants
        ? raw.variants.map((variant) => ({
            id: variant.id,
            color: variant.color,
            isActive: variant.isActive,
            sizes: variant.sizes
              ? variant.sizes.map((size) => ({
                  id: size.id,
                  size: size.size,
                  quantity: size.quantity,
                  soldQuantity: size.soldQuantity,
                  inventory: size.inventory,
                  isActive: size.isActive,
                }))
              : [],
            images: variant.images
              ? variant.images.map((image) => ({
                  id: image.id,
                  url: image.url,
                }))
              : [],
          }))
        : [],
    };
  }

  static toDomainList(rawList: ProductEntity[] | null) {
    if (!rawList || rawList.length === 0) return [];
    return rawList.map((raw) => this.toDomain(raw));
  }
}
