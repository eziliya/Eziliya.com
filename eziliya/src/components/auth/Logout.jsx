import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Logout.module.css';

const Logout = ({ onLogout, className, children }) => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Clear user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('authToken');
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Call custom logout handler if provided
      if (onLogout) {
        await onLogout();
      }
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to login page
      navigate('/login', { replace: true });
      
      // Optional: Show success message
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred during logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <button
        onClick={handleLogoutClick}
        className={className || styles.logoutButton}
        disabled={isLoggingOut}
        aria-label="Logout"
      >
        {children || (
          <>
            <span className={styles.icon}>🚪</span>
            <span>Logout</span>
          </>
        )}
      </button>

      {showConfirmation && (
        <div className={styles.modalOverlay} onClick={handleCancelLogout}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Confirm Logout</h2>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Are you sure you want to logout? You will need to sign in again to access your account.
              </p>
            </div>
            
            <div className={styles.modalFooter}>
              <button
                onClick={handleCancelLogout}
                className={styles.cancelButton}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className={styles.confirmButton}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className={styles.spinner}></span>
                    Logging out...
                  </>
                ) : (
                  'Yes, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;

// Made with Bob
