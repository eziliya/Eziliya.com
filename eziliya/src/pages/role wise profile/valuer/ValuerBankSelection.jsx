import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ValuerBankSelection.module.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function ValuerBankSelection() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [draftCounts, setDraftCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Bank configuration with routes and categories
  const banks = [
    { 
      name: 'AU Small Finance', 
      route: '/ausmallfinanceform', 
      category: 'finance',
      icon: '🏦',
      hasDraftSupport: true,
      draftEndpoint: '/ausmall-finance-form/all?status=draft'
    },
    { name: 'Jana Bank', route: '/Jana', category: 'bank', icon: '🏦', hasDraftSupport: false },
    { name: 'Kotak Mahindra Bank', route: '/kotak', category: 'bank', icon: '🏦', hasDraftSupport: false },
    { name: 'IDFC Bank', route: '/Idfc', category: 'bank', icon: '🏦', hasDraftSupport: false },
    { name: 'Yes Bank', route: '/YesBank', category: 'bank', icon: '🏦', hasDraftSupport: false },
    { name: 'Jalgaon Janta Bank', route: '/JalgaonBank', category: 'bank', icon: '🏦', hasDraftSupport: false },
    { name: 'Cholamandalam Finance', route: '/Cholamandalam', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'Sundaram Finance', route: '/Sundaram', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'Godrej Capital', route: '/Godrejcapital', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'L&T Finance', route: '/LandTfinance', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'Ugro Capital Ltd', route: '/UgroCapital', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'Nido Finance', route: '/Nido', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'BHFL', route: '/Bhfl', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'Motilal Oswal Home Finance', route: '/MotilalOswalBank', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'Star Housing', route: '/StarHousing', category: 'housing', icon: '🏠', hasDraftSupport: false },
    { name: 'Capital India', route: '/CapitalIndia', category: 'finance', icon: '💰', hasDraftSupport: false },
    { name: 'Svatantra Housing Finance Corporation', route: '/SvatantraHousingFinanceCorporation', category: 'housing', icon: '🏠', hasDraftSupport: false },
    { name: 'Credit Saison India', route: '/CreditSaisitionIndia', category: 'finance', icon: '💰', hasDraftSupport: false },
  ];

  useEffect(() => {
    fetchDraftCounts();
  }, []);

  const fetchDraftCounts = async () => {
    try {
      const counts = {};

      // Get draft counts from localStorage (client-side only, no backend)
      const savedForms = localStorage.getItem('auSmallFinanceForms');
      if (savedForms) {
        const forms = JSON.parse(savedForms);
        const draftForms = forms.filter(form => form.status === 'draft');
        counts['AU Small Finance'] = draftForms.length;
      } else {
        counts['AU Small Finance'] = 0;
      }

      setDraftCounts(counts);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch draft counts:', err);
      setLoading(false);
    }
  };

  const handleBankSelect = (bank) => {
    navigate(bank.route);
  };

  const filteredBanks = banks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || bank.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Banks', icon: '🏢' },
    { value: 'bank', label: 'Banks', icon: '🏦' },
    { value: 'finance', label: 'Finance Companies', icon: '💰' },
    { value: 'housing', label: 'Housing Finance', icon: '🏠' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn} aria-label="Go back">
          ← Back
        </button>
        <h1 className={styles.pageTitle}>Select Bank / Financial Institution</h1>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search banks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className={styles.clearBtn}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.categoryFilters}>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`${styles.categoryBtn} ${selectedCategory === cat.value ? styles.active : ''}`}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total Banks:</span>
          <span className={styles.statValue}>{filteredBanks.length}</span>
        </div>
        {!loading && Object.keys(draftCounts).length > 0 && (
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Drafts:</span>
            <span className={styles.statValue}>
              {Object.values(draftCounts).reduce((sum, count) => sum + count, 0)}
            </span>
          </div>
        )}
      </div>

      {filteredBanks.length === 0 ? (
        <div className={styles.noResults}>
          <p>No banks found matching "{searchTerm}"</p>
          <button onClick={() => setSearchTerm('')} className={styles.resetBtn}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className={styles.banksGrid}>
          {filteredBanks.map((bank, index) => (
            <div
              key={index}
              className={styles.bankCard}
              onClick={() => handleBankSelect(bank)}
            >
              <div className={styles.bankIcon}>{bank.icon}</div>
              <div className={styles.bankInfo}>
                <h3 className={styles.bankName}>{bank.name}</h3>
                <span className={styles.bankCategory}>
                  {bank.category.charAt(0).toUpperCase() + bank.category.slice(1)}
                </span>
              </div>
              {bank.hasDraftSupport && draftCounts[bank.name] > 0 && (
                <div className={styles.draftBadge}>
                  {draftCounts[bank.name]} {draftCounts[bank.name] === 1 ? 'draft' : 'drafts'}
                </div>
              )}
              <div className={styles.arrowIcon}>→</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.infoSection}>
        <h3>📋 Instructions:</h3>
        <ul>
          <li>Select a bank to create a new valuation report</li>
          <li>Use the search bar to quickly find a specific bank</li>
          <li>Filter by category to narrow down your options</li>
          <li>Banks with draft support will show saved draft counts</li>
          <li>Click on any bank card to start creating a report</li>
        </ul>
      </div>
    </div>
  );
}

// Made with Bob
