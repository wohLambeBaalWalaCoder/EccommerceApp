import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  PackageSearch,
  Loader2,
  TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import './Shop.css';

const API_BASE_URL = 'http://localhost:5000/api';

const CATEGORY_NAMES = {
  category_001: 'Smartphones',
  category_002: 'Laptops & Workstations',
  category_003: 'Audio & Headphones',
  category_004: 'Smartwatches & Wearables',
  category_005: 'Tablets & E-Readers',
  category_006: 'Gaming & Consoles',
  category_007: 'Cameras & Drones',
  category_008: 'Monitors & Displays',
  category_009: 'PC Peripherals',
  category_010: 'Smart Home'
};

const PRICE_PRESETS = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under ₹30,000', min: 0, max: 30000 },
  { label: '₹30,000 - ₹75,000', min: 30000, max: 75000 },
  { label: '₹75,000 - ₹1,50,000', min: 75000, max: 150000 },
  { label: 'Above ₹1,50,000', min: 150000, max: 1000000 }
];

export default function Shop({ onNavigateToAuth, currentUser }) {
  // Products & Query State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceIdx, setSelectedPriceIdx] = useState(0);
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Categories list with counts
  const [categoriesList, setCategoriesList] = useState([]);

  // Cart & Wishlist State (persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ecommerce_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ecommerce_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI Overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Persist cart
  useEffect(() => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('ecommerce_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch category counts once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/categories`);
        if (res.data.success) {
          setCategoriesList(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy
      };

      if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
      if (selectedCategory) params.category = selectedCategory;

      const pricePreset = PRICE_PRESETS[selectedPriceIdx];
      if (pricePreset.min !== null) params.minPrice = pricePreset.min;
      if (pricePreset.max !== null) params.maxPrice = pricePreset.max;
      if (selectedRating) params.minRating = selectedRating;

      const res = await axios.get(`${API_BASE_URL}/products`, { params });

      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.pages || 1);
        setTotalProducts(res.data.total || 0);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Could not connect to backend server. Make sure server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, [page, searchKeyword, selectedCategory, selectedPriceIdx, selectedRating, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Toast Helper
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Cart operations
  const handleAddToCart = (product, variant, qty = 1) => {
    const v = variant || product.variants?.[0] || { _id: 'default', price: 0 };
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product._id === product._id && item.variant?._id === v._id
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      } else {
        return [...prev, { product, variant: v, quantity: qty }];
      }
    });

    showToast(`Added "${product.name}" to your cart!`);
  };

  const handleUpdateQty = (productId, variantId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, variantId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId && item.variant?._id === variantId) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId, variantId) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product._id === productId && item.variant?._id === variantId)
      )
    );
    showToast('Item removed from cart.');
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist! ❤️');
        return [...prev, productId];
      }
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setSelectedPriceIdx(0);
    setSelectedRating('');
    setSortBy('newest');
    setPage(1);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="shop-page">
      {/* Sticky Top Navbar */}
      <Navbar
        searchKeyword={searchKeyword}
        setSearchKeyword={(val) => {
          setSearchKeyword(val);
          setPage(1);
        }}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        currentUser={currentUser}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateToAuth={onNavigateToAuth}
        onNavigateHome={() => handleResetFilters()}
      />

      {/* Hero Banner with Category Quick Chips */}
      <section className="shop-hero">
        <div className="shop-hero-inner">
          <div className="shop-hero-badge">
            <Sparkles size={14} />
            <span>Curated Tech Catalog 2026</span>
          </div>

          <h1 className="shop-hero-title">Discover The Next Generation of Tech</h1>
          <p className="shop-hero-subtitle">
            Explore 100 hand-curated flagship smartphones, ultrabooks, audiophile sound, gaming rigs, and smart gadgets.
          </p>

          <div className="hero-chips-row">
            <button
              className={`hero-chip ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
            >
              <TrendingUp size={14} />
              <span>All Products</span>
            </button>

            {Object.entries(CATEGORY_NAMES).slice(0, 6).map(([catId, catName]) => (
              <button
                key={catId}
                className={`hero-chip ${selectedCategory === catId ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(selectedCategory === catId ? '' : catId);
                  setPage(1);
                }}
              >
                {catName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <main className="shop-main-container">
        {/* Left Filter Sidebar */}
        <aside className="shop-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              <Filter size={18} color="#818cf8" />
              <span>Filter Catalog</span>
            </h2>

            {(selectedCategory || selectedPriceIdx !== 0 || selectedRating || searchKeyword) && (
              <button className="sidebar-reset-btn" onClick={handleResetFilters}>
                <RotateCcw size={12} style={{ display: 'inline', marginRight: 4 }} />
                Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <h3 className="filter-section-title">Categories</h3>
            <div className="filter-options-list">
              <button
                className={`filter-pill-btn ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory('');
                  setPage(1);
                }}
              >
                <span>All Categories</span>
                <span className="filter-count">{totalProducts}</span>
              </button>

              {Object.entries(CATEGORY_NAMES).map(([catId, catName]) => {
                const countObj = categoriesList.find((c) => c.categoryId === catId);
                const count = countObj ? countObj.count : 10;
                return (
                  <button
                    key={catId}
                    className={`filter-pill-btn ${selectedCategory === catId ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === catId ? '' : catId);
                      setPage(1);
                    }}
                  >
                    <span>{catName}</span>
                    <span className="filter-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h3 className="filter-section-title">Price Range</h3>
            <div className="filter-options-list">
              {PRICE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  className={`filter-pill-btn ${selectedPriceIdx === idx ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPriceIdx(idx);
                    setPage(1);
                  }}
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h3 className="filter-section-title">Customer Rating</h3>
            <div className="filter-options-list">
              <button
                className={`filter-pill-btn ${selectedRating === '' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRating('');
                  setPage(1);
                }}
              >
                <span>All Ratings</span>
              </button>
              <button
                className={`filter-pill-btn ${selectedRating === '4.8' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRating('4.8');
                  setPage(1);
                }}
              >
                <span>⭐ 4.8 & Above</span>
              </button>
              <button
                className={`filter-pill-btn ${selectedRating === '4.5' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRating('4.5');
                  setPage(1);
                }}
              >
                <span>⭐ 4.5 & Above</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Products Section */}
        <section className="shop-products-section">
          {/* Toolbar */}
          <div className="catalog-toolbar">
            <div className="results-count-text">
              Showing <span className="results-count-highlight">{products.length}</span> of{' '}
              <span className="results-count-highlight">{totalProducts}</span> products
              {searchKeyword && <span> for "{searchKeyword}"</span>}
              {selectedCategory && <span> in {CATEGORY_NAMES[selectedCategory]}</span>}
            </div>

            <div className="toolbar-controls">
              <label htmlFor="sort-select" style={{ fontSize: 13, color: '#94a3b8' }}>
                Sort by:
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Error View */}
          {error && (
            <div className="empty-catalog-box">
              <PackageSearch className="empty-catalog-icon" color="#f43f5e" />
              <h3 className="empty-catalog-title" style={{ color: '#fca5a5' }}>
                Server Connection Issue
              </h3>
              <p className="empty-catalog-desc">{error}</p>
              <button className="page-btn" style={{ width: 'auto', padding: '0 20px' }} onClick={fetchProducts}>
                Retry Connection
              </button>
            </div>
          )}

          {/* Loading View */}
          {loading && !error && (
            <div className="empty-catalog-box" style={{ padding: '120px 24px' }}>
              <Loader2 className="empty-catalog-icon" style={{ animation: 'spin 1s linear infinite', color: '#818cf8' }} />
              <h3 className="empty-catalog-title">Loading Products...</h3>
              <p className="empty-catalog-desc">Fetching live gadget catalog from MongoDB database</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                  isWishlisted={wishlist.includes(product._id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}

          {/* Empty Search Results */}
          {!loading && !error && products.length === 0 && (
            <div className="empty-catalog-box">
              <PackageSearch className="empty-catalog-icon" />
              <h3 className="empty-catalog-title">No matching products found</h3>
              <p className="empty-catalog-desc">
                Try adjusting your search keyword, clearing active category filters, or broadening your price range.
              </p>
              <button
                className="checkout-cta-btn"
                style={{ maxWidth: 220 }}
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="pagination-row">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                title="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`page-btn ${page === num ? 'active' : ''}`}
                  onClick={() => {
                    setPage(num);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                >
                  {num}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                title="Next Page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          showToast('Checkout simulated! Payment integration ready.');
        }}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="shop-toast">
          <CheckCircle2 size={20} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
