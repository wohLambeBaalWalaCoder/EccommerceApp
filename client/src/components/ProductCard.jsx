import { useState } from 'react';
import { Star, Heart, ShoppingBag, Check } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  isWishlisted = false,
  onToggleWishlist
}) {
  const [addedAnim, setAddedAnim] = useState(false);

  const primaryVariant = product.variants && product.variants.length > 0
    ? product.variants[0]
    : { price: 0, compareAtPrice: 0 };

  const currentPrice = primaryVariant.price || 0;
  const comparePrice = primaryVariant.compareAtPrice || 0;

  const discountPercent = comparePrice > currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  const primaryImg = product.images && product.images.length > 0
    ? product.images[0].url
    : '';

  const secondaryImg = product.images && product.images.length > 1
    ? product.images[1].url
    : primaryImg;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, primaryVariant);
    }
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product._id);
    }
  };

  // Format currency in Indian Rupee format
  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="product-card" onClick={() => onQuickView && onQuickView(product)}>
      {/* Image Container with Badges */}
      <div className="product-image-box">
        {/* Primary Image */}
        <img
          src={primaryImg}
          alt={product.name}
          className="product-img product-img-primary"
          loading="lazy"
        />

        {/* Secondary Image on Hover */}
        {secondaryImg && secondaryImg !== primaryImg && (
          <img
            src={secondaryImg}
            alt={`${product.name} alternate view`}
            className="product-img product-img-secondary"
            loading="lazy"
          />
        )}

        {/* Floating Badges */}
        <div className="product-badges">
          {discountPercent > 0 ? (
            <span className="discount-badge">-{discountPercent}%</span>
          ) : (
            <div></div>
          )}

          <button
            className={`wishlist-toggle ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? '#ffffff' : 'none'} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="product-body">
        {/* Category & Rating */}
        <div className="product-meta-row">
          <span className="product-category-tag">
            {product.categoryId ? product.categoryId.replace('_', ' ') : 'Tech'}
          </span>

          <div className="product-rating">
            <Star className="star-icon" />
            <span>{product.rating?.average || 4.5}</span>
            <span className="rating-count">({product.rating?.count || 120})</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {/* Description Snippet */}
        <p className="product-desc">{product.description}</p>

        {/* Footer with Price and Add to Cart */}
        <div className="product-footer">
          <div className="product-prices">
            <span className="price-current">{formatCurrency(currentPrice)}</span>
            {comparePrice > currentPrice && (
              <span className="price-compare">{formatCurrency(comparePrice)}</span>
            )}
          </div>

          <button
            className={`add-cart-btn ${addedAnim ? 'added' : ''}`}
            onClick={handleAdd}
          >
            {addedAnim ? (
              <>
                <Check size={15} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
