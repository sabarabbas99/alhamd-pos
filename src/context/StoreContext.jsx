import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
} from '../data/initialData';

const StoreContext = createContext();

export const normalizePhone = (phone) => {
  if (!phone) return '';
  let clean = String(phone).replace(/\D/g, '');
  if (clean.startsWith('92') && clean.length >= 11) {
    clean = '0' + clean.slice(2);
  }
  return clean.replace(/^0+/, '');
};

export const isSamePhoneNumber = (phone1, phone2) => {
  const p1 = normalizePhone(phone1);
  const p2 = normalizePhone(phone2);
  if (!p1 || !p2 || p1.length < 7 || p2.length < 7) return false;
  return p1 === p2;
};

// Date Normalizer: Always extracts DD/MM/YYYY
export function normalizeDateToDDMMYYYY(dateInput) {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    const slashMatch = dateInput.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const d = slashMatch[1].padStart(2, '0');
      const m = slashMatch[2].padStart(2, '0');
      const y = slashMatch[3];
      return `${d}/${m}/${y}`;
    }
    const isoMatch = dateInput.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const y = isoMatch[1];
      const m = isoMatch[2].padStart(2, '0');
      const d = isoMatch[3].padStart(2, '0');
      return `${d}/${m}/${y}`;
    }
  }
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    const d = String(dateInput.getDate()).padStart(2, '0');
    const m = String(dateInput.getMonth() + 1).padStart(2, '0');
    const y = dateInput.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return '';
}

// Smart API Resolution
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      if (window.location.port === '5000') return '/api';
      return 'http://localhost:5000/api';
    }
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE = getApiBase();

// Pending Queue Helpers for Offline Resilience
const getPendingInvoices = () => {
  try {
    const q = localStorage.getItem('alhamd_pending_invoices');
    return q ? JSON.parse(q) : [];
  } catch {
    return [];
  }
};

const savePendingInvoices = (queue) => {
  try {
    localStorage.setItem('alhamd_pending_invoices', JSON.stringify(queue));
  } catch {}
};

