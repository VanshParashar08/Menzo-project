// ============================================================
// MENZO TABLE MANAGEMENT SERVICE (PRO ONLY)
// Manages table-to-QR mappings, table numbers, and deterministic QR URLs.
// Free restaurants have no table-specific QRs.
// ============================================================

import { getCurrentPlan, isFeatureAllowed, PLAN_TIERS } from './planService.js';
import { generateStyledQRCode, downloadCanvasPNG, generatePrintStandCanvas } from '../utils/qrHelper.js';

const STORAGE_KEY = 'menzo_restaurant_tables';

/**
 * Get all tables for a given restaurant
 * Falls back to default 10 tables for Pro demo if none exist
 */
export function getTables(restaurantId = 'default') {
  if (!isFeatureAllowed('table_qr')) {
    return [];
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${restaurantId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[TableService] Error loading tables:', e);
  }

  // Default seed: 8 tables for Pro user
  const defaultTables = Array.from({ length: 8 }, (_, i) => ({
    id: `table_${i + 1}`,
    tableNumber: i + 1,
    label: `Table ${i + 1}`,
    shortCode: `T${i + 1}`,
    status: 'active',
    createdAt: new Date().toISOString()
  }));

  saveTables(restaurantId, defaultTables);
  return defaultTables;
}

/**
 * Save tables list for a restaurant
 */
export function saveTables(restaurantId = 'default', tables = []) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${restaurantId}`, JSON.stringify(tables));
    window.dispatchEvent(new CustomEvent('menzo_tables_updated', { detail: { restaurantId, tables } }));
  } catch (e) {
    console.error('[TableService] Error saving tables:', e);
  }
}

/**
 * Configure exact table count (e.g. 5, 10, 20)
 */
export function setTableCount(arg1 = 'default', arg2 = 10) {
  if (!isFeatureAllowed('table_qr')) {
    throw new Error('Table QR generation is only available on the Pro plan. Pro plan required.');
  }

  let restaurantId = 'default';
  let count = 10;
  if (typeof arg1 === 'number') {
    count = arg1;
    restaurantId = typeof arg2 === 'string' ? arg2 : 'default';
  } else {
    restaurantId = typeof arg1 === 'string' ? arg1 : 'default';
    count = typeof arg2 === 'number' ? arg2 : parseInt(arg2, 10) || 10;
  }

  const cleanCount = Math.max(1, Math.min(100, count));
  const newTables = Array.from({ length: cleanCount }, (_, i) => ({
    id: `table_${i + 1}`,
    tableNumber: i + 1,
    name: `Table ${i + 1}`,
    label: `Table ${i + 1}`,
    shortCode: `T${i + 1}`,
    status: 'active',
    createdAt: new Date().toISOString()
  }));

  saveTables(restaurantId, newTables);
  return newTables;
}

/**
 * Add a single new table
 */
export function addTable(restaurantId = 'default', customLabel = '') {
  if (!isFeatureAllowed('table_qr')) {
    throw new Error('Table QR generation is only available on the Pro plan. Pro plan required.');
  }

  const tables = getTables(restaurantId);
  const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber || 0)) + 1 : 1;
  const newTable = {
    id: `table_${nextNum}`,
    tableNumber: nextNum,
    name: customLabel || `Table ${nextNum}`,
    label: customLabel || `Table ${nextNum}`,
    shortCode: `T${nextNum}`,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  tables.push(newTable);
  saveTables(restaurantId, tables);
  return newTable;
}

/**
 * Remove a table by ID
 */
export function removeTable(restaurantId = 'default', tableId) {
  if (!isFeatureAllowed('table_qr')) {
    throw new Error('Table QR generation is only available on the Pro plan. Pro plan required.');
  }

  let tables = getTables(restaurantId);
  tables = tables.filter(t => t.id !== tableId);
  saveTables(restaurantId, tables);
  return tables;
}

/**
 * Build deterministic customer URL for a specific table
 * Example: http://localhost:5173/menu.html?restaurant=Rohan's%20Café&t=3
 */
export function getTableMenuUrl(restaurantName, tableNumber, baseUrl = window?.location?.origin || 'http://localhost:5173') {
  const encRest = encodeURIComponent(restaurantName || "Rohan's Café");
  if (!tableNumber) {
    return `${baseUrl}/menu.html?restaurant=${encRest}`;
  }
  const cleanTable = String(tableNumber).replace(/^table[_\s-]*/i, '');
  return `${baseUrl}/menu.html?restaurant=${encRest}&t=${encodeURIComponent(cleanTable)}`;
}

/**
 * Resolves a table param from the URL (e.g. '3', 'T3', 'table_3') to normalized Table info
 */
export function resolveTableParam(tableParam) {
  if (!tableParam) return null;
  const clean = String(tableParam).trim().replace(/^table[_\s-]*/i, '').replace(/^t/i, '');
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num > 0) {
    return {
      id: `table_${num}`,
      tableId: `table_${num}`,
      name: `Table ${num}`,
      label: `Table ${num}`,
      tableNumber: num,
      shortCode: `T${num}`
    };
  }
  return {
    id: `table_${tableParam}`,
    tableId: `table_${tableParam}`,
    name: `Table ${tableParam}`,
    label: `Table ${tableParam}`,
    tableNumber: tableParam,
    shortCode: String(tableParam).toUpperCase()
  };
}
