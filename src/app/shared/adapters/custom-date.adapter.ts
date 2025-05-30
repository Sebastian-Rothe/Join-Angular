import { Injectable } from '@angular/core';
// Angular Material imports for date handling
import { NativeDateAdapter } from '@angular/material/core';

/**
 * Custom adapter for formatting dates in Angular Material components
 * 
 * @class CustomDateAdapter
 * @extends {NativeDateAdapter}
 * @description Provides custom date formatting functionality for Angular Material datepicker
 * and other date-related components. Formats dates in DD/MM/YYYY format.
 */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  /**
   * Formats a date into a string representation
   * 
   * @param {Date} date - The date object to format
   * @returns {string} The formatted date string in DD/MM/YYYY format
   * @override Overrides the default format method from NativeDateAdapter
   * @example
   * // returns "12/5/2025"
   * format(new Date('2025-05-12'))
   */
  override format(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}