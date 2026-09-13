import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import './CartDrawer.css';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  onCheckout
}) {
  if (!isOpen) return null;

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.variant?.price || item.product?.variants?.[0]?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const FREE_SHIPPING_THRESHOLD = 50000;
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const diffToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} color="#818cf8" />
            <span>Your Shopping Cart</span>
            <span className="cart-count-pill">{cartItems.length} items</span>
          </div>

          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="shipping-bar-box">
          <div className="shipping-bar-text">
            <Truck size={14} color="#818cf8" />
            <span>
              {subtotal >= FREE_SHIPPING_THRESHOLD
                ? '🎉 You unlocked FREE Express Delivery!'
                : `Add ${formatCurrency(diffToFreeShipping)} more for FREE Express Delivery`}
            </span>
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-fill"
              style={{ width: `${freeShippingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-scroll">
          {cartItems.length === 0 ? (
            <div className="cart-empty-view">
              <ShoppingBag className="cart-empty-icon" />
              <h3 style={{ color: '#f8fafc', marginBottom: 6, fontSize: 16 }}>Your cart is empty</h3>
              <p style={{ fontSize: 13, marginBottom: 20 }}>Looks like you haven't added any premium gadgets yet.</p>
              <button
                className="checkout-cta-btn"
                style={{ padding: '10px 20px', fontSize: 13 }}
                onClick={onClose}
              >
                Start Exploring
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const prod = item.product;
              const v = item.variant || prod.variants?.[0] || {};
              const imgUrl = prod.images?.[0]?.url || '';
              const variantLabel = v.attributes
                ? Object.values(v.attributes).join(' • ')
                : '';

              return (
                <div key={`${prod._id}_${v._id}`} className="cart-item-row">
                  <img src={imgUrl} alt={prod.name} className="cart-item-img" />

                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{prod.name}</h4>
                    {variantLabel && <span className="cart-item-variant">{variantLabel}</span>}

                    <div className="cart-item-bottom">
                      <span className="cart-item-price">
                        {formatCurrency((v.price || 0) * item.quantity)}
                      </span>

                      <div className="cart-item-qty">
                        <button
                          className="cart-qty-btn"
                          onClick={() => onUpdateQty(prod._id, v._id, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="cart-qty-num">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => onUpdateQty(prod._id, v._id, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        className="cart-item-remove"
                        onClick={() => onRemoveItem(prod._id, v._id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Estimated Shipping:</span>
              <span style={{ color: subtotal >= FREE_SHIPPING_THRESHOLD ? '#10b981' : '#cbd5e1' }}>
                {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : formatCurrency(499)}
              </span>
            </div>

            <div className="cart-total-row">
              <span>Total:</span>
              <span>
                {formatCurrency(
                  subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 499)
                )}
              </span>
            </div>

            <button className="checkout-cta-btn" onClick={onCheckout}>
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, color: '#64748b', fontSize: 11 }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Safe & Secure 256-Bit Encrypted Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
