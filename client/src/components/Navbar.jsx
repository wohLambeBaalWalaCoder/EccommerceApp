import { ShoppingBag, Search, X, Heart, ShoppingCart, User as UserIcon } from 'lucide-react';
import './Navbar.css';

export default function Navbar({
  searchKeyword,
  setSearchKeyword,
  cartCount = 0,
  wishlistCount = 0,
  currentUser = null,
  onOpenCart,
  onNavigateToAuth,
  onNavigateHome
}) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="nav-brand" onClick={onNavigateHome}>
          <div className="nav-logo-badge">
            <ShoppingBag className="nav-logo-icon" />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-name">NEXUS</span>
            <span className="nav-brand-tag">Premium Tech</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="nav-search-wrapper">
          <Search className="nav-search-icon" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search iPhones, MacBooks, Sony, Drones..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button
              className="nav-search-clear"
              onClick={() => setSearchKeyword('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="nav-actions">
          {/* Wishlist Button */}
          <button className="nav-btn" title="View Wishlist">
            <Heart className="nav-btn-icon" />
            {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
          </button>

          {/* Cart Button */}
          <button className="nav-btn nav-btn-cart" onClick={onOpenCart} title="Open Cart">
            <ShoppingCart className="nav-btn-icon" />
            <span>Cart</span>
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </button>

          {/* User Profile or Sign In */}
          {currentUser ? (
            <div className="nav-user-pill" onClick={onNavigateToAuth} title="Account Settings">
              <div className="nav-user-avatar">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{currentUser.name.split(' ')[0]}</span>
            </div>
          ) : (
            <button className="nav-btn" onClick={onNavigateToAuth}>
              <UserIcon className="nav-btn-icon" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
