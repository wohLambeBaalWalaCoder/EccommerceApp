import { useState } from 'react';
import { X, Star, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import './ProductModal.css';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: '', alt: product.name }];

  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ price: 0, compareAtPrice: 0, sku: 'DEFAULT' }];

  const activeVariant = variants[selectedVariantIndex] || variants[0];
  const activeImg = images[selectedImgIndex]?.url || images[0]?.url;

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product, activeVariant, quantity);
    }
    setAddedAnim(true);
    setTimeout(() => {
      setAddedAnim(false);
      onClose();
    }, 900);
  };

  const discount = activeVariant.compareAtPrice > activeVariant.price
    ? Math.round(((activeVariant.compareAtPrice - activeVariant.price) / activeVariant.compareAtPrice) * 100)
    : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Gallery Column */}
        <div className="modal-gallery">
          <div className="modal-main-img-box">
            <img src={activeImg} alt={product.name} className="modal-main-img" />
          </div>

          {images.length > 1 && (
            <div className="modal-thumb-row">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`modal-thumb ${selectedImgIndex === i ? 'active' : ''}`}
                  onClick={() => setSelectedImgIndex(i)}
                >
                  <img src={img.url} alt={`Thumbnail ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="modal-details">
          <div className="modal-badge-row">
            <span className="modal-category-tag">
              {product.categoryId ? product.categoryId.replace('_', ' ') : 'Category'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: 13, fontWeight: 600 }}>
              <Star size={14} fill="#fbbf24" />
              <span>{product.rating?.average || 4.5}</span>
              <span style={{ color: '#64748b', fontWeight: 400 }}>({product.rating?.count || 120} reviews)</span>
            </div>
          </div>

          <h2 className="modal-title">{product.name}</h2>

          <div className="modal-price-row">
            <span className="modal-price-current">{formatCurrency(activeVariant.price)}</span>
            {activeVariant.compareAtPrice > activeVariant.price && (
              <>
                <span className="modal-price-compare">{formatCurrency(activeVariant.compareAtPrice)}</span>
                <span className="modal-discount-pill">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="modal-description">{product.description}</p>

          {/* Variants */}
          {variants.length > 1 && (
            <div>
              <div className="modal-section-label">Select Option / Specification:</div>
              <div className="modal-variants-list">
                {variants.map((v, idx) => {
                  const label = v.attributes
                    ? Object.values(v.attributes).join(' • ')
                    : `Option ${idx + 1}`;
                  return (
                    <button
                      key={v._id || idx}
                      className={`modal-variant-btn ${selectedVariantIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedVariantIndex(idx)}
                    >
                      {label} - {formatCurrency(v.price)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="modal-specs-box">
              <div className="modal-section-label">Technical Specs:</div>
              <div className="modal-specs-grid">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="spec-entry">
                    <span className="spec-key">{key}</span>
                    <span className="spec-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="modal-action-row">
            <div className="qty-counter">
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="qty-val">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              className="modal-add-btn"
              onClick={handleAdd}
              disabled={addedAnim}
            >
              {addedAnim ? (
                <>
                  <Check size={18} />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Add to Cart • {formatCurrency(activeVariant.price * quantity)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