export function StoreProvider({ children }) {
  const [dbConnected, setDbConnected] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  // 1. Settings
  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem('alhamd_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 2. Categories
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('alhamd_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // 3. Products
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('alhamd_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 4. Customers
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('alhamd_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // 5. Invoices
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('alhamd_invoices');
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  // 6. Current POS Cart
  const [cart, setCart] = useState([]);
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState(null);

  // Sync to LocalStorage as offline backup
  useEffect(() => {
    localStorage.setItem('alhamd_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('alhamd_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('alhamd_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('alhamd_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('alhamd_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Load All Data from MySQL Server + Flush Pending Offline Invoices
  const loadFromAPI = useCallback(async () => {
    // 1. Flush any pending offline queue first
    const pending = getPendingInvoices();
    if (pending.length > 0) {
      for (const inv of pending) {
        try {
          const syncRes = await fetch(`${API_BASE}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inv),
          });
          if (syncRes.ok) {
            const currentPending = getPendingInvoices().filter((x) => x.id !== inv.id);
            savePendingInvoices(currentPending);
          }
        } catch (e) {
          break; // Stop loop if server unreachable
        }
      }
    }

    // 2. Fetch full central data from server
    try {
      const res = await fetch(`${API_BASE}/all-data`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettingsState(data.settings);
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
        if (Array.isArray(data.customers) && data.customers.length > 0) {
          setCustomers(data.customers);
        }
        if (Array.isArray(data.invoices)) {
          // Merge server invoices with local so nothing is lost
          const serverInvMap = new Map(data.invoices.map((i) => [i.id, i]));
          setInvoices((prev) => {
            const merged = [...data.invoices];
            for (const localInv of prev) {
              if (!serverInvMap.has(localInv.id)) {
                merged.push(localInv);
              }
            }
            return merged;
          });
        }
        setDbConnected(true);
      } else {
        setDbConnected(false);
      }
    } catch (err) {
      // console.warn('Database server not reachable, using local storage cache:', err.message);
      setDbConnected(false);
    } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromAPI();
    // Live polling every 4 seconds keeps all browsers, tabs, and devices in 100% real-time sync
    const interval = setInterval(loadFromAPI, 4000);
    return () => clearInterval(interval);
  }, [loadFromAPI]);

  // Settings update
  const setSettings = async (newSettings) => {
    setSettingsState(newSettings);
    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.warn('API sync settings failed:', err.message);
    }
  };

  // Dynamic Category Addition
  const addCategory = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      try {
        await fetch(`${API_BASE}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed }),
        });
      } catch (err) {
        console.warn('API sync category failed:', err.message);
      }
    }
    return trimmed;
  };

  // Cart Operations with Toll / Grams / Weight Support
  const addToCart = (product, qty = 1, options = {}) => {
    const weightGrams =
      options.weightGrams !== undefined && options.weightGrams !== null
        ? Number(options.weightGrams)
        : null;

    const finalQty =
      weightGrams !== null
        ? Number((weightGrams / 1000).toFixed(3))
        : Number(qty);

    const weightLabel =
      weightGrams !== null
        ? weightGrams >= 1000
          ? `${weightGrams / 1000} kg`
          : `${weightGrams}g`
        : product.unit === 'kg' && finalQty !== 1
        ? `${finalQty} kg`
        : null;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.weightGrams === weightGrams
      );

      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, qty: Number((item.qty + finalQty).toFixed(3)) }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          salePrice: Number(product.salePrice),
          purchasePrice: Number(product.purchasePrice || 0),
          category: product.category,
          unit: product.unit || 'unit',
          qty: finalQty,
          weightGrams,
          weightLabel,
          maxStock: Number(product.stock !== undefined ? product.stock : 999),
        },
      ];
    });
  };

  // Update Cart Item Weight (Grams)
  const updateCartWeight = (cartIndex, newGrams) => {
    const gNum = Number(newGrams);
    if (gNum <= 0) return;
    const newQty = Number((gNum / 1000).toFixed(3));
    const label = gNum >= 1000 ? `${gNum / 1000} kg` : `${gNum}g`;

    setCart((prev) =>
      prev.map((item, idx) =>
        idx === cartIndex
          ? { ...item, qty: newQty, weightGrams: gNum, weightLabel: label }
          : item
      )
    );
  };

  // Quick Open Cash Item to Cart
  const addQuickOpenItemToCart = (name, price, qty = 1, options = {}) => {
    const pNum = Number(price);
    if (!name.trim() || pNum <= 0) return;
    const quickId = 'quick_' + Date.now();
    setCart((prev) => [
      ...prev,
      {
        id: quickId,
        name: name.trim(),
        salePrice: pNum,
        purchasePrice: Math.round(pNum * 0.9),
        category: 'Miscellaneous',
        unit: options.unit || 'item',
        qty: Number(qty) || 1,
        weightGrams: options.weightGrams || null,
        weightLabel: options.weightLabel || null,
        maxStock: 999,
        isQuickItem: true,
      },
    ]);
  };

  const updateCartQty = (productIdOrIndex, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productIdOrIndex);
      return;
    }
    setCart((prev) =>
      prev.map((item, idx) =>
        idx === productIdOrIndex || item.id === productIdOrIndex
          ? { ...item, qty: Number(newQty) }
          : item
      )
    );
  };

  const removeFromCart = (productIdOrIndex) => {
    setCart((prev) =>
      prev.filter((item, idx) => idx !== productIdOrIndex && item.id !== productIdOrIndex)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout / Complete Bill
  const checkoutBill = async ({
    customerId = null,
    customerName = 'Walk-in Customer',
    customerPhone = '',
    paymentMode = 'cash', // 'cash' | 'jazzcash' | 'easypaisa' | 'raast' | 'udhar'
    discount = 0,
    paidAmount = null,
  }) => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce(
      (sum, item) => sum + Math.round(item.salePrice * item.qty),
      0
    );
    const grandTotal = Math.max(0, subtotal - Number(discount));
    const isUdhar = paymentMode === 'udhar';
    const finalPaid = isUdhar ? Number(paidAmount || 0) : grandTotal;
    const udharAmount = isUdhar ? Math.max(0, grandTotal - finalPaid) : 0;

    const totalCost = cart.reduce(
      (sum, item) => sum + Math.round(item.purchasePrice * item.qty),
      0
    );
    const profit = grandTotal - totalCost;

    const newInvoiceNo = 'INV-' + (1000 + invoices.length + 1);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const formattedDate = `${dateStr} - ${timeStr}`;

    // 1. Create Invoice object
    const newInvoice = {
      id: newInvoiceNo,
      date: formattedDate,
      timestamp: now.toISOString(),
      customerId,
      customerName,
      customerPhone,
      paymentMode,
      items: cart.map((c) => ({
        id: c.id,
        name: c.name,
        price: c.salePrice,
        qty: c.qty,
        unit: c.unit,
        weightGrams: c.weightGrams || null,
        weightLabel: c.weightLabel || null,
        total: Math.round(c.salePrice * c.qty),
        isQuickItem: !!c.isQuickItem,
      })),
      subtotal,
      discount: Number(discount),
      grandTotal,
      paidAmount: finalPaid,
      udharAmount,
      profit,
    };

    // 2. Auto-Deduct Stock locally
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItemsForProd = cart.filter((c) => c.id === prod.id && !c.isQuickItem);
        if (cartItemsForProd.length > 0) {
          const totalDeduction = cartItemsForProd.reduce((sum, c) => sum + c.qty, 0);
          const updatedStock = Math.max(0, Number((prod.stock - totalDeduction).toFixed(2)));
          return { ...prod, stock: updatedStock };
        }
        return prod;
      })
    );

    // 3. Update or Create Customer Khata Ledger
    let finalCustId = customerId;
    let finalCustName = customerName;
    let finalCustPhone = customerPhone;

    if (isUdhar && udharAmount > 0) {
      let matchedCust = finalCustId ? customers.find((c) => c.id === finalCustId) : null;
      const cleanPhone = normalizePhone(finalCustPhone);
      if (!matchedCust && cleanPhone && cleanPhone.length >= 7) {
        matchedCust = customers.find((c) => isSamePhoneNumber(c.phone, finalCustPhone));
      }

      const itemNote =
        cart
          .map((c) => `${c.name}${c.weightLabel ? ` (${c.weightLabel})` : ''}`)
          .slice(0, 3)
          .join(', ') + (cart.length > 3 ? '...' : '');

      const newHistoryItem = {
        date: formattedDate,
        type: 'bill',
        billNo: newInvoiceNo,
        amount: udharAmount,
        note: itemNote,
      };

      if (matchedCust) {
        finalCustId = matchedCust.id;
        finalCustName = matchedCust.name;
        finalCustPhone = matchedCust.phone || finalCustPhone;

        const updatedBalance = Number(matchedCust.balance) + udharAmount;
        setCustomers((prev) =>
          prev.map((cust) =>
            cust.id === matchedCust.id
              ? {
                  ...cust,
                  balance: updatedBalance,
                  history: [newHistoryItem, ...(cust.history || [])],
                }
              : cust
          )
        );
      } else {
        finalCustId = 'c_' + Date.now();
        const newCustomerObj = {
          id: finalCustId,
          name: (finalCustName || 'Khata Customer').trim(),
          phone: (finalCustPhone || '').trim(),
          address: '',
          balance: udharAmount,
          history: [newHistoryItem],
        };

        setCustomers((prev) => [newCustomerObj, ...prev]);

        try {
          fetch(`${API_BASE}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCustomerObj),
          }).catch((err) => console.warn('Customer sync error:', err.message));
        } catch (e) {}
      }

      newInvoice.customerId = finalCustId;
      newInvoice.customerName = finalCustName;
      newInvoice.customerPhone = finalCustPhone;
    }

    // 4. Save Invoice locally immediately
    setInvoices((prev) => [newInvoice, ...prev.filter((i) => i.id !== newInvoice.id)]);
    setActiveInvoiceForPrint(newInvoice);

    // 5. Clear Cart
    clearCart();

    // 6. Sync to MySQL API Backend with Offline Queue Protection
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice),
      });

      if (!res.ok) {
        const pending = getPendingInvoices();
        if (!pending.find((p) => p.id === newInvoice.id)) {
          savePendingInvoices([...pending, newInvoice]);
        }
      }
    } catch (err) {
      console.warn('Invoice sync to MySQL offline, queued for background sync:', err.message);
      const pending = getPendingInvoices();
      if (!pending.find((p) => p.id === newInvoice.id)) {
        savePendingInvoices([...pending, newInvoice]);
      }
    }

    return newInvoice;
  };

  // Record Wasooli / Payment for Khata Customer
  const recordKhataPayment = async (customerId, amount, note = 'Cash Wasooli') => {
    const payNum = Number(amount);
    if (payNum <= 0) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const formattedDate = `${dateStr} - ${timeStr}`;

    setCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id === customerId) {
          const updatedBalance = Math.max(0, cust.balance - payNum);
          const historyItem = {
            date: formattedDate,
            type: 'payment',
            amount: payNum,
            note: note || 'Cash Payment Wasool',
          };
          return {
            ...cust,
            balance: updatedBalance,
            history: [historyItem, ...(cust.history || [])],
          };
        }
        return cust;
      })
    );

    try {
      await fetch(`${API_BASE}/customers/${customerId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payNum, note }),
      });
    } catch (err) {
      console.warn('Payment sync to MySQL failed:', err.message);
    }
  };

  // Product Single Add
  const addProduct = async (prodData) => {
    const id = 'p_' + Date.now();
    const newProd = {
      ...prodData,
      id,
      salePrice: Number(prodData.salePrice || 0),
      purchasePrice: Number(prodData.purchasePrice || 0),
      stock: Number(prodData.stock || 0),
      minStock: Number(prodData.minStock || 5),
      unit: prodData.unit || 'unit',
    };
    setProducts((prev) => [newProd, ...prev]);

    try {
      await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
    } catch (err) {
      console.warn('Product add sync to MySQL failed:', err.message);
    }
    return newProd;
  };

  // Product Bulk Add
  const addMultipleProducts = async (newList) => {
    if (!Array.isArray(newList) || newList.length === 0) return 0;
    const prepared = newList.map((item, idx) => ({
      id: 'p_' + Date.now() + '_' + idx,
      name: item.name.trim(),
      category: item.category || 'Miscellaneous',
      barcode: item.barcode || '',
      purchasePrice: Number(item.purchasePrice || 0),
      salePrice: Number(item.salePrice || 0),
      stock: Number(item.stock || 0),
      minStock: Number(item.minStock || 5),
      unit: item.unit || 'unit',
    }));
    setProducts((prev) => [...prepared, ...prev]);

    try {
      await fetch(`${API_BASE}/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: prepared }),
      });
    } catch (err) {
      console.warn('Bulk products sync to MySQL failed:', err.message);
    }
    return prepared.length;
  };

  const updateProduct = async (prodId, prodData) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === prodId
          ? {
              ...p,
              ...prodData,
              salePrice: Number(prodData.salePrice || p.salePrice),
              purchasePrice: Number(prodData.purchasePrice || p.purchasePrice),
              stock: Number(prodData.stock !== undefined ? prodData.stock : p.stock),
              minStock: Number(prodData.minStock !== undefined ? prodData.minStock : p.minStock),
            }
          : p
      )
    );

    try {
      await fetch(`${API_BASE}/products/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData),
      });
    } catch (err) {
      console.warn('Product update sync to MySQL failed:', err.message);
    }
  };

  const deleteProduct = async (prodId) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
    try {
      await fetch(`${API_BASE}/products/${prodId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Product delete sync to MySQL failed:', err.message);
    }
  };

  // Customer CRUD (with Phone Deduplication)
  const addCustomer = async (custData) => {
    const cleanPhone = normalizePhone(custData.phone);
    if (cleanPhone && cleanPhone.length >= 7) {
      const existing = customers.find((c) => isSamePhoneNumber(c.phone, custData.phone));
      if (existing) {
        const initialBal = Number(custData.initialBalance || 0);
        const updatedBal = Number(existing.balance) + initialBal;
        const historyItem =
          initialBal > 0
            ? [
                {
                  date: new Date().toLocaleDateString('en-GB'),
                  type: 'bill',
                  billNo: 'INITIAL',
                  amount: initialBal,
                  note: 'Purana Sabqa Baqaya (Initial Ledger)',
                },
              ]
            : [];

        const updatedCust = {
          ...existing,
          name: custData.name || existing.name,
          address: custData.address || existing.address,
          balance: updatedBal,
          history: [...historyItem, ...(existing.history || [])],
        };

        setCustomers((prev) => prev.map((c) => (c.id === existing.id ? updatedCust : c)));

        try {
          await fetch(`${API_BASE}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(custData),
          });
        } catch (err) {
          console.warn('Customer update sync failed:', err.message);
        }
        return updatedCust;
      }
    }

    const id = custData.id || ('c_' + Date.now());
    const initialBal = Number(custData.initialBalance || 0);
    const newCust = {
      ...custData,
      id,
      balance: initialBal,
      history:
        initialBal > 0
          ? [
              {
                date: new Date().toLocaleDateString('en-GB'),
                type: 'bill',
                billNo: 'INITIAL',
                amount: initialBal,
                note: 'Purana Sabqa Baqaya (Initial Ledger)',
              },
            ]
          : [],
    };
    setCustomers((prev) => [newCust, ...prev]);

    try {
      await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust),
      });
    } catch (err) {
      console.warn('Customer add sync to MySQL failed:', err.message);
    }
    return newCust;
  };

  // Low Stock Items
  const lowStockProducts = products.filter((p) => Number(p.stock) <= Number(p.minStock));

  // Today Statistics (Normalized DD/MM/YYYY match)
  const todayStr = normalizeDateToDDMMYYYY(new Date());
  const todayInvoices = invoices.filter((inv) => {
    const invDateStr = normalizeDateToDDMMYYYY(inv.date || inv.timestamp);
    return invDateStr === todayStr;
  });

  const todaySale = todayInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const todayCash = todayInvoices
    .filter((inv) => inv.paymentMode === 'cash')
    .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const todayJazzCash = todayInvoices
    .filter((inv) => inv.paymentMode === 'jazzcash')
    .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const todayEasypaisa = todayInvoices
    .filter((inv) => inv.paymentMode === 'easypaisa')
    .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const todayRaast = todayInvoices
    .filter((inv) => inv.paymentMode === 'raast')
    .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const todayUdhar = todayInvoices.reduce((sum, inv) => sum + (inv.udharAmount || 0), 0);
  const todayReceived = todayCash + todayJazzCash + todayEasypaisa + todayRaast;
  const todayProfit = todayInvoices.reduce((sum, inv) => sum + (inv.profit || 0), 0);

  const totalMarketUdhar = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <StoreContext.Provider
      value={{
        dbConnected,
        dbLoading,
        loadFromAPI,
        settings,
        setSettings,
        categories,
        addCategory,
        products,
        customers,
        invoices,
        cart,
        addToCart,
        updateCartWeight,
        addQuickOpenItemToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkoutBill,
        recordKhataPayment,
        addProduct,
        addMultipleProducts,
        updateProduct,
        deleteProduct,
        addCustomer,
        isSamePhoneNumber,
        normalizePhone,
        normalizeDateToDDMMYYYY,
        activeInvoiceForPrint,
        setActiveInvoiceForPrint,
        lowStockProducts,
        todaySale,
        todayCash,
        todayJazzCash,
        todayEasypaisa,
        todayRaast,
        todayUdhar,
        todayProfit,
        todayReceived,
        todayInvoicesCount: todayInvoices.length,
        totalMarketUdhar,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
